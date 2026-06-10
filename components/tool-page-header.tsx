import SteveNote from "@/components/steve-note";
import { toolCategory } from "@/lib/navigation";

interface ToolPageHeaderProps {
  /** Tool route, e.g. "/tools/bracket-generator" — used to look up the category label. */
  href: string;
  title: string;
  description: string;
  note?: string;
}

export default function ToolPageHeader({
  href,
  title,
  description,
  note,
}: ToolPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 print:hidden">
      <div>
        <p className="text-sm font-medium text-brand-accent mb-1">
          {toolCategory(href)}
        </p>
        <h1 className="text-3xl font-bold text-brand-primary">{title}</h1>
        <p className="mt-2 text-brand-muted max-w-2xl">{description}</p>
      </div>
      {note && <SteveNote note={note} />}
    </div>
  );
}
