<script setup>
import { ref } from 'vue'
import { useExpenses } from './composables/useExpenses'
import HeaderBar from './components/HeaderBar.vue'
import MonthPicker from './components/MonthPicker.vue'
import BudgetOverview from './components/BudgetOverview.vue'
import BitmapCharts from './components/BitmapCharts.vue'
import StatSummary from './components/StatSummary.vue'
import ExpenseTable from './components/ExpenseTable.vue'
import ExpenseFormModal from './components/ExpenseFormModal.vue'

const {
  selectedMonth,
  searchQuery,
  selectedCategory,
  sortBy,
  sortOrder,
  theme,
  toggleTheme,
  currentBudget,
  expenses,
  currentMonthExpenses,
  filteredExpenses,
  totalSpent,
  remainingBudget,
  spendPercentage,
  categoryBreakdown,
  dailySpendingMap,
  analytics,
  addExpense,
  updateExpense,
  deleteExpense,
  setMonthlyBudget,
  exportJson,
  importJson,
  resetToDefaults
} = useExpenses()

// Modal State
const isModalOpen = ref(false)
const editingExpense = ref(null)

// Toast / Status Message
const statusNotice = ref('')
let noticeTimer = null

const showNotice = (msg) => {
  statusNotice.value = msg
  if (noticeTimer) clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => {
    statusNotice.value = ''
  }, 4000)
}

const openAddModal = () => {
  editingExpense.value = null
  isModalOpen.value = true
}

const openEditModal = (item) => {
  editingExpense.value = { ...item }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingExpense.value = null
}

const handleFormSubmit = (payload) => {
  if (editingExpense.value) {
    updateExpense(editingExpense.value.id, payload)
    showNotice(`RECORD UPDATED: "${payload.description}" ($${payload.amount.toFixed(2)})`)
  } else {
    addExpense(payload)
    showNotice(`NEW RECORD COMMITTED: "${payload.description}" ($${payload.amount.toFixed(2)})`)
  }
  closeModal()
}

const handleDeleteExpense = (id) => {
  deleteExpense(id)
  showNotice('RECORD REMOVED FROM DATABASE')
}

const handleUpdateBudget = (newAmount) => {
  setMonthlyBudget(selectedMonth.value, newAmount)
  showNotice(`MONTHLY ALLOCATION ADJUSTED TO: $${newAmount.toFixed(2)}`)
}

const handleImportJson = (content) => {
  const result = importJson(content)
  if (result.success) {
    showNotice(`DATABASE RESTORED: ${result.count} RECORDS LOADED`)
  } else {
    alert(`Failed to import JSON: ${result.error}`)
  }
}

const handleResetData = () => {
  resetToDefaults()
  showNotice('DATABASE RESTORED TO SAMPLE INITIAL STATE')
}
</script>

<template>
  <div class="app-layout">
    <!-- Top System Header -->
    <HeaderBar
      :theme="theme"
      @toggle-theme="toggleTheme"
      @export-json="exportJson"
      @import-json="handleImportJson"
      @reset-data="handleResetData"
    />

    <!-- Status Notice Bar (if active) -->
    <div v-if="statusNotice" class="status-banner">
      <span class="status-bullet">■</span>
      <span class="status-text tabular-nums">{{ statusNotice }}</span>
    </div>

    <!-- Main Content Workstation Area -->
    <main class="main-content">
      <!-- Month Navigation & Allocation Control -->
      <MonthPicker
        v-model="selectedMonth"
        :budget="currentBudget"
        @update-budget="handleUpdateBudget"
      />

      <!-- Financial Metrics & Bitmap Gauge -->
      <BudgetOverview
        :budget="currentBudget"
        :total-spent="totalSpent"
        :remaining="remainingBudget"
        :percentage="spendPercentage"
      />

      <!-- Bitmap Visualizers: Category Allocation & Daily Velocity -->
      <BitmapCharts
        :categories="categoryBreakdown"
        :daily-map="dailySpendingMap"
        :total-spent="totalSpent"
      />

      <!-- Statistical Burn Rate Strip -->
      <StatSummary
        :analytics="analytics"
        :budget="currentBudget"
      />

      <!-- Expense Ledger Table & Query Filters -->
      <ExpenseTable
        :expenses="filteredExpenses"
        :total-count="currentMonthExpenses.length"
        :search-query="searchQuery"
        :selected-category="selectedCategory"
        :sort-by="sortBy"
        :sort-order="sortOrder"
        @update:search-query="searchQuery = $event"
        @update:selected-category="selectedCategory = $event"
        @update:sort-by="sortBy = $event"
        @update:sort-order="sortOrder = $event"
        @open-add-modal="openAddModal"
        @open-edit-modal="openEditModal"
        @delete-expense="handleDeleteExpense"
      />
    </main>

    <!-- Modal Form (Add / Edit) -->
    <ExpenseFormModal
      :is-open="isModalOpen"
      :initial-data="editingExpense"
      :default-date="selectedMonth"
      @close="closeModal"
      @submit="handleFormSubmit"
    />

    <!-- Minimal Terminal Footer -->
    <footer class="terminal-footer">
      <span>BIT//EXPENSE CLIENT v1.0.0</span>
      <span>STORAGE: LOCAL_CLIENT_ENCRYPTED</span>
      <span>STATUS: OPERATIONAL</span>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 16px;
}

.status-banner {
  background: var(--text-main);
  color: var(--bg-primary);
  padding: 6px 16px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--border-color);
  animation: fadeIn 0.15s ease;
}

.status-bullet {
  font-size: 8px;
}

.terminal-footer {
  max-width: 1200px;
  width: 100%;
  margin: 20px auto 16px auto;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--border-color);
  font-size: 10px;
  color: var(--text-dim);
  letter-spacing: 0.8px;
  flex-wrap: wrap;
  gap: 8px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 600px) {
  .main-content {
    padding: 10px;
  }
}
</style>
