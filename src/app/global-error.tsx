"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html lang="ja">
      <body className="min-h-screen bg-[#f9f6ef] flex items-center justify-center px-5">
        <div className="w-full max-w-sm text-center">
          <p className="text-[10px] font-mono tracking-widest text-stone-400 uppercase mb-4">
            Critical Error
          </p>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">
            アプリが応答できません
          </h1>
          <p className="text-sm text-stone-500 mb-6">
            深刻なエラーが発生しました。ページをリロードしてください。
          </p>
          <button
            onClick={reset}
            className="rounded-lg bg-stone-800 px-6 py-2.5 text-sm font-medium text-stone-50 hover:bg-stone-700 transition-colors"
          >
            リロード
          </button>
        </div>
      </body>
    </html>
  );
}
