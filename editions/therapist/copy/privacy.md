# PrivateNote Therapist — Privacy Copy (safe strings only)

Approved user-facing copy for the Therapist edition. **Safe claims only** — no compliance,
medical-grade, or legal claims.

## Allowed

- Private, offline transcription. Recordings stay on your computer.
- Your audio and transcripts never leave your device.
- One-time purchase. No accounts, no cloud, no subscriptions.
- Works fully offline after the initial model download.

## Forbidden (never use)

- "HIPAA" / "HIPAA compliant"
- "medical-grade" / "clinical-grade"
- "legally compliant" / "compliant with <regulation>"
- any claim of regulatory certification or medical/legal fitness

These forbidden strings are enforced by `scripts/edition/copy_linter.py` (deny-list).
