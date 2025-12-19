interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}

export function Select({ value, onChange, options, className = '' }: SelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all backdrop-blur-sm ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-slate-900">
          {option.label}
        </option>
      ))}
    </select>
  );
}
