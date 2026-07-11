import API from './auth'

export const getMonthlySummary = async (month?: number, year?: number) => {
  const response = await API.get('/analytics/summary', { params: { month, year } })
  return response.data.data
}

export const compareMonths = async (month?: number, year?: number) => {
  const response = await API.get('/analytics/compare', { params: { month, year } })
  return response.data.data
}

export const getTodayTotal = async () => {
  const response = await API.get('/analytics/today')
  return response.data.data
}