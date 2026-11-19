import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

const initialState = {
  summary: null,
  transactions: [],
  cards: [],
  quickTransferUsers: [],
  isLoading: false,
  error: null,
}

export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/summary')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard')
    }
  }
)

export const fetchTransactions = createAsyncThunk(
  'dashboard/fetchTransactions',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(`/transactions?page=${page}&size=${size}`)
      return response.data.content
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions')
    }
  }
)

export const fetchCards = createAsyncThunk(
  'dashboard/fetchCards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cards')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cards')
    }
  }
)

export const fetchQuickTransferUsers = createAsyncThunk(
  'dashboard/fetchQuickTransferUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/quick-transfer-users')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.summary = null
      state.transactions = []
      state.cards = []
      state.quickTransferUsers = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.isLoading = false
        state.summary = action.payload
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.cards = action.payload
      })
      .addCase(fetchQuickTransferUsers.fulfilled, (state, action) => {
        state.quickTransferUsers = action.payload
      })
  },
})

export const { clearDashboard } = dashboardSlice.actions
export default dashboardSlice.reducer
