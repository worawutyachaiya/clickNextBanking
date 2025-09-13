<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>
      
      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                ลบรายการธุรกรรม
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  คุณแน่ใจหรือไม่ที่จะลบรายการธุรกรรมนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้และจะส่งผลต่อยอดเงินในบัญชีของคุณ
                </p>
                <div v-if="transaction" class="mt-4 p-4 bg-gray-50 rounded-md">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-gray-900 capitalize">
                        {{ transaction.type }}
                      </p>
                      <p class="text-sm text-gray-500">
                        {{ formatDate(transaction.created_at) }}
                      </p>
                    </div>
                    <div class="text-right">
                      <p :class="[
                        'text-sm font-medium',
                        transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      ]">
                        {{ transaction.type === 'deposit' ? '+' : '-' }}฿{{ formatAmount(transaction.amount) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="error" class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {{ error }}
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="confirmDelete"
            :disabled="loading"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            {{ loading ? 'กำลังลบ...' : 'ลบ' }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'DeleteModal',
  props: {
    transaction: {
      type: Object,
      default: null
    },
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      error: ''
    }
  },
  computed: {
    ...mapGetters('transactions', ['loading'])
  },
  watch: {
    isOpen(newValue) {
      if (!newValue) {
        this.error = ''
      }
    }
  },
  methods: {
    ...mapActions('transactions', ['deleteTransaction']),
    
    async confirmDelete() {
      this.error = ''
      
      try {
        await this.deleteTransaction(this.transaction.id)
        this.closeModal()
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to delete transaction'
      }
    },
    
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
    
    closeModal() {
      this.$emit('close')
    }
  }
}
</script>