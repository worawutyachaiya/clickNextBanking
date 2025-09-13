import api from './api'

export const authService = {
  login(credentials) {
    return api.post('/auth/login', credentials)
  },
  
  register(userData) {
    return api.post('/auth/register', userData)
  }
}

export const userService = {
  getProfile() {
    return api.get('/users/profile')
  },
  
  getBalance() {
    return api.get('/users/balance')
  }
}

export const transactionService = {
  getTransactions(page = 1, limit = 10) {
    return api.get(`/transactions?page=${page}&limit=${limit}`)
  },
  
  createTransaction(transactionData) {
    return api.post('/transactions', transactionData)
  },
  
  updateTransaction(id, transactionData) {
    return api.put(`/transactions/${id}`, transactionData)
  },
  
  deleteTransaction(id) {
    return api.delete(`/transactions/${id}`)
  }
}