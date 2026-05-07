"use client";
import dynamic from "next/dynamic";

const PhoenixApp = dynamic(() => import("@/components/layout/PhoenixApp"), {
  ssr: false,
  loading: () => null,
});

export default function PhoenixAppLoader() {
  return <PhoenixApp />;
}
