# Agents

**75 [Vercel eve](https://vercel.com/docs/eve) agents** in four directories.

| Directory | Count | Use when |
| --- | ---: | --- |
| [`catalog/`](catalog/) | 50 | You want a real-world job template to fork |
| [`reference/`](reference/) | 10 | You want upstream vercel/eve fixtures + evals |
| [`production/`](production/) | 10 | You want deeper agents with custom tools |
| [`integrations/`](integrations/) | 5 | You need HITL, Slack, durability, or swarm proofs |

```bash
npm run catalog:list
bash scripts/run-catalog-agent.sh agents/catalog/01-revenue-analyst 3201 "Write a report."
cd agents/reference/agent-tools && npx eve eval --strict
```