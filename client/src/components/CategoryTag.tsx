interface CategoryTagProps {
  name: string
  color: string
  time?: string
}

// Why this component?
// Every expense in the list shows a colored category pill
// Used in ExpenseList — reusable across the app

const CategoryTag = ({ name, color, time }: CategoryTagProps) => {
  return (
    <div className="flex items-center gap-2">
      <span
        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ backgroundColor: `${color}20`, color: color }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        {name}
      </span>
      {time && <span className="text-xs text-gray-400">{time}</span>}
    </div>
  )
}

export default CategoryTag