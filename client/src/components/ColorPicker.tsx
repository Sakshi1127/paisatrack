interface ColorPickerProps {
  selected: string
  onChange: (color: string) => void
}

// Suggested quick colors — common ones for categories
const QUICK_COLORS = [
  '#FF6B6B', '#FF922B', '#FAB005', '#51CF66',
  '#20C997', '#339AF0', '#845EF7', '#F06595',
  '#868E96', '#343A40',
]

const ColorPicker = ({ selected, onChange }: ColorPickerProps) => {
  return (
    <div className="space-y-3">

      {/* Quick color suggestions */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Quick pick</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_COLORS.map(color => (
            <button
              key={color}
              onClick={() => onChange(color)}
              className="w-7 h-7 rounded-full transition-all hover:scale-110 flex-shrink-0"
              style={{
                backgroundColor: color,
                boxShadow: selected === color
                  ? `0 0 0 2px white, 0 0 0 4px ${color}`
                  : 'none',
                transform: selected === color ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Native color input — pick any color */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Or pick any color</p>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={selected}
            onChange={e => onChange(e.target.value)}
            className="w-10 h-10 rounded-xl cursor-pointer border-2 border-gray-200 p-0.5"
          />
          <span
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{
              backgroundColor: `${selected}20`,
              color: selected,
              border: `1px solid ${selected}40`
            }}
          >
            {selected}
          </span>
          <span className="text-xs text-gray-400">← preview</span>
        </div>
      </div>

    </div>
  )
}

export default ColorPicker