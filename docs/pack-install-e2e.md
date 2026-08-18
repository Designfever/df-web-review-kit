# Packed Installation E2E Matrix

Run the release-like installer matrix from a clean checkout:

```bash
pnpm test:e2e:pack
```

The script builds an `npm pack` artifact, creates temporary hosts outside the source tree, installs that tarball with npm, and deletes all fixtures when finished. It does not test against imports from the package checkout.

## Matrix

- Vite + React host: dry-run remains read-only, init creates only `df.ts`, the CLI prints the Vite guide, rerun is idempotent, and a manually added host route passes doctor/typecheck/build.
- Next.js host: framework detection prints the Next.js guide without generating a route.
- Existing legacy integration: `doctor --fix --yes` reports the manual route migration blocker and leaves the host unchanged.
- Removed custom-provider init option: exit code 1 and unchanged host files.

## Verification Checklist

A successful run ends with `PACK_INSTALL_E2E_PASS` and one result line for every matrix entry. Before using this as v1.0 promotion evidence, confirm:

- the tarball was produced by `npm pack` in the same run;
- the successful Vite fixture completed dependency install, `tsc --noEmit`, and `vite build`;
- init dry-run and blocked migration left host hashes unchanged;
- repeated init produced no additional diff;
- no fixture received generated `/review`, router, Vite, provider, or environment code;
- the removed custom option returned exit code 1 without changing the host.

This matrix covers the framework-neutral v0.10 installer boundary. It does not replace real-host review-page verification.
