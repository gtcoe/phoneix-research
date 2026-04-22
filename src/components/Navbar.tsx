"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isDetailPage = pathname.startsWith("/stocks/");

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors"
        >
          <span className="text-lg font-semibold tracking-tight">
            Phoenix Research
          </span>
        </Link>

        {/* Back button on detail pages */}
        {isDetailPage && (
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            All stocks
          </Link>
        )}
      </div>
    </header>
  );
}
