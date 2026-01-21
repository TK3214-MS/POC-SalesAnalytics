interface Speaker {
  id: string;
  segments: Array<{
    id: string;
    text: string;
    start: number;
    end: number;
  }>;
}

interface SpeakerTimelineProps {
  speakers: Speaker[];
}

export function SpeakerTimeline({ speakers }: SpeakerTimelineProps) {
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {speakers.map((speaker, idx) => (
        <div key={speaker.id} className="space-y-2">
          <h4 className="text-sm font-semibold text-primary-600">
            {idx === 0 ? '営業担当' : '顧客'} (話者 {speaker.id})
          </h4>
          {speaker.segments.map((segment) => (
            <div
              key={segment.id}
              className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 space-y-1 hover:shadow-md transition-shadow"
            >
              <p className="text-xs text-gray-500 font-medium">
                {formatTime(segment.start)} - {formatTime(segment.end)}
              </p>
              <p className="text-gray-900 leading-relaxed">{segment.text}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
