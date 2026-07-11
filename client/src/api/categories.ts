import API from './auth'

export const getCategories = async () => {
  const response = await API.get('/categories')
  return response.data.data
}

export const createCategory = async (name: string, color: string) => {
  const response = await API.post('/categories', { name, color })
  return response.data.data
}

export const deleteCategory = async (id: number) => {
  const response = await API.delete(`/categories/${id}`)
  return response.data
}