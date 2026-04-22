import { stocks } from "@/data/stocks";
import StockGrid from "@/components/StockGrid";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Stock Research
        </h1>
        <p className="mt-2 text-base text-gray-500">
          Deep-dive analysis on high-conviction ideas. Click any card to read
          the full report.
        </p>
      </div>

      <StockGrid stocks={stocks} />
    </div>
  );
}

