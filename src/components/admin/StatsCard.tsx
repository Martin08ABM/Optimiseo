interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, subtitle, trend }: StatsCardProps) {
  return (
    <div className="bg-gray-800 border-2 border-gray-600 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">{title}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
        )}
        {trend && (
          <p className={`mt-2 text-sm font-medium ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </p>
        )}
      </div>
    </div>
  );
}