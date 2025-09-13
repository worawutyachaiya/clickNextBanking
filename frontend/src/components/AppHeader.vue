<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <h1 class="text-xl font-semibold text-gray-900">
            ClickNext Banking
          </h1>
        </div>
        
        <!-- User Info and Logout -->
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-500 hidden sm:block">
            ยินดีต้อนรับ, {{ user.email }}
          </span>
          <button
            @click="handleLogout"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AppHeader',
  computed: {
    ...mapGetters('auth', ['user'])
  },
  methods: {
    ...mapActions('auth', ['logout']),
    
    handleLogout() {
      if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
        this.logout()
      }
    }
  }
}
</script>