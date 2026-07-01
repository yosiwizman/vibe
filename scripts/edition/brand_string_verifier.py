#!/usr/bin/env python3
"""
brand_string_verifier.py — report stray upstream brand strings in user-facing surfaces.

This is REPORT-ONLY: it counts occurrences of the upstream brand ("Vibe"/"vibe") in user-facing
surfaces (locales + desktop/src) and always exits 0 without --strict.

Rebrand FIRST SLICE (this PR) applies the identity layer to the app-shell surfaces only —
tauri.conf.json productName + identifier, index.html <title> + description, the two src-tauri window
titles, and the hotkey notification titles. Those surfaces are intentionally OUT of this counter's
scan set (it scans locales + desktop/src TS/JSX), so a non-zero count here is EXPECTED and healthy:
it is the backlog of upstream strings (locale catalogs, config.ts upstream URLs) that later, separately
reviewed rebrand slices will migrate. Run with --strict only once the FULL rebrand is complete to FAIL
if any stray upstream brand string remains.

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
    print("BRAND VERIFY OK (report-only; rebrand first slice done — remaining counts are the expected "
          "locale/config backlog for later slices; use --strict only after the FULL rebrand).")


if __name__ == "__main__":
    main()
