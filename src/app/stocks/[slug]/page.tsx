import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStockBySlug, stocks } from "@/data/stocks";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return stocks.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const stock = getStockBySlug(slug);
  if (!stock) return { title: "Not Found" };
  return {
    title: `${stock.name} (${stock.ticker})`,
    description: stock.thesis,
  };
}

export default async function StockDetailPage({ params }: Props) {
  const { slug } = await params;
  const stock = getStockBySlug(slug);

  if (!stock) {
    notFound();
  }

  return (
    <iframe
      src={`/analyses/${slug}_analysis.html`}
      title={`${stock.name} — Deep Analysis`}
      className="w-full flex-1 border-0"
      style={{ height: "calc(100vh - 56px)" }}
    />
  );
}
