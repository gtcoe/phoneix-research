# Phoenix Research — Project Brief

**Version:** 2.1 | **Date:** April 2026 | **Author:** Garvit Tyagi | **Status:** Design-complete, backend not yet built

> **v2.1 amendments (mentor review):** Added explicit server-ownership / localStorage boundary rule (§3); clarified Holding-Level Alpha backend spec with per-asset benchmark window, exclusions, non-summation note (§4 Compare Tab 3); enriched `journal_entries` schema with `entry_type`, `occurred_at`, `related_asset_id`, `related_cashflow_id`, `tags` (§6); added `last_alert_triggered_at` to `watchlist_items`, changed `report_slug` to `report_id` FK (§6); replaced count-based diversification score with HHI concentration score in Health Score formula (§9); added explicit scope disclaimers to Tax P&L model (§10); added concrete edge-case rules for dividends, partial exits, US-stock FX basis, synthetic cashflows, XIRR non-convergence (§7); corrected dashboard scalability description from "no live joins" to cache-assembled (§18).

> **v2.0 changes from v1.0:** Data truth model corrected (cashflows are authoritative for equity, not the asset row); 9 screens (Journal added); Analysis expanded to 8 tabs; Tools expanded to 6 tabs; Watchlist gains since-added tracking; Health Score ring on Dashboard; Conviction Alerts panel on Dashboard; 24 DB tables (was 19); new sections: Position Accounting Model, Metric Definitions, Health Score Formula, Tax P&L Model, Goal Planning, Auth Hardening, Alert Semantics, Job Design, Caching Strategy, Decisions Log.

---

## 1. Project Vision

Phoenix Research is a **personal investment research and portfolio tracking platform** built as a multi-user web application — simultaneously a production-grade SaaS project and a learning vehicle for building scalable Java backend systems.

**What the platform does:**

- Gives every user a professional-grade view of their investment portfolio with metrics most retail investors never see — XIRR, alpha vs benchmark, drawdown, correlation, health score
- Hosts curated deep-dive stock research reports (HTML analyses authored by Garvit)
- Provides discipline-enforcing tools: quarterly review checklists, what-if simulations, target price tracking, rebalancing guidance, tax P&L estimation, goal-based planning
- Records the user's trade journal — every buy, sell, and thinking note — so the reasoning behind each decision is preserved

**What makes this different from Zerodha Kite or Groww:**

- **XIRR** — cashflow-weighted annualised return; the only metric that accounts for _when_ you deployed capital, not just how much you made
- **Portfolio Health Score** — composite 0–100 score (XIRR + Alpha + Conviction + Diversity + Drawdown) that gives a single signal on portfolio quality
- **Conviction scoring** per holding — stored and tracked over time with full history
- **Trade Journal** — chronological log of every decision with the reasoning captured at entry time
- **Quarterly review workflow** — structured checklist to re-examine every investment thesis per quarter
- **Correlation and drawdown analytics** — normally only available on institutional platforms
- **Integrated research** — the portfolio and the research reports are one product

---

## 2. User Model

**Multi-user SaaS.** Every user registers and tracks their own independent portfolio.

- Research reports are **public, curated content** authored by the admin (Garvit)
- Portfolio, watchlist, journal, quarterly reviews, notes, risk flags, goals, and rebalance targets are **private per-user**
- Future roadmap: social features (public portfolio sharing, community annotations on reports)

**Authentication:**

- Email + password (BCrypt hashed — never stored plain)
- Google OAuth
- Both methods can be linked to the same account
- JWT access token (15-min TTL) + rotating refresh token (30-day TTL, stored in `refresh_tokens` table)

**Scale target:** Architected for 1 lakh (100,000) active users.

---

## 3. Tech Stack

| Layer               | Technology                                                              | Reasoning                                                                |
| ------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Frontend**        | Next.js 16, TypeScript, Tailwind v4                                     | Modern, SSG-capable, fast                                                |
| **Backend**         | Spring Boot 3.x, Java 21 LTS                                            | Primary learning objective; enterprise patterns                          |
| **Architecture**    | **Monolith** with clean package separation                              | Microservices at this scale is over-engineering                          |
| **Database**        | PostgreSQL 16 + **TimescaleDB** extension                               | Time-series partitioning without a separate database                     |
| **Cache**           | Redis 7                                                                 | Live prices (5-min TTL), XIRR (1-hr TTL), correlation matrix (24-hr TTL) |
| **Price — Phase 1** | Yahoo Finance (delayed EOD)                                             | Free, sufficient for development                                         |
| **Price — Phase 2** | Upstox/ICICI Direct real-time WebSocket + Yahoo Finance bulk historical | Official APIs, reliable                                                  |
| **Auth**            | Spring Security + JWT (access + refresh token pair)                     | Industry standard; stateless access tokens, revocable refresh tokens     |
| **Migrations**      | Liquibase                                                               | Versioned, reproducible schema changes                                   |
| **Hosting**         | Local dev → Docker Compose (cloud-deployable from day one)              |                                                                          |

### Persistence Boundaries — Prototype vs Production

The frontend prototype uses `localStorage` for some state for development convenience. That is intentional for prototyping only. The production rule is hard:

**Only UI view preferences belong in `localStorage`. All portfolio data, financial state, user intent, and anything that must survive a page reload or be consistent across devices belongs exclusively on the server.**

| Data                                 | Production Storage                               | localStorage? |
| ------------------------------------ | ------------------------------------------------ | ------------- |
| Portfolio notes, conviction scores   | `assets` table                                   | Never         |
| Watchlist items, thesis, alert price | `watchlist_items` table                          | Never         |
| Journal entries                      | `journal_entries` table                          | Never         |
| Target price overrides               | `target_overrides` table                         | Never         |
| Goals                                | `goals` table                                    | Never         |
| Quarterly review answers             | `quarterly_reviews` table                        | Never         |
| Rebalancing targets                  | `rebalance_targets` table                        | Never         |
| Risk flags                           | `risk_flags` table                               | Never         |
| Sidebar collapsed/expanded state     | localStorage                                     | Acceptable    |
| Theme preference                     | localStorage + synced to `users.preferred_theme` | Acceptable    |
| Last active tab / scroll position    | localStorage                                     | Acceptable    |

If in doubt: server. The backend is the single source of truth for all financial data.

---

## 4. Screens — Complete Detail

The app has a **persistent collapsible left sidebar** (220px expanded, 56px collapsed) and a **top bar** with global instrument search, theme toggle (3 themes: Console Dark, Pro Light, Midnight), and user profile/avatar. **Nine main screens.**

Sidebar nav order: Dashboard · Portfolio · Analysis · Compare · Reports · Watchlist · Journal · Tools · Review

---

### Screen 1 — Dashboard

**Purpose:** Command center. At-a-glance portfolio health summary.

| Section                   | Data Shown                                                                                                                                           | Data Source                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Net Worth Hero            | Total portfolio value, day change (₹ + %), total invested, total P&L (₹ + %), sparkline                                                              | `assets × current_prices`                   |
| Metrics row               | XIRR (cashflow-weighted), CAGR, Alpha vs Nifty 50                                                                                                    | XIRRService (computed)                      |
| 18-Month Area Chart       | Portfolio value over time with hover tooltip                                                                                                         | `portfolio_snapshots` table (daily rows)    |
| Allocation Donut          | Category breakdown: NSE Stocks / US Stocks / NPS / FD / Cash — ₹ + %                                                                                 | Computed from `assets`                      |
| Top 6 Holdings Table      | Name, category, current value, P&L (₹ + %), XIRR, signal badge — sorted by current value                                                             | Computed                                    |
| **Portfolio Health Ring** | SVG ring (0–100 score), label (Strong / Good / Needs Work), 5 sub-bars: XIRR · Alpha · Conviction · Diversity · Drawdown                             | HealthScoreService (see §9)                 |
| Sector Exposure           | Equity sector weights as horizontal gradient bars (excludes Govt Scheme, Cash, Fixed Income)                                                         | Computed from `assets × instruments.sector` |
| **Conviction Alerts**     | Up to 6 alert cards: ticker, name, severity (high/medium/low), type (thesis_risk/governance/guidance_cut/positive), message, date, read/unread state | `conviction_alerts` table                   |
| Recent Reports            | Last 4 research reports: name, sector, date, rec badge, conviction score                                                                             | `reports` table                             |

---

### Screen 2 — Portfolio

