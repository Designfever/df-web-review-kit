# Packed Installation E2E Matrix

Run the release-like installer matrix from a clean checkout:

```bash
pnpm test:e2e:pack
```

The script builds an `npm pack` artifact, creates temporary hosts outside the source tree, installs that tarball with npm, and deletes all fixtures when finished. It does not test against imports from the package checkout.

## Matrix

- Clean React + Vite JavaScript host: dry-run, init, doctor, typecheck, production build, idempotent rerun.
- Clean React + Vite TypeScript host: dry-run, init, doctor, typecheck, production build, idempotent rerun.
- Existing 0.8-style local integration: read-only migration preview, backup creation, apply, doctor, typecheck, production build, idempotent rerun.
- Generic custom adapter profile: local profile loading, generated wiring, doctor profile checks, typecheck, production build, idempotent rerun.
- User-owned generated-path conflict: exit code 1 and unchanged host files.
- Unsupported customized legacy integration: migration blocker, exit code 1, and unchanged host files.

## Verification Checklist

A successful run ends with `PACK_INSTALL_E2E_PASS` and one result line for every matrix entry. Before using this as v1.0 promotion evidence, confirm:

- the tarball was produced by `npm pack` in the same run;
- every successful fixture completed dependency install, `tsc --noEmit`, and `vite build`;
- clean init dry-runs and migration previews left host hashes unchanged;
- repeated init and migration produced no additional diff;
- migration created a manifest-backed backup before changing host files;
- conflict and unsupported-customization fixtures returned exit code 1 without changing host hashes;
- custom profile source and generated host files contain no private integration names, endpoints, or credentials.

This matrix covers the representative synthetic hosts required for v0.9. It does not replace the two real-host migration checks required before v1.0 promotion.
