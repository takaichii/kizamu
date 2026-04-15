"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f9f6ef] flex items-center justify-center px-5">
      <div className="w-full max-w-sm text-center">
        <p className="text-[10px] font-mono tracking-widest text-stone-400 uppercase mb-4">
          Error
        </p>
        <h1 className="font-[family-name:var(--font-serif)] text-2xl font-bold text-stone-800 mb-2">
          問題が発生しました
        </h1>
        <p className="text-sm text-stone-500 mb-6 leading-relaxed">
          {error.message || "予期しないエラーが発生しました。"}
        </p>
        {error.digest && (
          <p className="text-[10px] font-mono text-stone-300 mb-6">
            {error.digest}
          </p>
        )}
        <button
          onClick={unstable_retry}
          className="rounded-lg bg-stone-800 px-6 py-2.5 text-sm font-medium text-stone-50 hover:bg-stone-700 transition-colors"
        >
          もう一度試す
        </button>
      </div>
    </div>
  );
}
