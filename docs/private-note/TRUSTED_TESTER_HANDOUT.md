# PrivateNote Therapist — Trusted Tester Handout (macOS)

Thank you for testing an early, **unsigned** build. This is for **trusted testers** only — please do not
redistribute it.

## What it is
A private, offline transcription app for macOS (Apple silicon). Audio never leaves your computer.

## Install / open
1. Copy `PrivateNote Therapist.app` to your **Applications** folder (or anywhere).
2. **First open:** right-click (Control-click) the app → **Open** → **Open**. (Unsigned apps are blocked on a
   plain double-click.)
3. If prompted on first run, choose **Download** to fetch the speech model (~1.5 GB, one time). Nothing
   downloads until you ask.

## What to test
- App opens under the **PrivateNote Therapist** name.
- Select a **synthetic / non-sensitive** audio file → **Transcribe** → **Export** as Text.
- Confirm the transcript and the exported `.txt` look correct.

## Please do NOT
- Use real/private/client/patient audio.
- Treat this as a production or compliance tool.

## Expected warning
macOS may say the developer "cannot be verified" — expected for an unsigned beta. Use right-click → Open.

## Uninstall
Delete the app; optionally remove `~/Library/Application Support/com.privatenote.therapist/` (includes any
downloaded model).

## Reporting
Report macOS version + exact steps + expected vs actual to the project's support contact. No sensitive
content.
