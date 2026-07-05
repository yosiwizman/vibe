# PrivateNote Therapist — Beta Release Notes

## Beta (unsigned, trusted testers)
Private, offline transcription for macOS (Apple silicon) and Windows (x64).

### Highlights
- On-device transcription — recordings stay on your computer; no cloud transcription.
- Plain-text transcript export by default.
- First-run model download is user-initiated (no silent large download) and integrity-checked: the primary
  and fallback speech models are pinned to fixed versions and verified by SHA256; corrupted/altered
  downloads are rejected.
- macOS unsigned `.app` and Windows unsigned `.exe` available to trusted testers.

### Known limitations
- Unsigned / not notarized — macOS and Windows show "unverified publisher" warnings (open via right-click →
  Open on macOS, or More info → Run anyway on Windows).
- Local trusted-tester beta only; not a public release.
- Tested with synthetic audio only.

### Not a compliance product
Not HIPAA-compliant, medical-grade, legally compliant, or attorney-client safe; no diagnosis/treatment/
billing or clinical-note automation.

### Acknowledgements
Built on [Vibe](https://github.com/thewh1teagle/vibe) and whisper.cpp (MIT).
