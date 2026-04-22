export type Recommendation = "buy" | "hold" | "sell" | "watch";

export interface Stock {
  slug: string;
  name: string;
  ticker: string;
  exchange: string;
  sector: string;
  dateAnalyzed: string;
  recommendation: Recommendation;
  thesis: string;
  mcap?: string;
}
