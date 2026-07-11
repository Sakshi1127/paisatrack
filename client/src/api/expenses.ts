import API from './auth'
import type { Expense, ParsedExpense } from '../types'

export const parseExpense = async (rawInput: string): Promise<ParsedExpense> => {
  const response = await API.post('/expenses/parse', { raw_input: rawInput })
  return response.data.data
}

export const saveExpense = async (data: {
  raw_input: string
  item: string
  amount: number
  category_name: string
  date?: string
  color?: string
}): Promise<Expense> => {
  const response = await API.post('/expenses', data)
  return response.data.data
}

export const getExpenses = async (month?: number, year?: number) => {
  const response = await API.get('/expenses', { params: { month, year } })
  return response.data.data
}

export const deleteExpense = async (id: number) => {
  const response = await API.delete(`/expenses/${id}`)
  return response.data
}

export const updateExpense = async (id: number, data: {
  item: string
  amount: number
  category_name: string
  date: string
}) => {
  const response = await API.put(`/expenses/${id}`, data)
  return response.data
}