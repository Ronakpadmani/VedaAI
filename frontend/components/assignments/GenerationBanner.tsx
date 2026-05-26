"use client";

interface GenerationBannerProps {
  message: string;
  progress: number;
  teacherName?: string;
}

export function GenerationBanner({
  message,
  progress,
  teacherName = "Lakshya",
}: GenerationBannerProps) {
  return (
    <div className="rounded-2xl bg-brand-dark p-5 text-white lg:p-6">
      <p className="text-sm leading-relaxed lg:text-base">
        {progress < 100 ? (
          <>
            Generating your question paper, {teacherName}!{" "}
            <span className="text-gray-400">{message}</span>
          </>
        ) : (
          <>
            Certainly, {teacherName}! Here are customized Question Papers for
            your classes:
          </>
        )}
      </p>
      {progress < 100 && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-gray-700">
            <div
              className="h-full rounded-full bg-brand-orange transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">{progress}% complete</p>
        </div>
      )}
    </div>
  );
}
