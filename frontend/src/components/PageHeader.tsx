'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between mb-8">
      <div className="flex-1">
        <h1 className="text-4xl font-bold text-black">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 mt-2">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="ml-4">
          {actions}
        </div>
      )}
    </header>
  );
}
