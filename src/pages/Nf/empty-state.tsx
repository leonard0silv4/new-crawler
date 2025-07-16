import { FileText } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionButton?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionButton,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="w-16 h-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
}
