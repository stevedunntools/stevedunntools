import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** A titled input/result card in the house style. */
export default function ToolCard({ title, children, className, contentClassName }: { title: string; children: React.ReactNode; className?: string; contentClassName?: string }) {
  return (
    <Card className={`bg-white border-brand-border${className ? ` ${className}` : ""}`}>
      <CardHeader>
        <CardTitle className="text-brand-primary text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
