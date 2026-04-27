/**
 * Transaction service — resolves the transaction log.
 * Current impl: synchronous mock. Backend swap: replace body with fetch('/api/v1/transactions').
 */
import { phoenixData } from "@/lib/data";
import type { Transaction } from "@/types/transaction";

export function getTransactions(): Transaction[] {
  // TODO: return (await fetch('/api/v1/transactions')).json()
  return phoenixData.transactions;
}
