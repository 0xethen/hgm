import * as React from "react";
import { Link } from "@tanstack/react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#/components/ui/breadcrumb";
import { cn } from "#/lib/utils";
import type { Crumb } from "#/lib/routing";

export function Breadcrumbs({
  crumbs,
  className,
}: {
  crumbs: readonly Crumb[];
  className?: string;
}) {
  return (
    // no gutters of its own: __root's page container already put it where the page starts
    <Breadcrumb className={cn("w-full pb-5", className)}>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <React.Fragment key={crumb.pathname}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage aria-current={isLast ? "page" : undefined}>
                    {crumb.label}
                  </BreadcrumbPage>
                ) : crumb.linkable ? (
                  <BreadcrumbLink render={<Link to={crumb.pathname as string} />}>
                    {crumb.label}
                  </BreadcrumbLink>
                ) : (
                  crumb.label
                )}
              </BreadcrumbItem>
              {isLast ? null : <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
