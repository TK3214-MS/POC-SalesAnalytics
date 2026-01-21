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
      'bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-500 shadow-lg hover:shadow-xl',
    secondary:
      'bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 focus:ring-gray-500 shadow-md hover:shadow-lg',
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
