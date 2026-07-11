import { useState } from 'react'
import type { ParsedExpense } from '../types'
import { saveExpense } from '../api/expenses'
import ColorPicker from './ColorPicker'

interface ConfirmCardProps {
  parsed: ParsedExpense
  onSaved: () => void
  onCancel: () => void
}

const ConfirmCard = ({ parsed, onSaved, onCancel }: ConfirmCardProps) => {
  const [item, setItem] = useState(parsed.item)
  const [amount, setAmount] = useState(parsed.amount?.toString() || '')
  const [category, setCategory] = useState(
    parsed.suggested_new_category || parsed.category
  )
  const [color, setColor] = useState('#51CF66')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    try {
      setError('')
      setSaving(true)

      if (!item || !amount || !category) {
        setError('All fields are required')
        return
      }

      if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        setError('Amount must be a positive number')
        return
      }

      await saveExpense({
        raw_input: parsed.raw_input,
        item,
        amount: parseFloat(amount),
        category_name: category,
        color,
      })

      onSaved()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save expense')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xl mt-2">

      {/* Item + Amount */}
      <div className="flex items-center justify-between mb-4">
        <input
          value={item}
          onChange={e => setItem(e.target.value)}
          className="font-semibold text-gray-900 text-lg focus:outline-none border-b-2 border-transparent focus:border-green-400 transition-colors flex-1 mr-4"
          placeholder="Item name"
        />
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-gray-500 font-medium">₹</span>
          <input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="font-bold text-gray-900 text-lg w-24 text-right focus:outline-none border-b-2 border-transparent focus:border-green-400 transition-colors"
            type="number"
            placeholder="0"
          />
        </div>
      </div>

      {/* Category + Color */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          {/* Color dot — shows selected color */}
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <input
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="flex-1 text-sm font-medium text-gray-700 focus:outline-none border-b border-transparent focus:border-gray-300"
            placeholder="Category name"
          />
          <span className="text-xs text-gray-400 flex-shrink-0">
            {parsed.confidence === 'high' ? '✓ AI categorized' : '⚠ New category'}
          </span>
        </div>

        {/* Color picker — always visible */}
        <div className="p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 mb-2 font-medium">
            Category color:
          </p>
          <ColorPicker selected={color} onChange={setColor} />
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-xl text-sm font-medium text-white transition-colors"
        >
          {saving ? 'Saving...' : '✓ Save'}
        </button>
      </div>
    </div>
  )
}

export default ConfirmCard