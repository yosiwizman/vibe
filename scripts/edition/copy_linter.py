#!/usr/bin/env python3
"""
copy_linter.py — deny-list linter for user-facing edition copy.

Fails if any forbidden compliance/medical/legal claim appears in SHIPPABLE copy. Shippable copy =
the edition config's `privacy_copy` field + `copy/*.txt` approved-string files. Markdown docs
(e.g. copy/privacy.md) are documentation (they list the forbidden examples on purpose) and are NOT
linted here.

Stdlib only. Usage:
  python3 scripts/edition/copy_linter.py [editions/therapist]
Exit 0 if clean, non-zero if a forbidden claim is found in shippable copy.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))

# Deny-list (case-insensitive, word-ish). Kept conservative and explicit.
FORBIDDEN = [
    r"\bHIPAA\b",
    r"\bmedical[- ]grade\b",
    r"\bclinical[- ]grade\b",
    r"\blegally compliant\b",
    r"\bfully compliant\b",
    r"\bcompliant with\b",
    r"\bregulatory (?:approval|certification)\b",
    r"\bFDA[- ]?(?:approved|cleared)\b",
]
PAT = re.compile("|".join(FORBIDDEN), re.IGNORECASE)


def scan_text(label, text, hits):
    for i, line in enumerate(text.splitlines(), 1):
        m = PAT.search(line)
        if m:
            hits.append(f"{label}:{i}: forbidden claim '{m.group(0)}' -> {line.strip()[:80]}")


def main():
    base = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "editions", "therapist")
    hits = []

    ed = os.path.join(base, "edition.json")
    if os.path.exists(ed):
        try:
            pc = (json.load(open(ed)) or {}).get("privacy_copy", "")
            scan_text(os.path.relpath(ed, ROOT) + "#privacy_copy", pc, hits)
        except Exception as exc:  # noqa: BLE001
            print(f"COPY LINT WARN: could not read {ed}: {exc}")

    copy_dir = os.path.join(base, "copy")
    if os.path.isdir(copy_dir):
        for name in sorted(os.listdir(copy_dir)):
            p = os.path.join(copy_dir, name)
            # Only *.txt are shippable approved-string files; *.md are documentation (not linted).
            if os.path.isfile(p) and name.lower().endswith(".txt"):
                try:
                    scan_text(os.path.relpath(p, ROOT), open(p, encoding="utf-8").read(), hits)
                except Exception:  # noqa: BLE001
                    pass

    if hits:
        print("COPY LINT FAIL: forbidden claims in shippable copy:")
        for h in hits:
            print("  -", h)
        sys.exit(1)
    print("COPY LINT OK: no forbidden compliance/medical/legal claims in shippable copy.")


if __name__ == "__main__":
    main()
