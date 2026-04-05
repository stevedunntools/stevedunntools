import { fmt } from "@/lib/format";

interface RowProps {
  label: string;
  value: string | number;
  bold?: boolean;
  negative?: boolean;
}

export function Row({ label, value, bold, negative }: RowProps) {
  const formatted =
    typeof value === "number"
      ? negative && value !== 0
        ? `(${fmt(Math.abs(value))})`
        : fmt(value)
      : value;

  return (
    <tr>
      <td
        className={`py-1.5 ${bold ? "font-medium text-brand-primary" : "text-brand-muted"}`}
      >
        {label}
      </td>
      <td
        className={`py-1.5 text-right tabular-nums ${
          bold
            ? "font-medium text-brand-primary"
            : negative && value !== 0
            ? "text-brand-error"
            : "text-brand-muted"
        }`}
      >
        {formatted}
      </td>
    </tr>
  );
}

export function Separator() {
  return (
    <tr>
      <td colSpan={2} className="py-1">
        <div className="border-t border-brand-border" />
      </td>
    </tr>
  );
}
