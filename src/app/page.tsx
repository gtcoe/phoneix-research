"use client";
import dynamic from "next/dynamic";

const PhoenixApp = dynamic(() => import("@/components/layout/PhoenixApp"), {
  ssr: false,
});

export default function HomePage() {
  return <PhoenixApp />;
}
