interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: "orange" | "blue" | "green";
}

const accentMap = {
  orange: "bg-orange-50 text-brand-orange",
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
};

export function StatCard({ label, value, icon, accent = "orange" }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-brand-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentMap[accent]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
