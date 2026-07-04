use crate::error::LogError;
use eyre::{Context, Result};
use futures_util::StreamExt;
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};
use tauri::{Emitter, Listener, Manager};

use super::ui::set_progress_bar;

// Stream the file at `path` through SHA256 and return the lowercase hex digest. Reads in chunks so a
// multi-GB model never has to be held in memory at once.
fn sha256_file(path: &str) -> Result<String> {
    use sha2::{Digest, Sha256};
    use std::io::Read;
    let mut file = std::fs::File::open(path).context(format!("Failed to open {} for hashing", path))?;
    let mut hasher = Sha256::new();
    let mut buf = [0u8; 1024 * 1024];
    loop {
        let n = file.read(&mut buf).context("Error while reading file for hashing")?;
        if n == 0 {
            break;
        }
        hasher.update(&buf[..n]);
    }
    Ok(hex::encode(hasher.finalize()))
}

// Verify the file at `path` against `expected` (hex SHA256). On mismatch the bad file is deleted and an
// error is returned, so a corrupted/tampered download is never treated as valid. Comparison is
// case-insensitive and whitespace-trimmed. Extracted from the download command so it is unit-testable
// without any network access.
fn verify_model_sha256(path: &str, expected: &str) -> Result<()> {
    let expected = expected.trim().to_lowercase();
    let actual = sha256_file(path)?;
    if actual != expected {
        tracing::error!("Model hash mismatch for {}: expected {}, got {}", path, expected, actual);
        // Delete the bad file, but only claim it was deleted if the removal actually succeeded — a
        // permission/lock failure must not be reported as a clean deletion.
        match std::fs::remove_file(path) {
            Ok(()) => eyre::bail!(
                "Downloaded model failed integrity check (SHA256 mismatch); the bad file was deleted. Please try again."
            ),
            Err(e) => {
                tracing::error!("Failed to delete bad model file {}: {}", path, e);
                eyre::bail!(
                    "Downloaded model failed integrity check (SHA256 mismatch). The bad file could NOT be removed automatically ({}); please delete it manually and try again: {}",
                    e,
                    path
                )
            }
        }
    }
    tracing::info!("Model SHA256 verified for {}", path);
    Ok(())
}

#[tauri::command]
pub async fn download_model(
    app_handle: tauri::AppHandle,
    url: String,
    path: String,
    expected_sha256: Option<String>,
) -> Result<String> {
    tracing::debug!("Download model invoked! with path {}", path);

    let abort_atomic = Arc::new(AtomicBool::new(false));
    let abort_atomic_c = abort_atomic.clone();

    let app_handle_c = app_handle.clone();

    let app_handle_d = app_handle_c.clone();
    app_handle.listen("abort_download", move |_| {
        set_progress_bar(&app_handle_d, None).log_error();
        abort_atomic_c.store(true, Ordering::Relaxed);
    });

    let client = reqwest::Client::new();
    let res = client.get(&url).send().await?.error_for_status()?;
    let total_size = res.content_length().unwrap_or(0);
    let mut file = std::fs::File::create(&path).context(format!("Failed to create file {}", path))?;
    let mut downloaded: u64 = 0;
    let callback_limit: u64 = 1024 * 1024 * 2;
    let mut callback_offset: u64 = 0;
    let mut stream = res.bytes_stream();

    while let Some(item) = stream.next().await {
        if abort_atomic.load(Ordering::Relaxed) {
            break;
        }
        let chunk = item.context("Error while downloading file")?;
        use std::io::Write;
        file.write_all(&chunk)
            .context(format!("Error while writing to file {}", path))?;
        downloaded += chunk.len() as u64;
        if total_size > 0 && downloaded > callback_offset + callback_limit {
            let percentage = (downloaded as f64 / total_size as f64) * 100.0;
            tracing::trace!("percentage: {}", percentage);
            set_progress_bar(&app_handle_c, Some(percentage)).log_error();
            if let Some(window) = app_handle_c.get_webview_window("main") {
                window.emit("download_progress", (downloaded, total_size)).log_error();
            }
            callback_offset = downloaded;
        }
    }
    set_progress_bar(&app_handle, None)?;

    // Integrity check (primary model only — callers pass an expected fingerprint just for the pinned
    // primary model). Skip when the download was aborted: the file is partial by design. On mismatch,
    // verify_model_sha256 deletes the bad file and returns an error so it is never treated as valid.
    if !abort_atomic.load(Ordering::Relaxed) {
        if let Some(expected) = expected_sha256 {
            drop(file); // ensure all bytes are flushed to disk before hashing
            verify_model_sha256(&path, &expected)?;
        }
    }
    Ok(path)
}

