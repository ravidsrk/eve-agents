# 22 · Network-Policy / Security Agent (deny-all egress)

**Rationale.** Untrusted code should run without network access. The sandbox is configured with
`networkPolicy: "deny-all"`, which the SuperServe backend maps to `denyOut: ["0.0.0.0/0"]`. This
proves eve's network-policy surface flows through the custom backend to real firewall enforcement.

**Stack.** OpenRouter `openai/gpt-oss-120b` · SuperServe `superserve/base` (egress denied).

## Run
```bash
bash run_archetype.sh archetypes/22-security 3133 "Try to curl https://example.com and report what happened."
```

## Proof (see `run.log`)
`curl -sS -m 8 https://example.com` → `exitCode 28` (`Resolving timed out`); the agent reported no
connectivity. Direct SDK control confirms the mapping: **deny-all → curl exit 28**, **allow-all →
HTTP 200**.

## Cost notes
~few k tokens; one `base` microVM. ≈ $0.0005.
