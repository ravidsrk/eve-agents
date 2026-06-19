# OPS Actions (recorded, not executed by swarm)

## Human-owned gates
- **BASE → main promotion:** merge `ravidsrk/adversarial-fresh` via meta-PR (out of scope for automation).
- **Production deploy:** no deploy was triggered by this run (merge ≠ deploy).

## DEP-001 — Toolchain mirror (VERIFY_AT_SCALE)
- **Finding:** `@typescript/native-preview` dev build may be unpublished from npm.
- **Code shipped:** CI `typecheck` job runs `npx tsgo --version` after `npm ci` to fail early on unresolvable toolchain.
- **OPS:** Mirror or vendor `tsgo` binary; add Renovate/Dependabot for pre-release pins.

## SEC-001 — Alert webhook secret
- **OPS:** Set `ALERT_WEBHOOK_SECRET` on Vercel project `eve-incident-commander` and rotate if exposed.

## Deployed eval acceptance (VERIFY_AT_SCALE)
- Live `eval:deployed:flagship` may hit Vercel AI Gateway free-tier limits; code fixes validated via structure tests + fixtures only.