#[tauri::command]
pub async fn download_file(app_handle: tauri::AppHandle, url: String, path: String) -> Result<()> {
    tracing::debug!("Download file invoked! with path {}", path);

    let abort_atomic = Arc::new(AtomicBool::new(false));
    let abort_atomic_c = abort_atomic.clone();

    let app_handle_c = app_handle.clone();

    let app_handle_d = app_handle_c.clone();
    app_handle.listen("abort_download", move |_| {
        set_progress_bar(&app_handle_d, None).log_error();
        abort_atomic_c.store(true, Ordering::Relaxed);
    });

    let client = reqwest::Client::new();
    let res = client.get(&url).send().await?.error_for_status()?;
    let total_size = res.content_length().unwrap_or(0);
    let mut file = std::fs::File::create(&path).context(format!("Failed to create file {}", path))?;
    let mut downloaded: u64 = 0;
    let callback_limit: u64 = 1024 * 1024 * 2;
    let mut callback_offset: u64 = 0;
    let mut stream = res.bytes_stream();

    while let Some(item) = stream.next().await {
        if abort_atomic.load(Ordering::Relaxed) {
            break;
        }
        let chunk = item.context("Error while downloading file")?;
        use std::io::Write;
        file.write_all(&chunk)
            .context(format!("Error while writing to file {}", path))?;
        downloaded += chunk.len() as u64;
        if total_size > 0 && downloaded > callback_offset + callback_limit {
            let percentage = (downloaded as f64 / total_size as f64) * 100.0;
            tracing::trace!("percentage: {}", percentage);
            if let Some(window) = app_handle_c.get_webview_window("main") {
                window.emit("download_progress", (downloaded, total_size)).log_error();
            }
            callback_offset = downloaded;
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{sha256_file, verify_model_sha256};
    use std::io::Write;
    use std::sync::atomic::{AtomicU32, Ordering};

    static COUNTER: AtomicU32 = AtomicU32::new(0);

    // Unique temp path per test invocation — no network, no app handle required.
    fn temp_path() -> String {
        let n = COUNTER.fetch_add(1, Ordering::Relaxed);
        let mut p = std::env::temp_dir();
        p.push(format!("pnt_sha_test_{}_{}.bin", std::process::id(), n));
        p.to_string_lossy().into_owned()
    }

    fn write_file(path: &str, bytes: &[u8]) {
        let mut f = std::fs::File::create(path).unwrap();
        f.write_all(bytes).unwrap();
    }

    #[test]
    fn sha256_of_known_bytes() {
        // "abc" -> well-known SHA256 test vector.
        let path = temp_path();
        write_file(&path, b"abc");
        let got = sha256_file(&path).unwrap();
        assert_eq!(got, "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn verify_passes_and_keeps_file_on_match() {
        let path = temp_path();
        write_file(&path, b"abc");
        let expected = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
        assert!(verify_model_sha256(&path, expected).is_ok());
        assert!(std::path::Path::new(&path).exists(), "good file must be kept");
        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn verify_is_case_insensitive_and_trims() {
        let path = temp_path();
        write_file(&path, b"abc");
        // uppercase + surrounding whitespace must still match
        let expected = "  BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD  ";
        assert!(verify_model_sha256(&path, expected).is_ok());
        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn verify_fails_and_deletes_file_on_mismatch() {
        let path = temp_path();
        write_file(&path, b"corrupted-or-tampered-bytes");
        // expected hash is for "abc", which does NOT match the file's contents
        let expected = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
        let result = verify_model_sha256(&path, expected);
        assert!(result.is_err(), "mismatch must return an error");
        assert!(
            !std::path::Path::new(&path).exists(),
            "bad file must be deleted on mismatch"
        );
    }
}
