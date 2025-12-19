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
      {speakers.map((speaker) => (
        <div key={speaker.id} className="space-y-2">
          <h4 className="text-sm font-semibold text-primary-400">
            話者 {speaker.id}
          </h4>
          {speaker.segments.map((segment) => (
            <div
              key={segment.id}
              className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1"
            >
              <p className="text-xs text-gray-400">
                {formatTime(segment.start)} - {formatTime(segment.end)}
              </p>
              <p className="text-gray-200">{segment.text}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
