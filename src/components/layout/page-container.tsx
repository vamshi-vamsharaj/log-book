import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function PageContainer({ title, description, className, children, ...props }: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6", className)} {...props}>
      {title ? (
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}