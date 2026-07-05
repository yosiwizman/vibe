# PrivateNote Therapist — Beta README

**Private, offline transcription for professionals.** Turn audio into text entirely on your own computer.
No cloud transcription required.

> Early, **unsigned** beta for **trusted testers**. Please test with **non-sensitive audio only**. Your
> recordings and transcripts stay on your computer.

## Status
- **macOS:** unsigned `.app` (Apple silicon). Opens, transcribes, and exports plain text.
- **Windows:** unsigned `vibe.exe` (x64), built in CI. Available to trusted testers as a build artifact.

## Install / open
- **macOS:** the app is unsigned — right-click the app → **Open** → **Open** (a plain double-click is
  blocked for unsigned apps).
- **Windows:** SmartScreen will warn ("unknown publisher") → **More info** → **Run anyway**. Requires the
  WebView2 runtime (bundled on Windows 10/11).

## Speech model download & integrity
On first run the app downloads a speech model (~1.5 GB) **only when you choose to**. Each download is pinned
to a fixed model version and verified against a known SHA256 fingerprint; a corrupted or altered download is
rejected automatically.

## Export
Plain text (`.txt`) is the default. Other formats (e.g. `.srt`) are available in the app.

## Privacy
Recordings stay on your computer. Transcription runs on-device/offline — nothing is uploaded for
transcription.

## Not a compliance product
This is a transcription tool. It is **not** HIPAA-compliant, medical-grade, legally compliant, or
attorney-client safe, and it does **not** provide diagnosis, treatment, billing, or clinical-note automation.

## Known limitations
Unsigned and not notarized (OS shows warnings); local trusted-tester beta only; Apple silicon (macOS) +
x64 (Windows); tested with synthetic audio only.

## Acknowledgements / license
Built on the open-source [Vibe](https://github.com/thewh1teagle/vibe) and whisper.cpp projects under their
MIT licenses. Distributed builds retain upstream license and attribution.

## Support
Use the project's designated support contact for install/run help. Do not include sensitive content in
reports.
