import { useState } from 'react'
import { updateExpense } from '../api/expenses'

interface EditExpenseRowProps {
  expense: any
  onSaved: () => void
  onCancel: () => void
}

const EditExpenseRow = ({ expense, onSaved, onCancel }: EditExpenseRowProps) => {
  const [item, setItem] = useState(expense.item)
  const [amount, setAmount] = useState(expense.amount.toString())
  const [category, setCategory] = useState(expense.category)
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

      await updateExpense(expense.id, {
        item,
        amount: parseFloat(amount),
        category_name: category,
        date: expense.date,
      })

      onSaved()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update expense')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="px-4 py-3 border-l-4 transition-all"
      style={{ borderLeftColor: expense.category_color || '#51CF66' }}
    >
      {/* Edit fields */}
      <div className="flex items-center gap-3 mb-3">
        {/* Item name */}
        <input
          value={item}
          onChange={e => setItem(e.target.value)}
          className="flex-1 text-sm font-medium text-gray-900 border-b-2 border-green-400 focus:outline-none bg-transparent py-1"
          placeholder="Item name"
          autoFocus
        />

        {/* Amount */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-gray-400 text-sm">₹</span>
          <input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-20 text-sm font-bold text-gray-900 border-b-2 border-green-400 focus:outline-none bg-transparent py-1 text-right"
            type="number"
            placeholder="0"
          />
        </div>
      </div>

      {/* Category */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: expense.category_color || '#51CF66' }}
        />
        <input
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="text-xs font-medium text-gray-600 border-b border-gray-300 focus:outline-none bg-transparent py-0.5 flex-1"
          placeholder="Category"
        />
      </div>

      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : '✓ Save'}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default EditExpenseRow