import { authService } from '../../services'
import router from '../../router'

const TOKEN_KEY = 'banking_token'
const USER_KEY = 'banking_user'

const state = {
  token: localStorage.getItem(TOKEN_KEY),
  user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  loading: false,
  error: null
}

const getters = {
  token: (state) => state.token,
  user: (state) => state.user,
  isAuthenticated: (state) => state.isAuthenticated,
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
  
  SET_AUTH(state, { token, user }) {
    state.token = token
    state.user = user
    state.isAuthenticated = true
    state.error = null
    
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  
  CLEAR_AUTH(state) {
    state.token = null
    state.user = null
    state.isAuthenticated = false
    state.error = null
    
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
  
  UPDATE_USER_BALANCE(state, balance) {
    if (state.user) {
      state.user.balance = balance
      localStorage.setItem(USER_KEY, JSON.stringify(state.user))
    }
  }
}

const actions = {
  async login({ commit }, credentials) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await authService.login(credentials)
      const { token, user } = response.data
      
      commit('SET_AUTH', { token, user })
      router.push('/dashboard')
      
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async register({ commit }, userData) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await authService.register(userData)
      const { token, user } = response.data
      
      commit('SET_AUTH', { token, user })
      router.push('/dashboard')
      
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  logout({ commit }) {
    commit('CLEAR_AUTH')
    // Only navigate to login if not already there
    if (router.currentRoute.path !== '/login') {
      router.push('/login').catch(err => {
        // Ignore navigation duplicated error
        if (err.name !== 'NavigationDuplicated') {
          console.error('Navigation error:', err)
        }
      })
    }
  },
  
  updateBalance({ commit }, balance) {
    commit('UPDATE_USER_BALANCE', balance)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}