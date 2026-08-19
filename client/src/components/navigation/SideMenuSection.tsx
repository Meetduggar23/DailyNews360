import * as React from "react";
import { cn } from "@/lib/utils";

interface SideMenuSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A titled block inside the side menu with a thin rule underneath,
 * matching the newspaper's section-heading style.
 */
export function SideMenuSection({ title, children, className }: SideMenuSectionProps) {
  return (
    <section className={cn("px-6 py-4", className)}>
      {title ? (
        <h3 className="mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-mist">
          {title}
        </h3>
      ) : null}
      {children}
    </section>
  );
}