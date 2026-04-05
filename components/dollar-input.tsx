interface DollarInputProps {
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  placeholder?: string;
  className?: string;
}

const baseClass =
  "w-full pl-7 pr-3 py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent";

export default function DollarInput({
  value,
  onChange,
  onCommit,
  placeholder,
  className,
}: DollarInputProps) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">
        $
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        onKeyDown={(e) => e.key === "Enter" && onCommit()}
        placeholder={placeholder}
        className={className ?? baseClass}
      />
    </div>
  );
}

export { baseClass as dollarInputClass };
