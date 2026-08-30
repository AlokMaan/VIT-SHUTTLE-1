import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Dashboard stat card with icon, value, label, and optional trend indicator.
 *
 * Props:
 * - icon: lucide-react icon component
 * - label: string
 * - value: string | number
 * - trend: number | null (percentage change, positive = up)
 * - color: string (CSS color for icon background, e.g. 'var(--primary)')
 * - loading: boolean
 */
export default function StatCard({
  icon: Icon,
  label,
  value,
  trend = null,
  color = 'var(--primary)',
  loading = false,
}) {
  const trendColor =
    trend > 0 ? 'var(--green)' : trend < 0 ? 'var(--red)' : 'var(--text-4)';
  const TrendIcon =
    trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <div
      className="rounded-xl p-5 transition-all duration-200"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          {Icon && <Icon size={20} style={{ color }} />}
        </div>
        {trend !== null && (
          <div className="flex items-center gap-1" style={{ color: trendColor }}>
            <TrendIcon size={14} />
            <span className="text-xs font-semibold">
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div
            className="h-7 w-20 rounded-lg animate-pulse"
            style={{ background: 'var(--surface-2)' }}
          />
          <div
            className="h-4 w-16 rounded-md animate-pulse"
            style={{ background: 'var(--surface-2)' }}
          />
        </div>
      ) : (
        <>
          <p
            className="text-2xl font-bold tracking-tight mb-0.5"
            style={{ color: 'var(--text)' }}
          >
            {value}
          </p>
          <p className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>
            {label}
          </p>
        </>
      )}
    </div>
  );
}
