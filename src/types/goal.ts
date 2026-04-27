/**
 * Financial goal types.
 * Mirrors GET /api/v1/goals response shape.
 */

/** A single financial goal tracked in the Goal Planning tool. */
export interface Goal {
  id: string;
  name: string;
  /** Target corpus amount in INR */
  targetAmount: number;
  /** Calendar year to reach the target */
  targetYear: number;
  /** Current amount already accumulated toward this goal */
  currentAmount: number;
  /** Monthly SIP / contribution toward this goal */
  monthlyAddition: number;
  /** Emoji icon for display */
  icon: string;
  /** CSS color string for the progress bar */
  color: string;
}
