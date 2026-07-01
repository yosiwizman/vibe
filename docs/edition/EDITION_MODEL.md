# PrivateNote Edition Model (scaffold)

**One engine, many editions.** An *edition* is pure configuration + assets under `editions/<id>/`,
layered over the untouched Vibe engine (`desktop/**`). This scaffold introduces the layer and its
guards **without touching the engine** — the app builds and behaves exactly as the v3.0.19 + cpal
baseline.

## Layout
```
editions/
  _schema/edition.schema.json   # contract (validated in CI)
  therapist/
    edition.json                # the Therapist edition config (config only)
    branding/                   # logo/icon/colors (placeholders)
    prompts/                    # note/summary presets (later)
    vocabulary/                 # therapy term hints (later)
    copy/privacy.md             # safe user-facing copy
scripts/edition/
  validate_edition.py           # schema-validate an edition config (stdlib)
  copy_linter.py                # deny-list: HIPAA/medical/legal claims
  brand_string_verifier.py      # report stray upstream brand strings (report-only in the scaffold)
```

## What this scaffold does NOT do
- Does **not** modify `desktop/**`, `tauri.conf.json`, identifiers, or product name (no rebrand).
- Does **not** remove telemetry or the updater.
- Does **not** enable SOAP notes or cloud AI (`features.soap_notes=false`, `features.cloud_ai=false`).
- Does **not** build, run, sign, or package anything.

## How an edition is applied (later, separately-reviewed slices)
- **Build-time identity** (product name, bundle identifier, deep-link, icon): a generator writes the
  edition's values into `tauri.conf.json` on a *rebrand branch* — a separate reviewed PR (milestone 2).
- **Run-time config** (prompts, vocabulary, export defaults, copy, feature flags): loaded at runtime
  from the bundled edition config — no engine fork.

## Safety
`features.soap_notes` and `features.cloud_ai` default **false** (maps to the registered
`MEDICAL_OR_COMPLIANCE_BLOCKED` overlay). `model.url` / `model.sha256` are `TODO` until the founder
supplies a pinned model; the download flow will verify SHA256 (milestone 6). Upstream MIT `LICENSE`
is retained; the About/Acknowledgements screen (milestone 2) credits "Built on Vibe (MIT)".
