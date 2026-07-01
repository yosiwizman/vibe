#!/usr/bin/env python3
"""
validate_edition.py — validate a PrivateNote edition config against editions/_schema/edition.schema.json.

Stdlib only (no pip). Minimal JSON-Schema subset check (required / type / pattern / nested
required) — the same lightweight style used elsewhere in this project. Also enforces the Therapist v1
safety invariant: features.soap_notes and features.cloud_ai MUST be false.

Usage:
  python3 scripts/edition/validate_edition.py [editions/therapist/edition.json]
Exit 0 on success, non-zero on any validation error.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
SCHEMA = os.path.join(ROOT, "editions", "_schema", "edition.schema.json")

TYPES = {"string": str, "boolean": bool, "object": dict, "array": list}


def check(obj, schema, path="<root>", errs=None):
    if errs is None:
        errs = []
    for req in schema.get("required", []):
        if not isinstance(obj, dict) or req not in obj:
            errs.append(f"{path}: missing required '{req}'")
    props = schema.get("properties", {})
    if isinstance(obj, dict):
        for k, v in obj.items():
            spec = props.get(k)
            if spec is None:
                if schema.get("additionalProperties") is False:
                    errs.append(f"{path}: unexpected property '{k}'")
                continue
            t = spec.get("type")
            types = t if isinstance(t, list) else [t]
            ok = any((tt == "null" and v is None) or (tt in TYPES and isinstance(v, TYPES[tt]) and not (tt == "string" and isinstance(v, bool))) for tt in types)
            if not ok:
                errs.append(f"{path}.{k}: wrong type (want {types}, got {type(v).__name__})")
                continue
            if isinstance(v, str):
                if "pattern" in spec and not re.match(spec["pattern"], v):
                    errs.append(f"{path}.{k}: '{v}' does not match {spec['pattern']}")
                if "minLength" in spec and len(v) < spec["minLength"]:
                    errs.append(f"{path}.{k}: shorter than minLength")
            if isinstance(v, dict) and "properties" in spec:
                check(v, spec, f"{path}.{k}", errs)
    return errs


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "editions", "therapist", "edition.json")
    try:
        schema = json.load(open(SCHEMA))
        ed = json.load(open(target))
    except Exception as exc:  # noqa: BLE001
        print(f"EDITION VALIDATE FAIL: cannot load ({exc})", file=sys.stderr)
        sys.exit(2)

    errs = check(ed, schema)
    # Therapist v1 safety invariant.
    feats = ed.get("features") or {}
    if feats.get("soap_notes") is not False:
        errs.append("features.soap_notes MUST be false for v1 (medical overlay)")
    if feats.get("cloud_ai") is not False:
        errs.append("features.cloud_ai MUST be false for v1")

    if errs:
        print("EDITION VALIDATE FAIL:")
        for e in errs:
            print("  -", e)
        sys.exit(1)
    print(f"EDITION VALIDATE OK: {os.path.relpath(target, ROOT)} (edition_id={ed.get('edition_id')}, "
          f"soap_notes={feats.get('soap_notes')}, cloud_ai={feats.get('cloud_ai')})")


if __name__ == "__main__":
    main()
