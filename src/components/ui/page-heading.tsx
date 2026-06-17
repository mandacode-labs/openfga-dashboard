import type { ReactNode } from "react";

interface PageHeadingProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeading({
  title,
  description,
  children,
}: PageHeadingProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
