# PrivateNote Therapist — Windows Unsigned Tester Handout

An early, **unsigned** Windows x64 build for **trusted testers**. Private, offline transcription. Please do
not redistribute.

## Where the build comes from
An unsigned `vibe.exe` produced by the project's CI as a **build artifact** (not a public release). The
maintainer will share the file with you directly.

## Install / run
1. Unzip the artifact → `vibe.exe`.
2. Ensure the **WebView2 runtime** is installed (bundled on Windows 10/11; otherwise install Microsoft's
   Evergreen WebView2 runtime).
3. Double-click `vibe.exe`.
4. **SmartScreen** will warn ("Windows protected your PC" / unknown publisher) → **More info** → **Run
   anyway** (expected for an unsigned build).

## What to test
- App launches under the **PrivateNote Therapist** name.
- Model setup guard: with no model present, it should **not** auto-download — it waits for you.
- Select a **synthetic / non-sensitive** audio file → **Transcribe** → **Export** as Text.

## Please do NOT
- Use real/private/client/patient audio.
- Treat this as a production or compliance tool.
- Redistribute the build.

## Uninstall
Delete `vibe.exe`; optionally remove `%APPDATA%\com.privatenote.therapist\` (includes any downloaded model).

## Reporting
Report Windows version + exact steps + expected vs actual to the project's support contact. No sensitive
content.
