import { forwardRef } from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = "", ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={`w-full rounded-lg border border-stone-200 bg-[#f9f6ef] px-4 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none ${className}`}
      {...props}
    />
  );
});

export default Textarea;
