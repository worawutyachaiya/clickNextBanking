<template>
  <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-medium">ยอดเงินคงเหลือ</h2>
        <p class="text-3xl font-bold mt-2">
          ฿{{ formattedBalance }}
        </p>
      </div>
      <div class="text-right">
        <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="mt-4 text-blue-100 text-sm">
      อัปเดตล่าสุด: {{ lastUpdated }}
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'BalanceCard',
  computed: {
    ...mapGetters('auth', ['user']),
    
    formattedBalance() {
      if (!this.user || this.user.balance === undefined) {
        return '0.00'
      }
      return Number(this.user.balance).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    
    lastUpdated() {
      return new Date().toLocaleString()
    }
  }
}
</script>