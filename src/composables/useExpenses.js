import { ref, computed, watch } from 'vue'
import { CATEGORIES, generateSeedExpenses } from '../constants/categories'

const STORAGE_EXPENSES_KEY = 'BIT_EXPENSES_DATA_V1'
const STORAGE_BUDGETS_KEY = 'BIT_EXPENSES_BUDGETS_V1'
const STORAGE_THEME_KEY = 'BIT_EXPENSES_THEME_V1'

export function useExpenses() {
  // Current real month string (YYYY-MM)
  const now = new Date()
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // State
  const selectedMonth = ref(defaultMonth)
  const searchQuery = ref('')
  const selectedCategory = ref('all')
  const sortBy = ref('date') // 'date' | 'amount' | 'category'
  const sortOrder = ref('desc') // 'asc' | 'desc'
  const theme = ref(localStorage.getItem(STORAGE_THEME_KEY) || 'dark')

  // Load or initialize budgets
  const loadBudgets = () => {
    try {
      const saved = localStorage.getItem(STORAGE_BUDGETS_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.warn('Failed to parse budgets from storage', e)
    }
    return { [defaultMonth]: 3500 }
  }
  const monthlyBudgets = ref(loadBudgets())

  // Load or initialize expenses
  const loadExpenses = () => {
    try {
      const saved = localStorage.getItem(STORAGE_EXPENSES_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.warn('Failed to parse expenses from storage', e)
    }
    return generateSeedExpenses(defaultMonth)
  }
  const expenses = ref(loadExpenses())

  // Sync to localStorage
  watch(
    expenses,
    (newVal) => {
      try {
        localStorage.setItem(STORAGE_EXPENSES_KEY, JSON.stringify(newVal))
      } catch (e) {
        console.error('Failed to save expenses to localStorage', e)
      }
    },
    { deep: true }
  )

  watch(
    monthlyBudgets,
    (newVal) => {
      try {
        localStorage.setItem(STORAGE_BUDGETS_KEY, JSON.stringify(newVal))
      } catch (e) {
        console.error('Failed to save budgets to localStorage', e)
      }
    },
    { deep: true }
  )

  watch(theme, (newVal) => {
    try {
      localStorage.setItem(STORAGE_THEME_KEY, newVal)
      document.documentElement.setAttribute('data-theme', newVal)
    } catch (e) {
      console.error('Failed to save theme', e)
    }
  }, { immediate: true })

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  // Current month budget
  const currentBudget = computed(() => {
    return monthlyBudgets.value[selectedMonth.value] ?? 3500
  })

  // All expenses belonging to selectedMonth
  const currentMonthExpenses = computed(() => {
    return expenses.value.filter((item) => item.date.startsWith(selectedMonth.value))
  })

  // Filtered & sorted expenses
  const filteredExpenses = computed(() => {
    let list = currentMonthExpenses.value

    if (selectedCategory.value !== 'all') {
      list = list.filter((item) => item.category === selectedCategory.value)
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      list = list.filter((item) =>
        item.description.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        (item.paymentMethod && item.paymentMethod.toLowerCase().includes(q))
      )
    }

    return [...list].sort((a, b) => {
      let result = 0
      if (sortBy.value === 'date') {
        result = a.date.localeCompare(b.date) || (b.createdAt - a.createdAt)
      } else if (sortBy.value === 'amount') {
        result = a.amount - b.amount
      } else if (sortBy.value === 'category') {
        result = a.category.localeCompare(b.category)
      }
      return sortOrder.value === 'asc' ? result : -result
    })
  })

  // Aggregates
  const totalSpent = computed(() => {
    return currentMonthExpenses.value.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  })

  const remainingBudget = computed(() => {
    return currentBudget.value - totalSpent.value
  })

  const spendPercentage = computed(() => {
    if (currentBudget.value <= 0) return 0
    return Math.min(Math.round((totalSpent.value / currentBudget.value) * 1000) / 10, 999)
  })

  // Category breakdown
  const categoryBreakdown = computed(() => {
    const map = {}
    CATEGORIES.forEach((c) => {
      map[c.id] = { ...c, total: 0, count: 0 }
    })

    currentMonthExpenses.value.forEach((item) => {
      if (!map[item.category]) {
        map[item.category] = {
          id: item.category,
          code: item.category.slice(0, 3).toUpperCase(),
          label: item.category,
          color: '#8b949e',
          total: 0,
          count: 0
        }
      }
      map[item.category].total += Number(item.amount || 0)
      map[item.category].count += 1
    })

    const grandTotal = totalSpent.value || 1
    return Object.values(map)
      .filter((c) => c.total > 0)
      .map((c) => ({
        ...c,
        percentage: Math.round((c.total / grandTotal) * 1000) / 10
      }))
      .sort((a, b) => b.total - a.total)
  })

  // Daily spending map for frequency barcode
  const dailySpendingMap = computed(() => {
    const [year, month] = selectedMonth.value.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()
    const map = {}

    for (let d = 1; d <= daysInMonth; d++) {
      map[d] = 0
    }

    currentMonthExpenses.value.forEach((item) => {
      const dayNum = parseInt(item.date.split('-')[2], 10)
      if (map[dayNum] !== undefined) {
        map[dayNum] += Number(item.amount || 0)
      }
    })

    return { map, daysInMonth }
  })

  // Statistical analytics
  const analytics = computed(() => {
    const [year, month] = selectedMonth.value.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()
    
    // Determine effective days elapsed in selected month
    let effectiveDays = daysInMonth
    const isCurrentMonth = selectedMonth.value === defaultMonth
    if (isCurrentMonth) {
      effectiveDays = Math.max(1, now.getDate())
    }

    const avgDaily = effectiveDays > 0 ? totalSpent.value / effectiveDays : 0
    const projectedTotal = avgDaily * daysInMonth

    let highest = null
    currentMonthExpenses.value.forEach((item) => {
      if (!highest || item.amount > highest.amount) {
        highest = item
      }
    })

    const daysRemaining = isCurrentMonth ? Math.max(0, daysInMonth - now.getDate()) : 0

    return {
      daysInMonth,
      effectiveDays,
      daysRemaining,
      avgDaily,
      projectedTotal,
      highestExpense: highest,
      transactionCount: currentMonthExpenses.value.length
    }
  })

  // Actions
  const addExpense = (payload) => {
    const newRecord = {
      id: 'exp-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      date: payload.date || `${selectedMonth.value}-01`,
      description: payload.description.trim(),
      category: payload.category || 'misc',
      amount: Math.round(Number(payload.amount) * 100) / 100,
      paymentMethod: payload.paymentMethod || 'Credit Card',
      notes: (payload.notes || '').trim(),
      createdAt: Date.now()
    }
    expenses.value.unshift(newRecord)
    return newRecord
  }

  const updateExpense = (id, payload) => {
    const index = expenses.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      expenses.value[index] = {
        ...expenses.value[index],
        date: payload.date,
        description: payload.description.trim(),
        category: payload.category,
        amount: Math.round(Number(payload.amount) * 100) / 100,
        paymentMethod: payload.paymentMethod,
        notes: (payload.notes || '').trim()
      }
    }
  }

  const deleteExpense = (id) => {
    expenses.value = expenses.value.filter((e) => e.id !== id)
  }

  const setMonthlyBudget = (month, amount) => {
    const num = Math.max(0, Math.round(Number(amount) * 100) / 100)
    monthlyBudgets.value = {
      ...monthlyBudgets.value,
      [month]: num
    }
  }

  const setMonth = (monthStr) => {
    selectedMonth.value = monthStr
  }

  const exportJson = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      budgets: monthlyBudgets.value,
      expenses: expenses.value
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bit-expense-backup-${selectedMonth.value}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = (jsonString) => {
    try {
      const data = JSON.parse(jsonString)
      if (data && Array.isArray(data.expenses)) {
        expenses.value = data.expenses
        if (data.budgets && typeof data.budgets === 'object') {
          monthlyBudgets.value = data.budgets
        }
        return { success: true, count: data.expenses.length }
      }
      throw new Error('Invalid schema: "expenses" array missing.')
    } catch (e) {
      return { success: false, error: e.message }
    }
  }

  const resetToDefaults = () => {
    expenses.value = generateSeedExpenses(selectedMonth.value)
    monthlyBudgets.value = { [selectedMonth.value]: 3500 }
  }

  return {
    selectedMonth,
    searchQuery,
    selectedCategory,
    sortBy,
    sortOrder,
    theme,
    toggleTheme,
    monthlyBudgets,
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
    setMonth,
    exportJson,
    importJson,
    resetToDefaults
  }
}
