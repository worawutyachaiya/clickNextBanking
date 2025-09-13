<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>
      
      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  แก้ไขรายการธุรกรรม
                </h3>
                
                <div v-if="error" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {{ error }}
                </div>
                
                <!-- Transaction Type -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    ประเภทรายการ
                  </label>
                  <div class="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      @click="form.type = 'deposit'"
                      :class="[
                        'px-4 py-2 rounded-md font-medium transition-colors duration-200',
                        form.type === 'deposit' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      ]"
                    >
                      ฝาก
                    </button>
                    <button
                      type="button"
                      @click="form.type = 'withdraw'"
                      :class="[
                        'px-4 py-2 rounded-md font-medium transition-colors duration-200',
                        form.type === 'withdraw' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      ]"
                    >
                      ถอน
                    </button>
                  </div>
                </div>
                
                <!-- Amount -->
                <div class="mb-4">
                  <label for="edit-amount" class="block text-sm font-medium text-gray-700 mb-2">
                    จำนวนเงิน (฿)
                  </label>
                  <input
                    id="edit-amount"
                    v-model="form.amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="100000"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                </div>
                
                <!-- Description -->
                <div class="mb-4">
                  <label for="edit-description" class="block text-sm font-medium text-gray-700 mb-2">
                    รายละเอียด (ไม่บังคับ)
                  </label>
                  <textarea
                    id="edit-description"
                    v-model="form.description"
                    rows="3"
                    maxlength="500"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="loading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {{ loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข' }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'TransactionModal',
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
      form: {
        type: '',
        amount: '',
        description: ''
      },
      error: ''
    }
  },
  computed: {
    ...mapGetters('transactions', ['loading'])
  },
  watch: {
    transaction: {
      handler(newTransaction) {
        if (newTransaction) {
          this.form.type = newTransaction.type
          this.form.amount = newTransaction.amount
          this.form.description = newTransaction.description || ''
        }
      },
      immediate: true
    },
    isOpen(newValue) {
      if (!newValue) {
        this.error = ''
      }
    }
  },
  methods: {
    ...mapActions('transactions', ['updateTransaction']),
    
    async handleSubmit() {
      this.error = ''
      
      if (!this.validateForm()) {
        return
      }
      
      try {
        await this.updateTransaction({
          id: this.transaction.id,
          transactionData: {
            type: this.form.type,
            amount: parseFloat(this.form.amount),
            description: this.form.description.trim() || null
          }
        })
        
        this.closeModal()
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to update transaction'
      }
    },
    
    validateForm() {
      const amount = parseFloat(this.form.amount)
      
      if (!this.form.type) {
        this.error = 'Please select transaction type'
        return false
      }
      
      if (!amount || amount < 0.01) {
        this.error = 'Amount must be at least ฿0.01'
        return false
      }
      
      if (amount > 100000) {
        this.error = 'Amount cannot exceed ฿100,000'
        return false
      }
      
      if (this.form.description.length > 500) {
        this.error = 'Description cannot exceed 500 characters'
        return false
      }
      
      return true
    },
    
    closeModal() {
      this.$emit('close')
    }
  }
}
</script>