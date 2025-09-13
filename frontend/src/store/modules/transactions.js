import { transactionService } from '../../services'

const state = {
  transactions: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  loading: false,
  error: null
}

const getters = {
  transactions: (state) => state.transactions,
  pagination: (state) => state.pagination,
  loading: (state) => state.loading,
  error: (state) => state.error
}

const mutations = {
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  SET_TRANSACTIONS(state, { transactions, pagination }) {
    state.transactions = transactions
    state.pagination = pagination
  },
  
  ADD_TRANSACTION(state, transaction) {
    state.transactions.unshift(transaction)
  },
  
  UPDATE_TRANSACTION(state, updatedTransaction) {
    const index = state.transactions.findIndex(t => t.id === updatedTransaction.id)
    if (index !== -1) {
      state.transactions.splice(index, 1, updatedTransaction)
    }
  },
  
  REMOVE_TRANSACTION(state, transactionId) {
    state.transactions = state.transactions.filter(t => t.id !== transactionId)
  }
}

const actions = {
  async fetchTransactions({ commit }, { page = 1, limit = 10 } = {}) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await transactionService.getTransactions(page, limit)
      const { transactions, pagination } = response.data
      
      commit('SET_TRANSACTIONS', { transactions, pagination })
      
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch transactions'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async createTransaction({ commit, dispatch }, transactionData) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await transactionService.createTransaction(transactionData)
      const { transaction, newBalance } = response.data
      
      commit('ADD_TRANSACTION', transaction)
      dispatch('auth/updateBalance', newBalance, { root: true })
      
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create transaction'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async updateTransaction({ commit, dispatch }, { id, transactionData }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await transactionService.updateTransaction(id, transactionData)
      const { transaction, newBalance } = response.data
      
      commit('UPDATE_TRANSACTION', transaction)
      dispatch('auth/updateBalance', newBalance, { root: true })
      
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update transaction'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async deleteTransaction({ commit, dispatch }, transactionId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await transactionService.deleteTransaction(transactionId)
      const { newBalance } = response.data
      
      commit('REMOVE_TRANSACTION', transactionId)
      dispatch('auth/updateBalance', newBalance, { root: true })
      
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete transaction'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}