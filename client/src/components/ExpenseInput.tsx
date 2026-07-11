import { useState } from 'react'
import { parseExpense } from '../api/expenses'
import type { ParsedExpense } from '../types'

interface ExpenseInputProps {
  onParsed: (parsed: ParsedExpense, rawInput: string) => void
}

const ExpenseInput = ({ onParsed }: ExpenseInputProps) => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!input.trim()) return
    try {
      setError('')
      setLoading(true)
      const parsed = await parseExpense(input.trim())
      onParsed(parsed, input.trim())
      setInput('')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to parse expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-1">
      {loading && (
        <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
      )}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !loading && handleSubmit()}
        placeholder="What did you spend on?"
        className="flex-1 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
        disabled={loading}
      />
      {input.trim() && !loading && (
        <button
          onClick={handleSubmit}
          className="w-7 h-7 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
        >
          <span className="text-white text-xs font-bold">→</span>
        </button>
      )}
      {error && (
        <p className="text-red-500 text-xs absolute top-full mt-1">{error}</p>
      )}
    </div>
  )
}

export default ExpenseInput