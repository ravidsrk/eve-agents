# Monid research notes

Date: 2026-06-18

The supplied Monid key was validated with live `discover` and `inspect` calls. No secrets are stored
in this file.

## Useful endpoint classes discovered

| Agent area | Representative endpoints | Pricing observed |
| --- | --- | --- |
| Company/news/business research | `tikhub/api/v1/linkedin/web_v2/get_company_posts`, `tikhub/api/v1/linkedin/web/search_posts` | `$0.0015-$0.006` per call |
| Social sentiment | `tikhub/api/v1/twitter/web/fetch_trending`, `blockrun.ai/api/v1/surf/search/social/posts` | `$0.0015-$0.00825` per call |
| Finance/market news | `blockrun.ai/api/v1/pm/markets/listings`, `tikhub/api/v1/linkedin/web_v2/get_company_stock_quote` | `$0.0011-$0.0015` per call |
| Travel operations | `openweather-coral.vercel.app/weather/current`, `api.strale.io/x402/flight-status` | `$0.0022-$0.059401` per call |
| Security CVE triage | `api.strale.io/x402/cve-lookup` | `$0.011` per call |
| Ecommerce | `akta/v1/company/product-reviews`, Amazon/Google Shopping Apify endpoints | `$0.00135-$0.0075` per result |
| Literature/research | `blockrun.ai/api/v1/exa/search`, `tikhub/api/v1/zhihu/web/fetch_scholar_search_v3` | `$0.0015-$0.011` per call |
| Sales enrichment | `pdl/v5/company/enrich`, `pdl/v5/person/enrich`, `akta/v1/company/enrichment` | `$0.1-$0.3` per call, or `$0.125` per result |
| Support/docs search | `exa/search`, `blockrun.ai/api/v1/exa/search` | `$0.01-$0.011` per call |

## Representative inspect results

`blockrun.ai/api/v1/exa/search`

- Purpose: neural and keyword web search.
- Supports category filters such as `company`, `research paper`, `news`, `pdf`, `github`, `tweet`,
  `personal site`, `linkedin profile`, and `financial report`.
- Required input: JSON body with `query`.
- Price observed: `$0.011` per call.

`api.strale.io/x402/cve-lookup`

- Purpose: vulnerability lookup via OSV.
- Inputs: `package_name`, `version`, optional `ecosystem`.
- Price observed: `$0.011` per call.

`openweather-coral.vercel.app/weather/current`

- Purpose: current weather by city or lat/lon.
- Inputs: `city`, or `lat`/`lon`.
- Price observed: `$0.0022` per call.

`akta/v1/company/product-reviews`

- Purpose: company product catalog and per-product reviews.
- Required input: `company`; optional `products`, `limit`, `offset`.
- Price observed: `$0.0015` per result.

`pdl/v5/company/enrich`

- Purpose: firmographic enrichment from name, website, LinkedIn, ticker, or address fields.
- Price observed: `$0.1` per call.

## Best first integrations

The generated catalog currently includes a guarded generic `fetch_live_json` tool and the existing
`@lab/monid-tools` package. The highest-value Monid-specific follow-up tools are:

- `company_research` for sales lead researcher, competitor intelligence, market/news briefing.
- `social_search` for social sentiment monitor.
- `cve_lookup` for security CVE triager and dependency upgrade planner.
- `weather_status` for travel operations and logistics.
- `product_reviews` for ecommerce merchandising analyst.
- `web_search` for support/RAG/literature mapping.
