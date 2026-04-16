type SectionLabelProps = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionLabel({ children, className = "" }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-3 mb-4 ${className}`}>
      <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-stone-400 whitespace-nowrap">
        {children}
      </span>
      <span className="flex-1 border-t border-stone-200" />
    </div>
  );
}
