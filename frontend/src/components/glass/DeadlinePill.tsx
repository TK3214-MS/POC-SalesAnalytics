interface DeadlinePillProps {
  days: number;
}

export function DeadlinePill({ days }: DeadlinePillProps) {
  const isUrgent = days <= 1;
  const isWarning = days > 1 && days <= 3;

  let bgColor = 'bg-success/20';
  let textColor = 'text-success';

  if (isUrgent) {
    bgColor = 'bg-danger/20';
    textColor = 'text-danger';
  } else if (isWarning) {
    bgColor = 'bg-warning/20';
    textColor = 'text-warning';
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${bgColor} ${textColor} backdrop-blur-sm border border-current/20`}
    >
      {days <= 0 ? '期限切れ' : `残り${days}日`}
    </span>
  );
}
