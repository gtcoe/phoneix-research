/**
 * Transaction log types.
 * Mirrors GET /api/v1/transactions response shape.
 */
import type { TransactionCategory } from "./common";

/** Raw transaction shape (without client-computed `dateObj`). */
export type RawTransactionInput = Omit<Transaction, "dateObj">;

/** The operation type for a logged transaction. */
export type TransactionType = "buy" | "sell" | "dividend";

/**
 * A single logged transaction as returned by the API.
 * `dateObj` is a client-side computed field (not in API response);
 * it is parsed from `date` using pdFull() when building the data layer.
 */
export interface Transaction {
  id: string;
  /** Display date "Mon DD YYYY" e.g. "Jan 15 2024" */
  date: string;
  type: TransactionType;
  /** Asset name at time of transaction */
  asset: string;
  ticker: string | null;
  /** Total transaction value in INR */
  amount: number;
  /** Quantity of shares bought/sold. Null for NPS/FD/Cash. */
  qty: number | null;
  /** Price per share. Null for NPS/FD/Cash. */
  price: number | null;
  notes: string;
  category: TransactionCategory;
  /**
   * Parsed Date object for sorting and chart grouping.
   * Computed client-side from `date` via pdFull() — not returned by API.
   */
  dateObj: Date;
}