**Purpose:** Full holdings table with category filtering, sorting, and expandable per-row detail.

| Section                 | Data Shown                                                                               | Data Source                  |
| ----------------------- | ---------------------------------------------------------------------------------------- | ---------------------------- |
| Summary Strip (4 tiles) | Total Invested, Current Value, Total P&L, XIRR                                           | Computed                     |
| Category Filter Pills   | All / NSE Stocks / US Stocks / NPS / FD / Cash — each pill shows category-level return % | `assets` grouped by category |
| Table Columns           | Name + Ticker, Category, Invested, Current Value, P&L (₹), Return %, XIRR, Signal badge  | `assets + current_prices`    |
| Sortable Columns        | All numeric columns — ascending/descending click-to-sort                                 | Client-side                  |
| Row Expand              | Sector, Entry Date, Qty/Units, Exchange, Conviction (x/10), Allocation bar %             | `assets + instruments`       |
| Inline Notes            | Free-text notes per holding — editable inline, saved to backend                          | `assets.notes`               |
| Totals Row              | Aggregated sum at bottom                                                                 | Computed                     |

---

### Screen 3 — Analysis (8 Tabs)

**Purpose:** Deep portfolio analytics.

#### Tab 1 — Performance

| Section                 | Detail                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Header metrics          | Net Worth total, P&L, XIRR, CAGR, Alpha                                                                                                                            |
| Full area chart         | Long-form portfolio value timeline with hover crosshair                                                                                                            |
| Monthly Returns Heatmap | Grid of coloured tiles — one per month. Green = positive, Red = negative. Colour intensity = magnitude. Derived from month-on-month diff of `portfolio_snapshots`. |

#### Tab 2 — Sector

| Section              | Detail                                                             |
| -------------------- | ------------------------------------------------------------------ |
| Horizontal bar chart | Each equity sector: ₹ value + % of equity portfolio, coloured bars |
| Donut chart          | Visual distribution of sector weights                              |
| Sorted detail table  | Sector, ₹ value, % — descending by size                            |

#### Tab 3 — Risk

| Section                 | Detail                                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Conviction Distribution | Horizontal bar chart: count of holdings at each score (3 through 9)                                                                                |
| Average Conviction      | Weighted average conviction across portfolio                                                                                                       |
| Signal Mix              | Buy / Hold / Watch: count of holdings, ₹ value, % of portfolio, coloured progress bars                                                             |
| Risk Flags              | User-annotated per-holding risks: label, severity (HIGH/MEDIUM/LOW), asset linked. Stored in `risk_flags` table — not hardcoded. Editable by user. |

#### Tab 4 — Correlation

| Section              | Detail                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Correlation Heatmap  | N×N matrix of pairwise Pearson return correlations between all equity holdings. Cell colour: red = highly correlated, blue = uncorrelated. |
| Notable Correlations | Auto-detected pairs above 0.6 threshold with human-readable explanation                                                                    |
| Data source          | 250 trading days of daily closing prices from `price_history` — real statistical computation, not simulated                                |
| Performance          | Cached in Redis for 24h per user; invalidated when holdings change                                                                         |

#### Tab 5 — Drawdown

