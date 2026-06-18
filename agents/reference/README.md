# Reference

**10 ported [vercel/eve](https://github.com/vercel/eve) e2e fixtures** — authoritative examples of eve
primitives with upstream evals.

Use these to learn the framework and run `eve eval --strict`, not as product templates.

```bash
bash scripts/setup.sh
cd agents/reference/agent-tools
npx eve eval --strict
npx eve dev --no-ui --port 3101
```

Port another upstream fixture:

```bash
bash scripts/port-eve-fixture.sh agent-tools-hitl
npm run validate:reference
```