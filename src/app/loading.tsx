export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f9f6ef] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">
          Loading
        </p>
      </div>
    </div>
  );
}