| Section           | Detail                                                                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Summary cards     | Portfolio max drawdown %, Nifty 50 max drawdown %, excess drawdown vs benchmark                                                                      |
| Per-Holding Table | Entry price, ATH (since user's entry date), Current price, % from ATH, Recovery needed to reach ATH, Max DD since entry                              |
| Visual Bar Chart  | Current drawdown from ATH per holding — normalised bars                                                                                              |
| Note              | **ATH is computed per-user** using `price_history` filtered from each user's first cashflow date for that stock. Different users see different ATHs. |

#### Tab 6 — Rebalancing

| Section                   | Detail                                                                |
| ------------------------- | --------------------------------------------------------------------- |
| Target Allocation Sliders | User sets target % per category. Validation: total must sum to 100%.  |
| Current vs Target         | Side-by-side comparison, colour-coded                                 |
| Action Suggestions        | Computed: "Buy more NSE Stocks: +₹1.2L" / "Reduce FD: -₹50K"          |
| Storage                   | **Persisted in `rebalance_targets` table** — not browser localStorage |

#### Tab 7 — Transaction Timeline _(new in v2.0)_

| Section        | Detail                                                                                                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose        | Shows every investment decision in chronological sequence — the "story" of portfolio construction                                                                                                    |
| Layout         | Grouped by year. Each year: total deployed amount header + vertical timeline. Each entry: date, BUY/SELL badge, asset name, ticker chip, category chip, amount, notes (the reasoning at time of buy) |
| Connector dots | Coloured by asset category: NSE=accent, US=blue, NPS=warm, FD=tan, Cash=muted                                                                                                                        |
| Data source    | `cashflows` table (type=BUY/SELL) + `assets` name/ticker                                                                                                                                             |

#### Tab 8 — Holding Periods _(new in v2.0)_

| Section                | Detail                                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Purpose                | Understand tax exposure and patience patterns at a glance                                                                    |
| Summary cards          | Average Hold period (days + years), LTCG count (held >1yr, taxed at 10%), STCG count (held <1yr, taxed at 15%), Longest Hold |
| Distribution bar chart | Holdings bucketed: <3mo / 3–6mo / 6–12mo / 1–2yr / 2–3yr / 3+yr — bars sized by ₹ value                                      |
| Per-holding table      | Asset name, Entry date, Held (e.g. 2.1yr), Tax type badge (LTCG/STCG), XIRR, Annualised Return %                             |
| Insight callout        | "X of Y equity holdings qualify for LTCG. Next LTCG threshold: check DEEDEV and Vintage Coffee."                             |
| Data source            | `cashflows` first BUY date per asset → compute `holding_days = NOW() − first_buy_date`; `is_ltcg = holding_days > 365`       |

---

### Screen 4 — Compare

**Purpose:** Portfolio performance benchmarked against indices.

#### Tab 1 — Cumulative Growth

Multi-line chart: Portfolio + toggleable benchmarks (Nifty 50 / Nifty Midcap 150 / Fixed Deposit) on same Rs Y-axis, 18-month window. Legend toggles per benchmark. Header tiles show portfolio XIRR + spread vs each benchmark.

#### Tab 2 — Monthly Excess Returns

Bar chart — month-by-month alpha vs Nifty 50. Green = outperformed, red = underperformed. Computed from `portfolio_snapshots` vs `benchmark_history`.

#### Tab 3 — Holding-Level Alpha _(fully specified in v2.0)_

| Section | Detail                                                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose | Shows which individual holdings beat the relevant benchmark and by how much                                                                                               |
| Chart   | Horizontal bar chart sorted by excess return descending (best performers at top). Each bar = asset_XIRR − benchmark_XIRR. Green = positive excess, red = below-benchmark. |
| Table   | Asset name, Asset XIRR %, Benchmark XIRR %, Excess Return (%), Status badge (Outperforming / Lagging)                                                                     |
| Note    | "Alpha" here means excess return spread — not CAPM alpha, not a waterfall attribution chart. See §8 Metric Definitions.                                                   |

**Backend calculation rules — Holding-Level Alpha:**

- **Benchmark window per asset:** Nifty 50 XIRR is computed over the same date range as the individual asset's XIRR — from that asset's first BUY cashflow date to TODAY. Each holding gets its own personalised benchmark comparison window.
- **Asset universe:** Equity only (`NSE Stocks`, `US Stocks`). NPS, FD, and Cash are excluded — no per-share price history exists for a meaningful Nifty comparison.
- **Sort order:** Descending by excess return. Best performers first, worst last.
- **Do values sum to portfolio alpha?** No. Individual asset XIRRs are computed independently. Portfolio XIRR ≠ weighted average of individual XIRRs due to cashflow timing effects. This chart is diagnostic and directional — it ranks contributors and laggards — not a mathematically complete performance attribution.
- **API:** `GET /api/v1/compare/alpha` → `[{assetId, assetName, ticker, assetXirr, benchmarkXirr, excessReturn, status}]`

---

### Screen 5 — Reports

**Purpose:** Research report library — curated stock analyses.

**Split-pane layout:**

| Pane                   | Data Shown                                                                                                        | Source                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Left list (280px wide) | Report name, ticker, analysis date, sector, rec badge, conviction score — filterable by rec, full-text searchable | `reports` table                                |
| Right: Header bar      | Company name, ticker badge, rec badge, conviction dot, sector, date, "Open full" external link                    | `reports` table                                |
| Right: Content area    | Full HTML analysis rendered in iframe (full height)                                                               | Static `/public/analyses/{slug}_analysis.html` |

Current content: 11 HTML stock analysis reports.

---

### Screen 6 — Watchlist

**Purpose:** Track stocks being researched but not yet owned. Price-triggered alerts. Since-added performance tracking.

| Section         | Data Shown                                                                                                                                                                                                                   | Source                                 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Filter tabs     | All / Watching / Interested / Passed / Alerts (live count badge)                                                                                                                                                             | `watchlist_items.status` + alert state |
| Sort options    | Since Added % / Conviction / Date Added                                                                                                                                                                                      | Client-side                            |
| Cards           | Ticker, Name, Exchange, Sector, Status badge, CMP, Alert price, **Since-added % (CMP vs price_at_add)**, **Date added + price at add**, Thesis text, Conviction score, Rec badge, linked report button                       | `watchlist_items + current_prices`     |
| Alert highlight | Card visually highlighted when CMP >= alert_price                                                                                                                                                                            | Computed real-time                     |
| Add form        | Ticker, Name, Sector, Current price (= price_at_add on creation), Alert price, Thesis                                                                                                                                        | POST /api/v1/watchlist                 |
| Key change v2.0 | `price_at_add` and `added_date` captured at creation time — immutable. `since_added_pct = (current_price - price_at_add) / price_at_add * 100`. Shows whether a stock you added to watchlist has moved before you bought it. |

---

### Screen 7 — Journal _(new in v2.0)_

**Purpose:** Chronological trade log that preserves every investment decision along with the reasoning captured at the moment of entry.

| Section                              | Data Shown                                                                                                                                                                                                                            | Source                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Stats strip (4 tiles)                | Total Transactions, Total Deployed (Rs), Avg Ticket Size, Active Since                                                                                                                                                                | `cashflows` + `journal_entries`         |
| Monthly Capital Deployment bar chart | Last 12 months of capital deployed — bar per month sized by amount                                                                                                                                                                    | `cashflows` (type=BUY) grouped by month |
| Filters                              | Type: All / Buy / Sell / Note; Category: all or pick; Text search (asset name / ticker)                                                                                                                                               | Client-side                             |
| Entry count                          | Live "X entries" counter matching current filter                                                                                                                                                                                      | Computed                                |
| Transaction log                      | Chronological list — newest first. Each row: date, vertical timeline with coloured dot, type badge (BUY/SELL/NOTE), asset name, ticker chip, category chip, amount (Rs + qty x price), notes preview. Click to expand full reasoning. | `cashflows` + `journal_entries`         |
| Expanded row                         | "My reasoning at the time" block. Shows: Quantity, Price, Amount, Date.                                                                                                                                                               |                                         |
| Log Trade form                       | Date, Type (Buy/Sell/Note), Asset name, Ticker, Amount, Qty, Price, Category, Notes/reasoning. "Save" persists to `journal_entries` table.                                                                                            | POST /api/v1/journal                    |
| Delete                               | Only user-created journal entries (not system cashflows) can be deleted                                                                                                                                                               |                                         |
| Data                                 | Union of `cashflows` (system-generated) and `journal_entries` (user-created notes), sorted by date descending                                                                                                                         |

**Design note:** The journal is the investor's memory. It combines the factual record (cashflows: exact amounts, quantities, prices) with the qualitative record (the "why" at the time of buying). This creates an honest audit trail of decision-making quality over time.

---

### Screen 8 — Tools (6 Tools)

**Tool 1 — Target Price Calculator**

For every equity holding with an entry price:

- Entry price, Current Market Price, Target price (editable via slider or input)
- Upside from CMP (%), Total return from entry (%), ETA to reach target at current XIRR rate
- Progress bar showing position between entry → current → target
- Original thesis note shown below
- Target price override stored in `target_overrides` table (per-user, does not modify report default)

**Tool 2 — What-If Simulator**

"If I had invested Rs X more in stock Y at its entry price, what would my XIRR be today?"

- Select holding from pills; extra amount slider: Rs 10K to Rs 10L
- XIRR engine reruns with extra cashflow inserted at entry date
- Shows: Current Scenario (before) vs What-If Scenario (after) side-by-side
- Impact summary: Extra value created (Rs), XIRR delta (%), explanatory narrative sentence

**Tool 3 — CSV Import**

Accept broker portfolio exports from Zerodha Console, Groww, Upstox:

- Paste raw CSV text; auto-detects columns: Symbol, Quantity, Average Price, Current Price, Invested, Current Value
- Parse preview: table with matched vs unmatched tickers (ticker matched against `instruments` table)
- Import: creates `assets` rows + `cashflows` rows for each position
- Imported cashflows flagged with `is_synthetic = true` (see §6 Data Model)
- Full audit trail persisted in `import_sessions` table with raw CSV stored for 30 days

**Tool 4 — Export PDF**

Generate a clean print-ready snapshot of portfolio holdings and metrics. Opens print dialog in new tab. Includes: Net Worth, P&L, XIRR, Alpha, all holdings table with XIRR per asset, signal badges, allocation breakdown, print date + disclaimer footer.

**Tool 5 — Tax P&L Calculator** _(new in v2.0)_

Estimates tax liability on unrealised gains if positions were liquidated today.

| Section              | Detail                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Tax rules            | LTCG (equity held >1yr): 10% above Rs 1L exemption. STCG (equity held <1yr): flat 15%. FD interest: 30% slab. NPS: exempt. |
| Summary cards        | Total Gains (pre-tax), Estimated Tax, Post-Tax Gains, Effective Tax Rate                                                   |
| LTCG vs STCG summary | LTCG total, breakdown: exempt Rs 1L + taxable amount + tax at 10%. STCG total + tax at 15%.                                |
| Per-holding table    | Asset, Holding Period, Tax Type badge (LTCG/STCG/Income/Exempt), Gain (Rs), Tax Rate, Tax Amount, Post-Tax Gain            |
| Tax Harvesting tip   | Identifies holdings with unrealised losses that could offset STCG before year-end. Calculates approximate tax saving.      |
| Source               | Holding period computed from first BUY cashflow date. All computations are client-side / read-only — no write to DB.       |

**Tool 6 — Goal-Based Planning** _(new in v2.0)_

Project whether the current portfolio + monthly SIP will reach a financial goal by a target year.

| Section                         | Detail                                                                                                                                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Projection model                | FV = current_corpus _ (1 + XIRR)^years + SIP _ [((1+r)^n - 1) / r] where r = XIRR/12, n = months remaining                                                                                |
| Default goals                   | 3 seed goals per user: Financial Independence (Rs 2Cr / 2035), Dream Home Down Payment (Rs 50L / 2028), Child Education Fund (Rs 30L / 2032)                                              |
| Per-goal card                   | Goal name + icon, target amount + year, years remaining, current corpus, projected amount, on-track badge, surplus or shortfall (Rs), required additional monthly SIP to bridge shortfall |
| Progress bar + projected marker | Visual bar: current corpus as % of goal; tick-mark shows where projected corpus lands                                                                                                     |
| CRUD                            | User can add goals (name, target Rs, target year, monthly SIP, emoji icon), delete goals                                                                                                  |
| Storage                         | `goals` table (see §6)                                                                                                                                                                    |

---

### Screen 9 — Quarterly Review

**Purpose:** Per-holding review checklist. Forces structured re-evaluation of every investment thesis each quarter.

| Section              | Data Shown                                                                                               | Source                               |
| -------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Quarter selector     | Q1 / Q2 / Q3 / Q4 FY26 — switches between quarters                                                       | `quarterly_reviews.quarter`          |
| Card header          | Completion ring SVG (0/4 → 4/4 animated), Name, ticker, exchange, rec badge, conviction dot, current P&L | `assets + current_prices`            |
| Field 1 — Thesis     | "Still intact?" — Yes / No                                                                               | `quarterly_reviews.thesis_intact`    |
| Field 2 — Result     | Last quarterly earnings: Beat / In-line / Miss / Pending                                                 | `quarterly_reviews.result`           |
| Field 3 — Conviction | Delta this quarter: Up / Same / Down                                                                     | `quarterly_reviews.conviction_delta` |
| Field 4 — Action     | Decision: Hold / Add / Reduce / Exit / Watch                                                             | `quarterly_reviews.action`           |
| Notes                | Free text review notes                                                                                   | `quarterly_reviews.notes`            |
| Card border          | Grey (0 complete) → Amber (1–3) → Green (4/4 + REVIEWED chip)                                            | Computed                             |

When conviction delta is set to Up or Down, it updates `assets.conviction` AND writes a row to `conviction_history` — a permanent audit trail of all conviction changes and their reasons.

---

## 5. Data Architecture: Authoritative Sources

**This is the most important design principle.** Every metric must trace back to a single authoritative source. Redundant derived values stored in DB rows will drift over time and cause bugs.

| Data                           | Authoritative Source                                                               | What NOT to do                                      |
| ------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------- |
| Equity invested amount         | `cashflows` — sum of all BUY cashflows for an asset                                | Do NOT store on `assets.invested_amount` for equity |
| Equity current value           | `instruments.last_price x qty` where qty = net quantity from cashflows             | Do NOT cache on `assets.current_value`              |
| Equity average buy price (WAC) | Derived from cashflows using Weighted Average Cost formula                         | Do NOT store permanently                            |
| Equity quantity                | Sum of `cashflows.qty_delta` for an asset                                          | Do NOT store on `assets.qty`                        |
| NPS current value              | `assets.manual_current_value` (user-entered each time)                             | N/A — no live price for NPS                         |
| FD current value               | Computed: `assets.principal_amount * (1 + assets.interest_rate/100)^years_elapsed` |                                                     |
| Cash value                     | `assets.principal_amount`                                                          |                                                     |
| XIRR                           | Computed by XIRRService from `cashflows`; cached Redis 1h                          | Do NOT store as a column                            |
| Historical portfolio value     | `portfolio_snapshots` — immutable daily record written by SnapshotJob              | Cannot be recomputed; prices have moved             |
| Live price                     | `current_prices` table; served from Redis (TTL 5min)                               |                                                     |

---

## 6. Data Model (PostgreSQL 16 + TimescaleDB)

### Design Principles

- **UUID primary keys** everywhere
- **`NUMERIC(14,4)` for all unit prices** — never `FLOAT`/`DOUBLE` for financial data
- **`BIGINT` for market cap** stored in paise
- **`NUMERIC(16,2)` for portfolio-level amounts** in rupees
- **TimescaleDB hypertables** for `price_history`, `portfolio_snapshots`, `benchmark_history`
- **Sectors as a lookup table** — not a Postgres enum; adding a sector requires only an INSERT
- **Exchange codes as Postgres enum** — stable codes: NSE, BSE, NASDAQ, NYSE, NSE_SME
- **Every per-user table** has `user_id FK` — every backend query scoped by it (never `findById` alone; always `findByIdAndUserId`)

### Complete Table List (24 tables)

| Table                 | Scope                 | Purpose                                                                           |
| --------------------- | --------------------- | --------------------------------------------------------------------------------- |
| `users`               | per-user              | Core identity, preferences, theme, currency                                       |
| `user_auth_methods`   | per-user              | Email/password + OAuth — same user can have both linked                           |
| `refresh_tokens`      | per-user              | JWT refresh token rotation/revocation store                                       |
| `sectors`             | shared lookup         | "Jewellery", "Engineering", etc. — add rows without migrations                    |
| `instruments`         | shared                | All trackable securities — stocks, indices, ETFs                                  |
| `price_history`       | shared, TimescaleDB   | EOD OHLCV per instrument per day — 3yr backfill                                   |
| `current_prices`      | shared                | Latest live price per instrument — refreshed every 5 min                          |
| `benchmark_history`   | shared, TimescaleDB   | Daily NAV of Nifty50, Midcap150, FD rate                                          |
| `assets`              | per-user              | One row per holding — **metadata only for equity** (no qty/price cache)           |
| `cashflows`           | per-user              | Every buy/sell/dividend event — **sole input to XIRR engine**                     |
| `conviction_history`  | per-user              | Immutable audit log of conviction score changes                                   |
| `conviction_alerts`   | per-user              | Alert cards for the dashboard conviction alert panel                              |
| `portfolio_snapshots` | per-user, TimescaleDB | Daily EOD portfolio value — powers all history charts                             |
| `reports`             | shared                | Research report metadata; HTML file served as static file                         |
| `watchlist_items`     | per-user              | Stocks being tracked, not yet owned                                               |
| `price_alert_events`  | per-user              | Every alert trigger logged (immutable event log)                                  |
| `quarterly_reviews`   | per-user              | One review per (asset_id, quarter)                                                |
| `risk_flags`          | per-user              | User-annotated risks per holding with severity levels                             |
| `rebalance_targets`   | per-user              | Target allocation % per asset category                                            |
| `target_overrides`    | per-user              | User-adjusted target prices (overrides report default)                            |
| `import_sessions`     | per-user              | Audit trail of every CSV import — raw CSV stored 30 days                          |
| `journal_entries`     | per-user              | User-created trade notes (non-system-generated)                                   |
| `goals`               | per-user              | Financial goals for Goal Planning tool                                            |
| `corporate_actions`   | shared                | _Phase 2+ stub_ — split/dividend adjustments; adj_close handles splits in Phase 1 |

### Key Table Schemas

**assets** (note: no qty, entry_price, invested_amount, current_value for equity):

```sql
id UUID PRIMARY KEY
user_id UUID FK users.id NOT NULL
instrument_id UUID FK instruments.id NULLABLE  -- NULL for NPS, FD, Cash
category VARCHAR(20) NOT NULL  -- 'NSE Stocks','US Stocks','NPS','FD','Cash'
asset_name VARCHAR(255) NOT NULL
rec VARCHAR(10)  -- 'buy','hold','watch','sell'
conviction SMALLINT CHECK (conviction BETWEEN 1 AND 10)
target_price NUMERIC(14,4)
target_note TEXT
notes TEXT
principal_amount NUMERIC(16,2)  -- NPS/FD/Cash: the invested principal
manual_current_value NUMERIC(16,2)  -- NPS only: user-entered current NAV
interest_rate NUMERIC(6,4)  -- FD only (e.g. 7.2000)
maturity_date DATE  -- FD only
is_active BOOLEAN DEFAULT TRUE
exited_at TIMESTAMPTZ
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- qty, entry_price, invested_amount, current_value intentionally ABSENT for equity.
-- These are computed from cashflows on demand, never stored here.
```

**cashflows:**

```sql
id UUID PRIMARY KEY
user_id UUID FK users.id NOT NULL
asset_id UUID FK assets.id NOT NULL
type VARCHAR(20) NOT NULL  -- 'BUY','SELL','DIVIDEND','CONTRIBUTION','WITHDRAWAL','INTEREST'
amount NUMERIC(16,2) NOT NULL  -- negative=outflow (BUY), positive=inflow (SELL/DIV)
qty_delta NUMERIC(14,4)        -- shares bought (+) or sold (-); NULL for NPS/FD/Cash
price_per_unit NUMERIC(14,4)   -- actual execution price; NULL for NPS/FD/Cash
date DATE NOT NULL
notes TEXT                      -- reasoning at time of transaction
is_synthetic BOOLEAN DEFAULT FALSE  -- TRUE = imported via CSV; not manually entered
import_session_id UUID FK import_sessions.id
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

**current_prices:**

```sql
instrument_id UUID FK instruments.id PRIMARY KEY
price NUMERIC(14,4) NOT NULL
change_abs NUMERIC(14,4)
change_pct NUMERIC(8,4)
day_high NUMERIC(14,4)
day_low NUMERIC(14,4)
volume BIGINT
exchange_timestamp TIMESTAMPTZ  -- when the exchange quote was valid
ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  -- when our system wrote this row
source VARCHAR(20) NOT NULL  -- 'YAHOO_FINANCE','UPSTOX','MANUAL'
is_stale BOOLEAN DEFAULT FALSE
stale_reason VARCHAR(100)  -- e.g. 'Market closed', 'API timeout'
```

**watchlist_items:**

```sql
id UUID PRIMARY KEY
user_id UUID FK users.id NOT NULL
instrument_id UUID FK instruments.id NOT NULL
status VARCHAR(20) DEFAULT 'watching'  -- 'watching','interested','passed'
thesis TEXT
rec VARCHAR(10)
conviction SMALLINT
alert_price NUMERIC(14,4)
price_at_add NUMERIC(14,4) NOT NULL  -- CMP at moment item was added; IMMUTABLE. Never recomputed.
added_date DATE NOT NULL DEFAULT CURRENT_DATE
report_id UUID FK reports.id          -- nullable; linked research report (NULL if no report exists)
last_alert_triggered_at TIMESTAMPTZ   -- dedup guard for AlertCheckJob; NULL = alert never triggered
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at TIMESTAMPTZ
```

**journal_entries:**

```sql
id UUID PRIMARY KEY
user_id UUID FK users.id NOT NULL
occurred_at DATE NOT NULL             -- when the event actually happened (user-supplied)
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  -- when the log entry was written
entry_type VARCHAR(20) NOT NULL       -- 'buy','sell','note','thesis_update','macro_note','post_result_review'
asset_name VARCHAR(255)               -- nullable for macro_note / portfolio-level entries
ticker VARCHAR(20)
category VARCHAR(20)
amount NUMERIC(16,2) DEFAULT 0
qty NUMERIC(14,4)
price NUMERIC(14,4)
notes TEXT
related_asset_id UUID FK assets.id    -- nullable; links entry to a specific holding
related_cashflow_id UUID FK cashflows.id  -- nullable; links entry to a specific transaction
tags TEXT[]                           -- lightweight tags e.g. '{"earnings","risk-review"}'
```

**goals:**

```sql
id UUID PRIMARY KEY
user_id UUID FK users.id NOT NULL
name VARCHAR(255) NOT NULL
icon VARCHAR(10)  -- emoji
target_amount NUMERIC(16,2) NOT NULL
target_year SMALLINT NOT NULL
monthly_sip_addition NUMERIC(12,2) DEFAULT 0
current_amount NUMERIC(16,2) DEFAULT 0  -- NULL = use portfolio total
sort_order SMALLINT DEFAULT 0
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

**refresh_tokens:**

```sql
id UUID PRIMARY KEY
user_id UUID FK users.id NOT NULL
token_hash VARCHAR(256) NOT NULL UNIQUE  -- SHA-256 of raw token; never store raw
family_id UUID NOT NULL  -- if a rotated token is reused, revoke entire family
issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
expires_at TIMESTAMPTZ NOT NULL
revoked_at TIMESTAMPTZ  -- NULL = still valid
revoked_reason VARCHAR(50)  -- 'ROTATED','LOGOUT','SUSPICIOUS_REUSE','ADMIN'
```

**conviction_alerts:**

```sql
id UUID PRIMARY KEY
user_id UUID FK users.id NOT NULL
ticker VARCHAR(20) NOT NULL
asset_name VARCHAR(255) NOT NULL
severity VARCHAR(10) NOT NULL  -- 'high','medium','low'
type VARCHAR(30) NOT NULL      -- 'thesis_risk','governance','guidance_cut','margin_stagnant','positive'
message TEXT NOT NULL
date DATE NOT NULL
is_read BOOLEAN DEFAULT FALSE
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

---

## 7. Position Accounting — Weighted Average Cost

For equity holdings, the authoritative position state is computed from cashflows on every read. The service layer caches results in Redis.

### WAC Algorithm

```
Given ordered cashflows (BUY/SELL) for an asset:

wac_price = 0
total_qty  = 0

FOR EACH cashflow IN chronological_order:
    IF type = 'BUY':
        wac_price = (wac_price * total_qty + price_per_unit * qty_delta) / (total_qty + qty_delta)
        total_qty += qty_delta
    IF type = 'SELL':
        total_qty -= qty_delta   -- WAC price does not change on sell
        -- realized gain = (price_per_unit - wac_price) * qty_delta

Final state:
    current_qty     = total_qty
    avg_buy_price   = wac_price
    invested_amount = wac_price * current_qty
    current_value   = current_price * current_qty
    gross_gain      = current_value - invested_amount
    holding_days    = TODAY - date_of_first_BUY_cashflow
    is_ltcg         = holding_days > 365
```

**Why WAC over FIFO?** WAC is standard for Indian equity taxation (SEBI-aligned) and simpler to compute. FIFO is deferred to Phase 3+ for precise lot-level tax tracking.

**Corporate actions / splits:** Phase 1 uses `adj_close` from price_history (already split-adjusted by Yahoo Finance). No separate corporate actions table needed in Phase 1. Phase 2+ will add a `corporate_actions` table when full lot-level traceability is needed.

**FX rates:** All portfolio values in INR. US stock prices sourced in USD from Yahoo Finance and converted using a daily USD/INR rate. Phase 1 uses a daily-refreshed fx rate with a visible disclaimer. The `fx_rates` table is a Phase 2+ addition.

### Concrete Rules for Edge Cases

**Dividends:** A `DIVIDEND` cashflow is a positive cash inflow that enters the XIRR calculation. It does NOT change the WAC cost basis or `total_qty`. `wac_price` is never adjusted for dividends.

**Partial exits:** On a partial SELL, `total_qty` decreases. WAC price does NOT change. Realized gain for the sold tranche = `(sell_price_per_unit - wac_price) * qty_sold`.

**Full exit:** When `total_qty` reaches 0, `PositionService` sets `assets.is_active = false` and `assets.exited_at = NOW()`. The asset row persists in DB for historical XIRR, journal, and audit trail lookups.

**US stocks — currency basis:** `cashflows.price_per_unit` is stored in INR at transaction time (daily USD/INR rate × USD price on that date). `cashflows.amount` is also in INR. WAC is computed in INR throughout. Current value = `current_price_usd × today_usd_inr_rate × qty`. A shift in USD/INR rate between purchase date and today is reflected in the INR-denominated return — currency movement is included, which is the correct treatment for an INR-denominated portfolio.

**Synthetic (CSV-imported) cashflows:** `is_synthetic = true` is metadata only. The WAC algorithm treats synthetic cashflows identically to manually entered ones. The flag allows UI filtering to distinguish user-entered from broker-imported data and prevents duplicate imports.

**XIRR non-convergence:** Newton-Raphson starts at initial guess `r = 0.1`. If it fails to converge within 100 iterations or returns NaN/Infinity, `XIRRService` falls back to CAGR and returns `"xirr_approx": true` in the API response so the frontend can display a "~" prefix.

---

## 8. Metric Definitions

All metrics computed by the backend. Frontend displays values only, does not compute them.

### XIRR (Extended Internal Rate of Return)

The cashflow-weighted annualised return.

```
Given cashflows C = [(amount_1, date_1), ..., (amount_n, date_n)]
where amount_i is negative for outflows (BUY) and positive for inflows (SELL/final_value)

XIRR solves for r in:
  SUM_i [ amount_i / (1 + r)^( (date_i - date_0) / 365 ) ] = 0

Solved by Newton-Raphson iteration (max 100 iterations, tolerance 0.00001).
The "final value" cashflow is: +current_value on TODAY's date.
```

**Edge cases:**

- All BUYs, no SELL yet: add synthetic +current_value at TODAY
- Short hold (<30 days): XIRR can be extreme (e.g. 1000%); display as N/A or cap at 999%
- Negative gain: XIRR is negative; display correctly (do not show 0)
- Single cashflow: XIRR undefined; show CAGR instead

### CAGR (Compound Annual Growth Rate)

```
CAGR = (current_value / invested_amount)^(1 / years_held) - 1
years_held = (TODAY - first_buy_date) / 365.25
```

### Alpha (Excess Return Spread)

```
alpha = portfolio_XIRR - benchmark_XIRR
```

Where `benchmark_XIRR` = Nifty 50 XIRR over the same time window (computed from `benchmark_history`). This is an excess return spread, not CAPM alpha (which requires beta regression). The label is kept as "Alpha" in the UI for simplicity.

### Correlation

```
Pearson r(X, Y) = SUM[(Xi - X_mean)(Yi - Y_mean)] / (n - 1) * sigma_X * sigma_Y

Where X and Y are 250-day daily return series (pct change from adj_close)
```

Only computed for equity holdings with >= 60 days of overlap in `price_history`.

### Maximum Drawdown

```
For a price series P starting from user's first buy date:
  running_max(i) = MAX(P[0..i])
  drawdown(i)    = (P[i] - running_max(i)) / running_max(i) * 100
  max_drawdown   = MIN(drawdown(i)) for all i

ATH is per-user: computed from the user's first buy date, not a global market ATH.
```

### Holding Period

```
holding_days = TODAY - MIN(date) FROM cashflows WHERE asset_id = X AND type = 'BUY'
is_ltcg      = holding_days > 365   -- Indian tax threshold
```

---

## 9. Portfolio Health Score

A composite 0–100 score summarising portfolio quality. Displayed as an SVG ring on the Dashboard with 5 sub-bars.

### Formula

```
healthScore = round(
    xirrScore   * 0.30 +    -- 30% weight
    alphaScore  * 0.25 +    -- 25% weight
    convScore   * 0.20 +    -- 20% weight
    diversScore * 0.15 +    -- 15% weight
    drawScore   * 0.10      -- 10% weight
)

Sub-scores (each 0–100):

xirrScore    = MIN(100, portfolioXIRR / 25 * 100)         -- 25% XIRR = full score
alphaScore   = MIN(100, MAX(0, (portfolioXIRR - 12) / 10 * 100))  -- +10% alpha = full score
convScore    = (avgConviction / 10) * 100                  -- value-weighted avg conviction of equity holdings
-- diversScore: HHI-based concentration, not raw holding count:
--   hhi     = SUM( (equity_holding_value_i / total_equity_value)^2 )
--   hhi_min = 1.0 / n   (n = number of equity holdings; theoretical equal-weight minimum)
--   NPS, FD, Cash excluded from this calculation
--   n=1 → diversScore=0; perfectly equal weights → diversScore=100
diversScore  = MAX(0, MIN(100, (1.0 - hhi) / (1.0 - hhi_min) * 100))
-- drawScore basis: portfolioMaxDD = max drawdown of portfolio_snapshots value series (not per-holding)
drawScore    = MAX(0, 100 - ABS(portfolioMaxDD) * 2.5)    -- -40% portfolio max DD → score 0
```

### Labels

| Score Range | Label      | Ring Colour |
| ----------- | ---------- | ----------- |
| 80–100      | Strong     | Green       |
| 60–79       | Good       | Accent blue |
| 40–59       | Needs Work | Amber       |
| 0–39        | At Risk    | Red         |

The health score is **informational, not prescriptive** — it is a starting point for self-reflection, not a trade recommendation. Recomputed and cached in Redis whenever inputs change.

---

## 10. Tax P&L Model

All computations are **client-side / read-only** (no DB writes for tax calculations).

```
LTCG_EXEMPTION = Rs 1,00,000 (per financial year, applied portfolio-wide)

For each asset:
  holding_days  = computed from cashflows
  is_ltcg       = holding_days > 365

  IF category in ('NSE Stocks', 'US Stocks'):
    IF is_ltcg:
      tax_type   = 'LTCG'
      tax_amount = MAX(0, gain - LTCG_EXEMPTION) * 0.10
    ELSE:
      tax_type   = 'STCG'
      tax_amount = MAX(0, gain) * 0.15

  IF category = 'FD':
    tax_type   = 'Income'
    tax_amount = MAX(0, gain) * 0.30     -- 30% slab rate approximation

  IF category = 'NPS':
    tax_type   = 'Exempt'
    tax_amount = 0

  post_tax_gain = gain - tax_amount

Portfolio totals:
  totalTax         = SUM(tax_amount)
  postTaxGains     = totalGains - totalTax
  effectiveTaxRate = totalTax / totalGains * 100
```

**Tax Harvesting:** If any equity holding has `gain < 0` (unrealised loss), the UI shows an advisory: booking that loss before financial year-end can offset STCG from profitable positions. Re-entry after 31 days avoids wash-sale concerns under Indian law.

**Explicit scope — what this tool is NOT:**
This is an estimation tool for planning purposes, not a tax filing tool. Figures are approximate. This tool does not account for:

- Surcharge or health and education cess (adds 10–37% on the base tax for higher incomes)
- Capital losses already realized earlier in the current financial year
- Grandfathering rules for equity acquired before 31 January 2018 (LTCG)
- Lot-level FIFO selection (uses first BUY cashflow date, not individual lot dates)
- NRI-specific treatment or DTAA benefits
- FD TDS already deducted at source

All figures must be treated as estimates. Users should consult a qualified CA before filing returns.

---

## 11. Goal Planning Model

```
Inputs:
  current_corpus  = goal.current_amount (or portfolio total for the primary goal)
  xirr            = portfolioXIRR / 100  (annualised, as decimal)
  monthly_rate    = xirr / 12
  years_left      = goal.target_year - CURRENT_YEAR
  n               = years_left * 12      (months)

Projected corpus at target_year:
  fv_corpus = current_corpus * (1 + xirr)^years_left
  fv_sip    = goal.monthly_sip * ( ((1 + monthly_rate)^n - 1) / monthly_rate )
  projected = fv_corpus + fv_sip

Status:
  on_track  = projected >= goal.target_amount
  shortfall = goal.target_amount - projected   (negative = surplus)

Required monthly SIP to bridge shortfall:
  req_sip = shortfall * monthly_rate / ( (1 + monthly_rate)^n - 1 )
```

Assumed rate = the user's own portfolio XIRR. This is an optimistic projection — it assumes future returns match historical XIRR. A disclaimer is shown in the UI.

---

## 12. Authentication & Session Security

### JWT Pair Design

- **Access token:** HS256, 15-minute TTL, stateless, never stored in DB. Contains: `sub` (user_id UUID), `email`, `iat`, `exp`.
- **Refresh token:** Opaque random 256-bit value. Stored as `SHA-256(token)` in `refresh_tokens` table. TTL = 30 days. Delivered via `HttpOnly, Secure, SameSite=Strict` cookie.

### Refresh Token Rotation

```
POST /api/v1/auth/refresh:
  1. Read refresh token from HttpOnly cookie
  2. Hash: h = SHA-256(token)
  3. SELECT * FROM refresh_tokens WHERE token_hash = h AND revoked_at IS NULL AND expires_at > NOW()
     -- Not found: 401 UNAUTHORIZED
  4. Check family_id: if any token in this family was used after being rotated:
     -- Revoke entire family (possible token theft) + 401 -- force re-login
  5. Revoke current token: revoked_at=NOW(), revoked_reason='ROTATED'
  6. Issue new access token (JWT) + new refresh token (same family_id)
  7. INSERT new refresh token into refresh_tokens
  8. Set new refresh token cookie + return access token in body
```

### Account Linking

- A Google OAuth callback checks: does `users` already exist with this email?
  - Yes: link Google method to existing user (no duplicate account)
  - No: create new user + Google auth method
- One user cannot have two email methods or two Google methods

### Logout

```
POST /api/v1/auth/logout:
  Revoke all active refresh tokens for user_id
  Clear refresh token cookie (MaxAge=0)
  Return 200 (access token expires on its own in <=15 min)
```

---

## 13. Alert Semantics

### Conviction Alerts (Dashboard Panel)

Alert lifecycle:

- Admin creates alert row in `conviction_alerts` for specific (user_id, ticker)
- User sees alert in Dashboard panel; unread = highlighted coloured border
- User marks as read: `PATCH /api/v1/alerts/conviction/:id/read`
- Alert persists permanently in DB (immutable event log)
- No auto-expiry for admin-created alerts in Phase 1

### Watchlist Price Alerts

```
Trigger: watchlist_items.alert_price is set by user
         AlertCheckJob runs every 5 min, market hours

Trigger condition: current_price >= alert_price

De-duplication guard:
  Only trigger if no event for same (user_id, watchlist_item_id) in last 24h
  Check: SELECT 1 FROM price_alert_events WHERE watchlist_item_id=? AND triggered_at > NOW()-INTERVAL '24h'

On trigger:
  INSERT into price_alert_events(user_id, watchlist_item_id, trigger_price, triggered_at)
  Push notification (Phase 2) / Email notification (Phase 3)

Re-arm: Alert triggers again if price drops below alert_price and rises back above.
```

---

## 14. Background Job Design

| Job                       | Schedule                                     | Idempotency                                                                              | Notes                                                          |
| ------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `PriceRefreshJob`         | Every 5 min, Mon–Fri 09:00–15:30 IST         | `UPSERT ON CONFLICT (instrument_id) DO UPDATE`                                           | Retry 3x backoff. Flag `is_stale=true` if all retries fail.    |
| `PortfolioSnapshotJob`    | Daily 16:05 IST                              | `INSERT ON CONFLICT (user_id, date) DO UPDATE`                                           | Runs 5 min post-close. Uses live prices from `current_prices`. |
| `AlertCheckJob`           | Every 5 min, market hours                    | Dedup guard 24h per watchlist item                                                       | Only checks items with `alert_price IS NOT NULL`.              |
| `PriceHistoryBackfillJob` | Once per new instrument, triggered on-demand | Check `history_ingested=false` before running; bulk INSERT with `ON CONFLICT DO NOTHING` | Fetches 3yr EOD from Yahoo Finance.                            |
| `StaleTokenCleanupJob`    | Daily 02:00 IST                              | `DELETE WHERE expires_at < NOW() - INTERVAL '7 days'`                                    | Purge expired refresh tokens to keep table small.              |

---

## 15. Backend Architecture

### Package Structure

```
phoenix-backend/
  src/main/java/com/phoenix/

    api/v1/                      -- REST controllers (thin; no business logic)
      AuthController
      DashboardController
      PortfolioController
      AnalyticsController
      CompareController
      ReportsController
      WatchlistController
      JournalController          (new in v2.0)
      ToolsController
      ReviewController
      AlertController            (new in v2.0)
      GoalController             (new in v2.0)
      InstrumentController
      PriceController

    service/                     -- ALL business logic
      AuthService                registration, login, token management
      PortfolioService           P&L, allocation %, day change
      XIRRService                Newton-Raphson
      PositionService            WAC, qty, holding_days, is_ltcg per asset
      PriceService               fetch, retry, fallback, cache
      AnalyticsService           correlation matrix, drawdown computation
      HealthScoreService         composite health score (new in v2.0)
      AlertService               watchlist + conviction alerts
      SnapshotService            EOD portfolio value snapshot
      ImportService              CSV parse, validate, persist
      GoalService                goal CRUD + projection (new in v2.0)
      JournalService             journal entry CRUD (new in v2.0)
      RefreshTokenService        issue, rotate, revoke refresh tokens

    scheduler/
      PriceRefreshJob
      PortfolioSnapshotJob
      AlertCheckJob
      PriceHistoryBackfillJob
      StaleTokenCleanupJob

    domain/                      -- JPA entities
    repository/                  -- Spring Data JPA + custom @Query
    security/
      JwtFilter
      JwtService
      RefreshTokenService
      OAuthSuccessHandler
    config/
    dto/ request/ response/
    exception/
      GlobalExceptionHandler     -- never exposes stack traces or internal messages
```

---

## 16. API Routes (Complete)

```
-- Auth --
POST   /api/v1/auth/register           email + password -> create user
POST   /api/v1/auth/login              email + password -> JWT pair
GET    /api/v1/auth/google             redirect to Google OAuth
GET    /api/v1/auth/google/callback    Google callback -> JWT pair
POST   /api/v1/auth/refresh            rotate refresh token -> new JWT pair
POST   /api/v1/auth/logout             revoke refresh token, clear cookie
GET    /api/v1/auth/me                 current user profile

-- Dashboard --
GET    /api/v1/dashboard               all dashboard data (healthScore + convictionAlerts)

-- Portfolio --
GET    /api/v1/portfolio               all holdings with computed P&L + XIRR
POST   /api/v1/portfolio/assets        add holding + first cashflow
PUT    /api/v1/portfolio/assets/:id    update notes, conviction, target, rec
DELETE /api/v1/portfolio/assets/:id    soft-delete (mark exited)
GET    /api/v1/portfolio/assets/:id/cashflows
POST   /api/v1/portfolio/assets/:id/cashflows

-- Analysis --
GET    /api/v1/analysis/performance    chart data + monthly returns
GET    /api/v1/analysis/sector         sector breakdown
GET    /api/v1/analysis/risk           conviction dist, signal mix, risk flags
GET    /api/v1/analysis/correlation    N x N matrix (cached 24h)
GET    /api/v1/analysis/drawdown       per-holding drawdown stats
GET    /api/v1/analysis/rebalance      current vs target
PUT    /api/v1/analysis/rebalance      save target allocations
GET    /api/v1/analysis/timeline       cashflows in chronological order
GET    /api/v1/analysis/holding-periods  holding duration + LTCG/STCG split

-- Compare --
GET    /api/v1/compare                 portfolio + benchmark history
GET    /api/v1/compare/alpha           per-holding excess return vs Nifty

-- Reports --
GET    /api/v1/reports
GET    /api/v1/reports/:slug
POST   /api/v1/reports                 [admin]
PUT    /api/v1/reports/:slug           [admin]

-- Watchlist --
GET    /api/v1/watchlist               items + current prices + since-added %
POST   /api/v1/watchlist               add item (captures price_at_add = CMP)
PUT    /api/v1/watchlist/:id           update status / thesis / alert price
DELETE /api/v1/watchlist/:id

-- Journal --
GET    /api/v1/journal                 all entries (cashflows + journal_entries merged)
POST   /api/v1/journal                 create user journal entry
DELETE /api/v1/journal/:id             delete (journal_entries only)

-- Alerts --
GET    /api/v1/alerts/conviction       conviction alert panel data
PATCH  /api/v1/alerts/conviction/:id/read
GET    /api/v1/alerts/price            price alert history

-- Goals --
GET    /api/v1/goals                   all goals with projections
POST   /api/v1/goals
PUT    /api/v1/goals/:id
DELETE /api/v1/goals/:id

-- Tools --
GET    /api/v1/tools/targets           target price configs + overrides
PUT    /api/v1/tools/targets/:assetId
POST   /api/v1/tools/whatif            simulate extra investment -> new XIRR
POST   /api/v1/tools/import            parse + persist broker CSV
GET    /api/v1/tools/import/:id        import session status
GET    /api/v1/tools/tax               tax P&L breakdown (read-only)

-- Reviews --
GET    /api/v1/reviews?quarter=Q4+FY26
PUT    /api/v1/reviews/:assetId/:quarter

-- Risk Flags --
GET    /api/v1/riskflags?assetId=
POST   /api/v1/riskflags
PUT    /api/v1/riskflags/:id
DELETE /api/v1/riskflags/:id

-- Instruments --
GET    /api/v1/instruments/search?q=
GET    /api/v1/prices/:ticker
POST   /api/v1/prices/refresh          [admin]
```

---

## 17. Caching Strategy

| Key Pattern               | TTL   | Content                               | Invalidated By                                 |
| ------------------------- | ----- | ------------------------------------- | ---------------------------------------------- |
| `price:{ticker}`          | 5 min | current_prices row as JSON            | PriceRefreshJob write                          |
| `xirr:user:{userId}`      | 1 hr  | Portfolio XIRR (float)                | New cashflow added                             |
| `xirr:asset:{assetId}`    | 1 hr  | Per-asset XIRR (float)                | New cashflow for that asset                    |
| `health:user:{userId}`    | 1 hr  | Full health score + 5 sub-scores      | Conviction change, new cashflow, price refresh |
| `corr:user:{userId}`      | 24 hr | Full N x N correlation matrix as JSON | Equity holding added or removed                |
| `dashboard:user:{userId}` | 5 min | Full dashboard response payload       | Price refresh + any user write                 |
| `portfolio:user:{userId}` | 5 min | Portfolio computed state              | Any user write                                 |

**Cache-aside pattern** (not write-through): read cache → on miss read DB + write cache → return. No cache = slight latency — always correct. Stale cache = brief inconsistency — never wrong data for more than TTL seconds.

---

## 18. Scalability Design (1 Lakh Users)

**Traffic pattern:** Read-heavy. Dashboard, Portfolio, Analysis are reads. Writes happen when: price refresh runs (every 5 min), user saves a note, user completes a review.

| Risk                           | Mitigation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `price_history` table size     | ~375K rows, ~30MB total. Entire table in pg buffer pool. Not a risk.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `portfolio_snapshots` at scale | 100K users x 250 days/year = 25M rows/year. TimescaleDB auto-partitions by time. Every query adds `WHERE user_id = ? AND date BETWEEN ? AND ?` — always an index seek.                                                                                                                                                                                                                                                                                                                                                                    |
| Correlation matrix computation | Compute once per user's holding set; cache Redis 24h. Invalidated only on holding add/remove.                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Dashboard load at peak         | Dashboard response is **cache-assembled** from independent cached components — not a single DB read. Assembly order: portfolio P&L + XIRR (Redis `portfolio:user:{id}` + `xirr:user:{id}`, 1h), health score (Redis `health:user:{id}`, 1h), prices (Redis `price:{ticker}`, 5min per ticker), conviction alerts (1 DB query, typically ≤10 rows), recent reports (1 DB query, 4 rows). `PortfolioSnapshotJob` pre-builds the 18-month history chart at 16:05 daily so chart rendering never triggers XIRR recomputation on the hot path. |
| XIRR under load                | Redis 1h TTL. Invalidated only on new cashflow (rare).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Alert check at 100K watchlists | Dedup guard in SQL. Only checks items with `alert_price IS NOT NULL`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| DB connections                 | HikariCP pool size 20–25. Redis serves hot path. Most requests never hit Postgres.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Refresh token table            | StaleTokenCleanupJob daily purge; active tokens per user bounded by device count.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

**Why not microservices?** At 1L users with this feature set, a properly cached Spring Boot monolith on a single 8-core / 32GB RAM instance handles the load comfortably. Microservices add network latency, distributed transaction complexity, and a much steeper operational burden. Build the monolith correctly first; extract services only if/when a specific bottleneck appears.

---

## 19. Implementation Phases

| Phase                         | Focus                  | Key Deliverable                                                                                                                                                                                            |
| ----------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0 — Foundation**            | Project scaffold       | Spring Boot 3.x + PostgreSQL + TimescaleDB + Redis via Docker Compose. All 24 tables by Liquibase. GitHub repo with README.                                                                                |
| **1 — Auth**                  | Identity + session     | Email/password + Google OAuth -> JWT pair (access + rotating refresh). Login/register pages. Protected routes.                                                                                             |
| **2 — Instruments + Prices**  | Market data pipeline   | Seed 11 stocks + 3 indices. Yahoo Finance 3yr EOD backfill. PriceRefreshJob. Instrument search. Redis price caching.                                                                                       |
| **3 — Portfolio Core**        | Core value proposition | Assets + cashflows CRUD. XIRRService + PositionService (WAC). PortfolioService. Dashboard + Portfolio screens. PortfolioSnapshotJob.                                                                       |
| **4 — History + Compare**     | Benchmarking           | Benchmark history ingestion. Compare screen all 3 tabs. Analysis Performance tab + Monthly Returns heatmap.                                                                                                |
| **5 — Deep Analytics**        | Institutional-grade    | Correlation matrix + Redis caching. Per-user drawdown. Analysis: Correlation + Drawdown + Risk + Sector tabs.                                                                                              |
| **6 — Watchlist + Alerts**    | Stock tracking         | Watchlist CRUD (with price_at_add). AlertCheckJob. Dashboard Conviction Alerts panel.                                                                                                                      |
| **7 — Journal + Goals**       | New v2.0 screens       | Journal screen (cashflows + journal_entries union). Goals CRUD + Goal Planning tool.                                                                                                                       |
| **8 — Tools + Tax**           | Tooling completion     | Target price overrides. What-If simulator. Tax P&L tool. CSV import with is_synthetic flag. Health Score ring. Analysis Timeline + Holding Periods tabs.                                                   |
| **9 — Reviews + Rebalancing** | Review workflow        | Quarterly review save/load + conviction history. Rebalancing targets + action suggestions. Risk flags CRUD.                                                                                                |
| **10 — Hardening**            | Production readiness   | Per-user rate limiting (Bucket4j). GlobalExceptionHandler (no stack traces to client). Input validation at all boundaries. Structured logging with trace IDs. OpenAPI documentation. StaleTokenCleanupJob. |

---

## 20. Engineering Learnings Per Phase

| Phase | Java/Backend Topic                                                                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Spring Boot 3 project structure, Bean/DI lifecycle, Docker Compose multi-service, Liquibase changesets + rollbacks                                                              |
| 1     | BCrypt password hashing, JWT access + refresh token lifecycle, Spring Security filter chain, Google OAuth2 authorization code flow, refresh token rotation with family tracking |
| 2     | Spring WebClient (reactive HTTP client), retry with exponential backoff, PostgreSQL bulk INSERT with ON CONFLICT, Yahoo Finance API parsing                                     |
| 3     | JPA entity relationships (OneToMany, ManyToOne), custom JPQL queries, Newton-Raphson numerical method, @Transactional boundaries, WAC algorithm                                 |
| 4     | TimescaleDB hypertables + time_bucket() aggregation, Spring @Scheduled cron expressions, date arithmetic for financial calculations                                             |
| 5     | Pearson correlation computation from price time-series, Redis cache invalidation strategies, expensive query optimisation with caching                                          |
| 6     | Event-driven alert system design, deduplication guards in SQL, background job idempotency with upsert semantics                                                                 |
| 7     | Feed-style query patterns (UNION of two tables for Journal), FV compound growth formulas for Goal Planning                                                                      |
| 8     | Tax computation from cashflow metadata, composite scoring formulas, Newton-Raphson edge cases (non-convergence, extreme XIRR)                                                   |
| 9     | Multi-step form persistence, conviction history audit trail pattern, optimistic locking for concurrent review updates                                                           |
| 10    | Token bucket rate limiting (Bucket4j), structured logging with correlation IDs, OpenAPI 3.0 annotation, global exception taxonomy mapping to HTTP status codes                  |

---

## Appendix A — Sample Portfolio Data (Mock, from Designs)

12 holdings in the test portfolio:

| Asset                      | Category   | Invested    | Current     | XIRR | Signal |
| -------------------------- | ---------- | ----------- | ----------- | ---- | ------ |
| NPS Tier I                 | NPS        | Rs 4,50,000 | Rs 5,83,000 | —    | —      |
| NPS Tier II                | NPS        | Rs 1,50,000 | Rs 1,69,000 | —    | —      |
| Sky Gold (SKYGOLD)         | NSE Stocks | Rs 2,80,016 | Rs 3,44,202 | ~28% | BUY 9  |
| DEE Development (DEEDEV)   | NSE Stocks | Rs 1,79,944 | Rs 1,96,213 | ~18% | BUY 9  |
| EFC (I) Ltd (EFCIL)        | NSE Stocks | Rs 2,10,188 | Rs 2,68,074 | ~40% | BUY 8  |
| Vintage Coffee (VINCOFE)   | NSE Stocks | Rs 1,60,000 | Rs 1,82,280 | ~30% | BUY 8  |
| Websol Energy (WEBELSOLAR) | NSE Stocks | Rs 3,20,450 | Rs 2,97,772 | -7%  | BUY 8  |
| Subros Ltd (SUBROS)        | NSE Stocks | Rs 1,39,956 | Rs 1,56,969 | ~26% | HOLD 7 |
| Apple Inc (AAPL)           | US Stocks  | Rs 3,80,000 | Rs 4,68,000 | ~17% | —      |
| Microsoft (MSFT)           | US Stocks  | Rs 4,30,000 | Rs 5,21,000 | ~18% | —      |
| SBI Savings (Cash)         | Cash       | Rs 2,00,000 | Rs 2,00,000 | —    | —      |
| HDFC FD 7.2%               | FD         | Rs 3,00,000 | Rs 3,21,600 | 7.2% | —      |

Portfolio XIRR: ~18.4% · Nifty 50 XIRR: ~12% · Alpha: +6.4%

---

## Appendix B — Decisions Log

| Decision               | Chosen                                              | Rejected                       | Reason                                                                                       |
| ---------------------- | --------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------- |
| Architecture           | Monolith                                            | Microservices                  | Over-engineering at 1L users; clean layering allows future extraction                        |
| Position accounting    | WAC                                                 | FIFO                           | WAC is simpler; FIFO deferred to Phase 3+ for lot-level tax tracking                         |
| Alpha definition       | Excess return spread                                | CAPM alpha                     | CAPM requires beta regression; excess spread is directionally correct and simpler to explain |
| Corporate actions      | adj_close handles splits                            | corporate_actions table now    | adj_close from Yahoo Finance is split-adjusted; Phase 1 does not need a separate table       |
| FX rates               | Daily-refreshed rate with disclaimer                | fx_rates table now             | Phase 1 portfolio is India-centric; Phase 2+ when more US assets are likely                  |
| Equity position fields | Computed from cashflows on demand                   | Stored on assets row           | Single source of truth: cashflows. Storing derived fields leads to inconsistency bugs.       |
| CSV import cashflows   | Flagged is_synthetic=true                           | Treated same as manual entries | Audit trail integrity; allows filtering out synthetic data from specific views               |
| Holding period for tax | First BUY cashflow date                             | Lot-level FIFO dates           | Matches WAC approach; FIFO lot tracking deferred to Phase 3+                                 |
| JWT design             | Access token (15min) + rotating refresh token (30d) | Long-lived access token        | Short access tokens limit exposure; refresh rotation detects token theft via family tracking |
