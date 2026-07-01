#!/usr/bin/env python3
"""
brand_string_verifier.py — report stray upstream brand strings in user-facing surfaces.

In the edition-overlay SCAFFOLD (this PR) the engine is untouched, so this is REPORT-ONLY: it counts
occurrences of the upstream brand ("Vibe"/"vibe") in user-facing surfaces (locales + desktop/src)
and always exits 0. After the rebrand slice (milestone 2) run with --strict to FAIL if any stray
upstream brand string remains in a rebranded surface.

Stdlib only. Usage:
  python3 scripts/edition/brand_string_verifier.py [--strict]
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
SURFACES = [
    os.path.join(ROOT, "desktop", "src-tauri", "locales"),
    os.path.join(ROOT, "desktop", "src"),
]
BRAND = re.compile(r"\bvibe\b", re.IGNORECASE)
EXTS = (".json", ".ts", ".tsx", ".js", ".jsx")


def main():
    strict = "--strict" in sys.argv[1:]
    total = 0
    per = {}
    for surface in SURFACES:
        if not os.path.isdir(surface):
            continue
        for dp, _dn, fn in os.walk(surface):
            if "node_modules" in dp:
                continue
            for f in fn:
                if not f.endswith(EXTS):
                    continue
                p = os.path.join(dp, f)
                try:
                    n = len(BRAND.findall(open(p, encoding="utf-8", errors="ignore").read()))
                except Exception:  # noqa: BLE001
                    n = 0
                if n:
                    per[os.path.relpath(p, ROOT)] = n
                    total += n

    print(f"BRAND STRINGS: {total} occurrence(s) of upstream brand across {len(per)} user-facing file(s).")
    for p, n in sorted(per.items(), key=lambda kv: -kv[1])[:15]:
        print(f"  {n:4d}  {p}")
    if strict and total:
        print("BRAND VERIFY FAIL (--strict): stray upstream brand strings remain.")
        sys.exit(1)
    print("BRAND VERIFY OK (report-only in the scaffold; use --strict after the rebrand slice).")


if __name__ == "__main__":
    main()
