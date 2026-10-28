# Shadow-AI Discovery and AUP Enforcer

**Open Agent Hackathon 2026 · Track 03 — Reasoning Architecture · Team Solo-V**

Finds unsanctioned AI tool use in proxy and DNS logs, checks it against the SaaS inventory and AUP data classes, and decides **allow / review / block**. Demo uses **synthetic** fixtures only.

## Quick start (SAMPLE_MODE — no credentials)

    npm install
    npm run setup
    set SAMPLE_MODE=true
    npm run sample

(PowerShell: `$env:SAMPLE_MODE="true"`)

Expected: allow, review, and block each appear once; assertion passes. With Nightshift running and `METERLESS_*` set, the same command also prints `nightshift=ok` and the Nemotron model id.

## Stack

- **Data:** Zetaris (live Docker optional); SAMPLE_MODE uses `fixtures/`
- **Engine:** Meterless H-MEM (MVP)
- **Power:** Meterless Nightshift → NVIDIA Nemotron 3.5 Lightning 30B
- **Build:** Cursor

Scout Intent is roadmap only — not wired in this submission.

## Layout

- `src/aup/` — intake → retrieve → critic → act → mine
- `src/meterless.ts` — Nightshift client
- `fixtures/` — synthetic proxy/DNS, SaaS inventory, AUP classes, prior decisions
- `scripts/meterless-smoke.ts` — optional Runtime smoke test

## Env (see `.env.example`)

- `SAMPLE_MODE=true` — offline decision path
- `METERLESS_BASE_URL`, `METERLESS_RUNTIME_TOKEN`, `METERLESS_MODEL` — Nightshift
- `ZETARIS_*` — only for live Zetaris path

Never commit `.env`. NVIDIA keys stay in Nightshift Providers only.

## AI and model usage

- Nightshift is the primary AI provider.
- Demo model id: `nvidia/nemotron-3.5-lightning-30b-a3b`
- Developed with Cursor; Victor owns and can explain generated code.

## Limitations

- Synthetic data only (no real corporate logs/HR).
- SAMPLE_MODE critic is rule-based (`llm=off`); Nightshift round-trip is proven at end of `npm run sample` when Runtime is up.
- Scout Intent signed-contract gate not implemented.

## License

Apache-2.0
