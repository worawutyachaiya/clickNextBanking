<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <AppHeader />
    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Balance Card -->
      <div class="mb-8">
        <BalanceCard />
      </div>
      
      <!-- Banking Operations -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Deposit/Withdraw Form -->
        <div class="lg:col-span-1">
          <TransactionForm />
        </div>
        
        <!-- Transaction List -->
        <div class="lg:col-span-2">
          <TransactionList 
            @edit-transaction="openEditModal"
            @delete-transaction="openDeleteModal"
          />
        </div>
      </div>
    </main>
    
    <!-- Modals -->
    <TransactionModal 
      :transaction="selectedTransaction"
      :is-open="showEditModal"
      @close="closeEditModal"
    />
    <DeleteModal 
      :transaction="selectedTransaction"
      :is-open="showDeleteModal"
      @close="closeDeleteModal"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import AppHeader from '../components/AppHeader.vue'
import BalanceCard from '../components/BalanceCard.vue'
import TransactionForm from '../components/TransactionForm.vue'
import TransactionList from '../components/TransactionList.vue'
import TransactionModal from '../components/TransactionModal.vue'
import DeleteModal from '../components/DeleteModal.vue'

export default {
  name: 'Dashboard',
  components: {
    AppHeader,
    BalanceCard,
    TransactionForm,
    TransactionList,
    TransactionModal,
    DeleteModal
  },
  data() {
    return {
      selectedTransaction: null,
      showEditModal: false,
      showDeleteModal: false
    }
  },
  async mounted() {
    await this.fetchTransactions()
  },
  methods: {
    ...mapActions('transactions', ['fetchTransactions']),
    
    openEditModal(transaction) {
      this.selectedTransaction = transaction
      this.showEditModal = true
    },
    
    closeEditModal() {
      this.selectedTransaction = null
      this.showEditModal = false
    },
    
    openDeleteModal(transaction) {
      this.selectedTransaction = transaction
      this.showDeleteModal = true
    },
    
    closeDeleteModal() {
      this.selectedTransaction = null
      this.showDeleteModal = false
    }
  }
}
</script>