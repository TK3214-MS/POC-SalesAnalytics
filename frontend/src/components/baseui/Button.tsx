interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  as?: 'button' | 'span';
}

export function Button({
  children,
  variant = 'primary',
  as = 'button',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'px-6 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary:
      'bg-white hover:bg-gray-100 text-black focus:ring-gray-500 shadow-lg hover:shadow-xl border border-gray-200',
    secondary:
      'bg-white/10 hover:bg-white/20 border border-white/30 text-white focus:ring-white/50 backdrop-blur-sm',
    danger:
      'bg-danger hover:bg-red-600 text-white focus:ring-danger shadow-lg hover:shadow-xl',
  };

  const Component = as;

  return (
    <Component
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...(as === 'button' ? props : {})}
    >
      {children}
    </Component>
  );
}
