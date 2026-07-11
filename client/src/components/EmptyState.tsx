interface EmptyStateProps {
  icon?: string
  title: string
  subtitle?: string
}

const EmptyState = ({ icon = '💸', title, subtitle }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 gap-2">
      <p className="text-4xl mb-1">{icon}</p>
      <p className="text-sm font-semibold text-gray-500">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 text-center max-w-xs">{subtitle}</p>}
    </div>
  )
}

export default EmptyState