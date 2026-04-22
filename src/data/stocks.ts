import { Stock } from "@/types";

export const stocks: Stock[] = [
  {
    slug: "skygold",
    name: "Sky Gold & Diamonds",
    ticker: "SKYGOLD",
    exchange: "NSE",
    sector: "Jewellery / Consumer Discretionary",
    dateAnalyzed: "April 2025",
    recommendation: "buy",
    thesis:
      "45% revenue CAGR, 129% PAT CAGR over 5 years. B2B manufacturer supplying Malabar, Kalyan, Tanishq, Reliance — zero retail inventory risk with structural growth optionality.",
    mcap: "₹6,557 Cr",
    convictionScore: 9,
  },
  {
    slug: "deedev",
    name: "DEE Development Engineers",
    ticker: "DEEDEV",
    exchange: "NSE",
    sector: "Engineering / Process Piping",
    dateAnalyzed: "April 2026",
    recommendation: "buy",
    thesis:
      "India's largest integrated process piping provider. 1.8x book-to-bill order visibility, exotic materials + certification moat, nuclear and hydrogen tailwinds. Trading at 13–19x FY27 — genuinely cheap for the growth rate.",
    mcap: "₹2,827 Cr",
    convictionScore: 9,
  },
  {
    slug: "gchotels",
    name: "Grand Continent Hotels",
    ticker: "GCHOTELS",
    exchange: "NSE SME",
    sector: "Hospitality",
    dateAnalyzed: "April 2026",
    recommendation: "watch",
    thesis:
      "133% revenue growth in FY25 and 79% in H1 FY26 on an asset-light lease model. High-risk, high-reward micro-bet on South India's emerging hospitality market. Watch occupancy improvement quarterly.",
    mcap: "₹246 Cr",
    convictionScore: 5,
  },
  {
    slug: "namoewaste",
    name: "Namo eWaste Management",
    ticker: "NAMOEWASTE",
    exchange: "NSE SME",
    sector: "e-Waste / Environment Services",
    dateAnalyzed: "April 2026",
    recommendation: "watch",
    thesis:
      "50% revenue CAGR, 94% PBT growth. Early-stage e-waste recycler at the forefront of India's EPR mandate. Tiny base (₹373–417 Cr mcap) with high execution risk — strong story, needs consistent delivery.",
    mcap: "₹373–417 Cr",
    convictionScore: 5,
  },
  {
    slug: "rbz",
    name: "RBZ Jewellers",
    ticker: "RBZJEWEL",
    exchange: "NSE",
    sector: "Jewellery / Consumer Discretionary",
    dateAnalyzed: "April 2026",
    recommendation: "watch",
    thesis:
      "Best-in-class 12% EBITDA margins in jewellery, 75% promoter holding (zero pledge), antique gold moat. But guidance cut twice — a speculative bet on a difficult B2B-to-B2C transition. 3x possible in bull case.",
    mcap: "₹584 Cr",
    convictionScore: 6,
  },
  {
    slug: "efc",
    name: "EFC (I) Ltd",
    ticker: "EFCIL",
    exchange: "NSE",
    sector: "Real Estate-as-a-Service / Managed Workspaces",
    dateAnalyzed: "April 2026",
    recommendation: "buy",
    thesis:
      "India's first listed managed workspace company. 73,000+ office seats across 11 cities. Undervalued vs peers with superior profitability — asset-light model with strong expansion runway.",
    mcap: "₹2,700 Cr",
    convictionScore: 8,
  },
  {
    slug: "subros",
    name: "Subros Ltd",
    ticker: "SUBROS",
    exchange: "NSE",
    sector: "Auto Components / Thermal Management",
    dateAnalyzed: "April 2026",
    recommendation: "hold",
    thesis:
      "India's largest auto AC manufacturer. JV with Denso (20%) + Suzuki (12%). Strong EV transition bet — every car needs thermal management. Hold as an EV-cycle compounder alongside existing EPACK position.",
    mcap: "₹5,144 Cr",
    convictionScore: 7,
  },
  {
    slug: "vintage-coffee",
    name: "Vintage Coffee & Beverages",
    ticker: "VINCOFE",
    exchange: "NSE",
    sector: "FMCG / Coffee Exports",
    dateAnalyzed: "April 2026",
    recommendation: "buy",
    thesis:
      "100% capacity utilisation before new capacity commissioned — demand before supply. 74% revenue CAGR projected FY25–28 by Nuvama. The CCL Products of 2020: private label instant coffee exporter at capacity inflection with German equipment moat.",
    mcap: "₹1,981 Cr",
    convictionScore: 8,
  },
  {
    slug: "indotech",
    name: "Indo Tech Transformers",
    ticker: "INDOTECH",
    exchange: "NSE",
    sector: "Capital Goods / Power Transformers",
    dateAnalyzed: "April 2026",
    recommendation: "watch",
    thesis:
      "Solid underlying business — 7 consecutive quarters of PAT improvement, 18% EBITDA margins, 24.4% revenue CAGR. But 77% promoter pledge creates a direct governance risk unlike any other holding. Speculative only.",
    mcap: "₹1,406 Cr",
    convictionScore: 4,
  },
  {
    slug: "websol",
    name: "Websol Energy System",
    ticker: "WEBELSOLAR",
    exchange: "NSE",
    sector: "Renewable Energy / Solar Manufacturing",
    dateAnalyzed: "April 2026",
    recommendation: "buy",
    thesis:
      "India's pioneering pure-play solar cell manufacturer with a 3-decade track record. Falta SEZ location provides cost advantages. Best solar manufacturing play for a 3x goal with strong policy tailwinds.",
    mcap: "₹3,200 Cr",
    convictionScore: 8,
  },
  {
    slug: "cellecor",
    name: "Cellecor Gadgets Ltd",
    ticker: "CELLECOR",
    exchange: "NSE SME",
    sector: "Consumer Electronics",
    dateAnalyzed: "April 2026",
    recommendation: "watch",
    thesis:
      "Budget electronics brand (TVs, ACs) with ₹1,026 Cr revenue and proven doubling track record. But 3% PAT margins have never improved in 3 years, SME board liquidity is thin, FCCB dilution looming. Base case only 1.7–1.9x — challenging path to 3x.",
    mcap: "₹671 Cr",
    entryPrice: "₹32",
    horizon: "2–3 years",
    convictionScore: 3,
  },
];

export function getStockBySlug(slug: string): Stock | undefined {
  return stocks.find((s) => s.slug === slug);
}
