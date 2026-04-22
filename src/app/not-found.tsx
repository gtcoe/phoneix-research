import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-5xl font-semibold text-gray-200">404</p>
      <h1 className="mt-4 text-xl font-semibold text-gray-900">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        This stock analysis doesn&apos;t exist yet.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
      >
        Back to all stocks
      </Link>
    </div>
  );
}
