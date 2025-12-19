interface SentimentBadgeProps {
  sentiment: string;
}

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const getColor = () => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-success/20 text-success border-success/30';
      case 'negative':
        return 'bg-danger/20 text-danger border-danger/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getLabel = () => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'ポジティブ';
      case 'negative':
        return 'ネガティブ';
      default:
        return '中立';
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold border backdrop-blur-sm ${getColor()}`}
    >
      {getLabel()}
    </span>
  );
}
