<template>
  <div class="bg-white rounded-lg shadow-md">
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900">
        รายการธุรกรรมล่าสุด
      </h3>
    </div>
    
    <div class="p-6">
      <div v-if="error" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
        {{ error }}
      </div>
      
      <div v-if="loading" class="flex justify-center py-8">
        <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      
      <div v-else-if="transactions.length === 0" class="text-center py-8 text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <p class="mt-2">ยังไม่มีรายการธุรกรรม</p>
        <p class="text-sm">เริ่มต้นด้วยการฝากหรือถอนเงินครั้งแรก</p>
      </div>
      
      <div v-else class="space-y-4">
        <!-- Transaction Items -->
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <div class="flex items-center space-x-4">
            <!-- Transaction Icon -->
            <div :class="[
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
              transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
            ]">
              <svg 
                :class="[
                  'w-5 h-5',
                  transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                ]"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  v-if="transaction.type === 'deposit'"
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
                <path 
                  v-else
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M20 12H4"
                />
              </svg>
            </div>
            
            <!-- Transaction Details -->
            <div>
              <p class="text-sm font-medium text-gray-900">
                {{ transaction.type === 'deposit' ? 'ฝากเงิน' : 'ถอนเงิน' }}
              </p>
              <p class="text-sm text-gray-500">
                {{ formatDate(transaction.created_at) }}
              </p>
              <p v-if="transaction.description" class="text-sm text-gray-600 mt-1">
                {{ transaction.description }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <!-- Amount -->
            <div class="text-right">
              <p :class="[
                'text-sm font-medium',
                transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
              ]">
                {{ transaction.type === 'deposit' ? '+' : '-' }}฿{{ formatAmount(transaction.amount) }}
              </p>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex space-x-2">
              <!-- Edit button - Only show for deposit transactions -->
              <button
                v-if="transaction.type === 'deposit'"
                @click="editTransaction(transaction)"
                class="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                title="แก้ไขรายการ"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <!-- Delete button - Show for both deposit and withdraw -->
              <button
                @click="confirmDelete(transaction)"
                class="text-red-600 hover:text-red-800 transition-colors duration-200"
                :title="transaction.type === 'withdraw' ? 'ลบรายการถอนเงิน' : 'ลบรายการ'"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <div class="text-sm text-gray-700">
            แสดง {{ ((pagination.page - 1) * pagination.limit) + 1 }} ถึง 
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} จาก 
            {{ pagination.total }} รายการ
          </div>
          <div class="flex space-x-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ก่อนหน้า
            </button>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages"
              class="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'TransactionList',
  computed: {
    ...mapGetters('transactions', ['transactions', 'pagination', 'loading', 'error'])
  },
  methods: {
    ...mapActions('transactions', ['fetchTransactions']),
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatAmount(amount) {
      return Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    
    editTransaction(transaction) {
      this.$emit('edit-transaction', transaction)
    },
    
    confirmDelete(transaction) {
      this.$emit('delete-transaction', transaction)
    },
    
    async changePage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        await this.fetchTransactions({ page, limit: this.pagination.limit })
      }
    }
  }
}
</script>