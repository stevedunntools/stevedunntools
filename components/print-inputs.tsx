/**
 * Print-only summary of what the user entered, so a saved PDF carries its
 * assumptions. Inputs themselves are hidden in print (see globals.css).
 */
export default function PrintInputs({ items }: { items: Array<{ label: string; value: string | number | null | undefined }> }) {
  const rows = items.filter((i) => i.value !== "" && i.value !== null && i.value !== undefined);
  if (rows.length === 0) return null;
  return (
    <dl className="hidden print:grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm mb-6">
      {rows.map((i) => (
        <div key={i.label} className="contents">
          <dt className="text-brand-muted">{i.label}</dt>
          <dd className="text-brand-primary font-medium">{String(i.value)}</dd>
        </div>
      ))}
    </dl>
  );
}
