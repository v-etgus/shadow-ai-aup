# Shadow-AI Discovery and AUP Enforcer

Solo-V Track 03. Memory engine is the vendored H-MEM reference in `vendor/hmem`. Do not swap it out.

## Constraints

- Keep H-MEM as the vendor (`vendor/hmem`). Route remember/ask-style work through named H-MEM services.
- No Scout Intent.
- Synthetic data only (fixtures under `fixtures/`, with `data/` as a fallback).
- `SAMPLE_MODE` must work offline: no live LLM, no API keys, no network. The critic is rule-based.
- Do not call Nightshift from this pipeline.

## Pipeline

`intake → retrieve → critic → act → mine`

| Stage | What it does |
|---|---|
| intake | Load synthetic proxy/DNS rows, SaaS inventory, AUP classes |
| retrieve | `hmem.query` for past decisions about the destination/app |
| critic | Score `allow` \| `review` \| `block` with reasons |
| act | Emit a JSON decision record |
| mine | Write the decision via `hmem.mine` (remember/mine path) |

Run: `npm run sample` (sets `SAMPLE_MODE=1`).
