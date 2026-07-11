interface StatCardProps {
  title: string
  value: string
  subtitle: string
  gradient: string
}

// Why a separate component?
// The 3 cards on Home page all look the same
// but have different colors and data.
// Instead of copy pasting the same div 3 times
// we make one reusable component and pass different props

const StatCard = ({ title, value, subtitle, gradient }: StatCardProps) => {
  return (
    <div className={`${gradient} rounded-2xl p-5 text-white relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />

      <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-2">
        {title}
      </p>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-white/70 text-sm">{subtitle}</p>
    </div>
  )
}

export default StatCard