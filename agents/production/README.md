# Production agents (Tier 2)

Real-world agents built from [AGENT_CATALOG.md](../../AGENT_CATALOG.md) after Monid research.

| Agent | Port | Monid-backed tools |
|-------|------|-------------------|
| [p01-incident-triage](./p01-incident-triage/) | 3301 | `parse_logs`, `explain_error` |
| [p02-pr-review](./p02-pr-review/) | 3302 | `review_code`, `analyze_github_repo`, `generate_pr_description` |
| [p03-competitive-intel](./p03-competitive-intel/) | 3303 | `web_search`, `web_answer` |

All agents include generic `monid_discover` / `monid_inspect` / `monid_run` for extension.

```bash
bash scripts/setup.sh
cd agents/production/p01-incident-triage && npx eve dev --no-ui --port 3301
```