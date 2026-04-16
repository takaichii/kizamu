import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f9f6ef] flex items-center justify-center px-5">
      <div className="w-full max-w-sm text-center">
        <p className="text-[10px] font-mono tracking-[0.25em] text-stone-300 uppercase mb-4">
          404
        </p>
        <h1 className="font-[family-name:var(--font-serif)] text-2xl font-bold text-stone-800 mb-2">
          ページが見つかりません
        </h1>
        <p className="text-sm text-stone-500 mb-8 leading-relaxed">
          このページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-stone-800 px-6 py-2.5 text-sm font-medium text-stone-50 hover:bg-stone-700 transition-colors"
        >
          ホームへ戻る
        </Link>
      </div>
    </div>
  );
}
