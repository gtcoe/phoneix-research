'use client';
import dynamic from 'next/dynamic';

const PhoenixApp = dynamic(
  () => import('@/components/phoenix/PhoenixApp'),
  { ssr: false }
);

export default function HomePage() {
  return <PhoenixApp />;
}

