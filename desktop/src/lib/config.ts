export const updateVersionURL = 'https://github.com/thewh1teagle/vibe/releases/latest'
export const unsupportedCpuReadmeURL = 'https://thewh1teagle.github.io/vibe/docs#install'
export const storeFilename = 'app_config.json'
export const latestReleaseURL = 'https://github.com/thewh1teagle/vibe/releases/latest'
export const latestVersionWithoutVulkan = 'https://github.com/thewh1teagle/vibe/releases/download/v2.4.0/vibe_2.4.0_x64-setup.exe'

// Primary model is pinned to a fixed Hugging Face commit (immutable) rather than the mutable
// `resolve/main` ref, so the downloaded bytes can never change under us and can be integrity-checked
// against a known SHA256. Commit verified in handoff/lane_reports/lane_model_hash_evidence_rebuild_run25.md.
export const primaryModelUrl =
	'https://huggingface.co/ggerganov/whisper.cpp/resolve/5359861c739e955e79d9a303bcbc70fb988958b1/ggml-large-v3-turbo.bin'

// Non-primary Whisper models that flow through the setup download path are also pinned to fixed Hugging
// Face commits + verified fingerprints (same mechanism as the primary). Commits/SHA256 verified via
// Git-LFS metadata in handoff/lane_reports/lane_non_primary_model_integrity_classification_run27.md
// (medium lives at the same commit as the primary; hebrew's commit is its current main x-repo-commit).
export const mediumFallbackModelUrl =
	'https://huggingface.co/ggerganov/whisper.cpp/resolve/5359861c739e955e79d9a303bcbc70fb988958b1/ggml-medium.bin'
export const hebrewModelUrl =
	'https://huggingface.co/ivrit-ai/whisper-large-v3-turbo-ggml/resolve/2130c78e4a9cb4914cc4df91a1c3031407789705/ggml-model.bin'

export const modelUrls = {
	default: [
		primaryModelUrl,
		mediumFallbackModelUrl, // Fallback (pinned + verified)
	],
	hebrew: [hebrewModelUrl],
}

// Expected SHA256 fingerprints, keyed by download URL. Every model that reaches this map is verified
// HIGH-confidence against upstream Git-LFS metadata; on mismatch the Rust download path deletes the bad
// file and errors. A URL absent from this map is downloaded without hash enforcement (models whose
// download path is out of scope — VAD/diarize/ONNX — have no entry).
// `string | undefined` value type makes the sparse nature explicit: indexing by an arbitrary URL may
// return undefined (models with no entry), which callers treat as "no enforcement".
export const modelSha256: Record<string, string | undefined> = {
	[primaryModelUrl]: '1fc70f774d38eb169993ac391eea357ef47c88757ef72ee5943879b7e8e2bc69',
	[mediumFallbackModelUrl]: '6c14d5adee5f86394037b4e4e8b59f1673b6cee10e3cf0b11bbdbee79c156208',
	[hebrewModelUrl]: 'c8090411113357097bfafc2b8e228ec1639fa7f5fe4ecb5d054ac0ccef8641b1',
}

export const embeddingModelFilename = 'wespeaker_en_voxceleb_CAM++.onnx'
export const segmentModelFilename = 'segmentation-3.0.onnx'
export const embeddingModelUrl = 'https://github.com/thewh1teagle/vibe/releases/download/v0.0.1/wespeaker_en_voxceleb_CAM++.onnx'
export const segmentModelUrl = 'https://github.com/thewh1teagle/vibe/releases/download/v0.0.1/segmentation-3.0.onnx'

export const diarizeModelFilename = 'diar_streaming_sortformer_4spk-v2.1.onnx'
export const diarizeModelUrl = 'https://huggingface.co/altunenes/parakeet-rs/resolve/main/diar_streaming_sortformer_4spk-v2.1.onnx'
export const vadModelFilename = 'ggml-silero-v6.2.0.bin'
export const vadModelUrl = 'https://huggingface.co/ggml-org/whisper-vad/resolve/main/ggml-silero-v6.2.0.bin'

export const llmApiKeyUrl = 'https://console.anthropic.com/settings/keys'
export const llmDefaultMaxTokens = 8192 // https://docs.anthropic.com/en/docs/about-claude/models
export const llmLimitsUrl = 'https://console.anthropic.com/settings/limits'
export const llmCostUrl = 'https://console.anthropic.com/settings/cost'

export const ytDlpAssetNames: Record<string, string> = {
	'windows-x86_64': 'yt-dlp.exe',
	'windows-aarch64': 'yt-dlp_arm64.exe',
	'linux-x86_64': 'yt-dlp_linux',
	'linux-aarch64': 'yt-dlp_linux_aarch64',
	'macos-x86_64': 'yt-dlp_macos',
	'macos-aarch64': 'yt-dlp_macos',
}

export function ytDlpDownloadUrl(version: string, key: string): string {
	return `https://github.com/yt-dlp/yt-dlp/releases/download/${version}/${ytDlpAssetNames[key]}`
}

export const videoExtensions = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'webm', 'mxf']
export const audioExtensions = ['mp3', 'wav', 'aac', 'flac', 'oga', 'ogg', 'opic', 'opus', 'm4a', 'm4b', 'wma']
export const themes = ['light', 'dark']
