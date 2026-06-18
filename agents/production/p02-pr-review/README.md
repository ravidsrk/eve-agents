# P02 — PR review

Engineering agent: GitHub repo health, AI code review on diffs, PR description generation.

## Monid endpoints

| Tool | Provider | Endpoint | ~Cost |
|------|----------|----------|-------|
| `review_code` | api.strale.io | `/x402/code-review` | $0.24 |
| `analyze_github_repo` | api.strale.io | `/x402/github-repo-analyze` | $0.06 |
| `generate_pr_description` | api.strale.io | `/x402/pr-description-generate` | $0.011 |

Discovered via `npm run research:monid` (queries: "pull request code review", "repository codebase analysis").

## Run

```bash
bash scripts/setup.sh
cd agents/production/p02-pr-review
npx eve dev --no-ui --port 3302
```

Example: *"Review this diff for security issues"* (paste unified diff) or *"Analyze https://github.com/vercel/eve and suggest review focus areas."*