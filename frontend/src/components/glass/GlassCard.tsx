interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = false }: GlassCardProps) {
  const baseStyles = 'rounded-2xl bg-white border border-gray-200 shadow-sm';
  const hoverStyles = hover
    ? 'transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-gray-300'
    : '';

  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
