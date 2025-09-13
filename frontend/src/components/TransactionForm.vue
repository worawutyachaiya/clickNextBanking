<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-6">
      ฝาก / ถอน เงิน
    </h3>
    
    <form @submit.prevent="handleSubmit">
      <div v-if="error" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
        {{ error }}
      </div>
      
      <div v-if="success" class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
        {{ success }}
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
        <label for="amount" class="block text-sm font-medium text-gray-700 mb-2">
          จำนวนเงิน (฿)
        </label>
        <input
          id="amount"
          v-model="form.amount"
          type="number"
          step="0.01"
          min="0.01"
          max="100000"
          required
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="กรอกจำนวนเงิน (0.01 - 100,000)"
        >
        <p class="mt-1 text-xs text-gray-500">
          ขั้นต่ำ: ฿0.01 | สูงสุด: ฿100,000
        </p>
      </div>
      
      <!-- Description -->
      <div class="mb-6">
        <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
          รายละเอียด (ไม่บังคับ)
        </label>
        <textarea
          id="description"
          v-model="form.description"
          rows="3"
          maxlength="500"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="รายละเอียดการทำรายการ..."
        ></textarea>
        <p class="mt-1 text-xs text-gray-500">
          {{ form.description.length }}/500 ตัวอักษร
        </p>
      </div>
      
      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading || !isFormValid"
        :class="[
          'w-full py-2 px-4 rounded-md font-medium transition-colors duration-200',
          form.type === 'deposit' 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-red-600 hover:bg-red-700 text-white',
          (loading || !isFormValid) && 'opacity-50 cursor-not-allowed'
        ]"
      >
        <span v-if="loading" class="inline-flex items-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          กำลังดำเนินการ...
        </span>
        <span v-else>
          {{ form.type === 'deposit' ? 'ฝากเงิน' : 'ถอนเงิน' }}
        </span>
      </button>
    </form>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'TransactionForm',
  data() {
    return {
      form: {
        type: 'deposit',
        amount: '',
        description: ''
      },
      success: '',
      error: ''
    }
  },
  computed: {
    ...mapGetters('transactions', ['loading']),
    ...mapGetters('auth', ['user']),
    
    isFormValid() {
      const amount = parseFloat(this.form.amount)
      return this.form.type && 
             amount >= 0.01 && 
             amount <= 100000 &&
             (this.form.type !== 'withdraw' || amount <= parseFloat(this.user.balance))
    }
  },
  methods: {
    ...mapActions('transactions', ['createTransaction']),
    
    async handleSubmit() {
      this.error = ''
      this.success = ''
      
      if (!this.validateForm()) {
        return
      }
      
      try {
        const transactionData = {
          type: this.form.type,
          amount: parseFloat(this.form.amount),
          description: this.form.description.trim() || null
        }
        
        await this.createTransaction(transactionData)
        
        this.success = `${this.form.type === 'deposit' ? 'Deposit' : 'Withdrawal'} completed successfully!`
        this.resetForm()
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.success = ''
        }, 3000)
      } catch (error) {
        this.error = error.response?.data?.error || 'Transaction failed'
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
      
      if (this.form.type === 'withdraw' && amount > parseFloat(this.user.balance)) {
        this.error = 'Insufficient balance'
        return false
      }
      
      if (this.form.description.length > 500) {
        this.error = 'Description cannot exceed 500 characters'
        return false
      }
      
      return true
    },
    
    resetForm() {
      this.form.amount = ''
      this.form.description = ''
    }
  }
}
</script>