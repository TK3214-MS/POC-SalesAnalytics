interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = false }: GlassCardProps) {
  const baseStyles = 'rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl';
  const hoverStyles = hover
    ? 'transition-all duration-300 hover:bg-white/15 hover:shadow-2xl hover:scale-[1.02] hover:border-white/30'
    : '';

  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
