type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  lines?: number;
};

function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-stone-200/70 ${className}`}
      aria-hidden="true"
    />
  );
}

export default function Skeleton({ lines = 3, className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`rounded-xl border border-stone-200 bg-white/70 p-5 ${className}`}
      aria-label="読み込み中"
      {...props}
    >
      <SkeletonLine className="mb-3 h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          className={`mb-2 h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}
