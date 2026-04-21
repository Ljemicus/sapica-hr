import type { ReactNode } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

export interface PublicPageShellProps {
  breadcrumbItems?: { label: string; href: string }[];
  children: ReactNode;
}

export function PublicPageShell({ breadcrumbItems, children }: PublicPageShellProps) {
  return (
    <div>
      {breadcrumbItems && breadcrumbItems.length > 0 ? <Breadcrumbs items={breadcrumbItems} /> : null}
      {children}
    </div>
  );
}
