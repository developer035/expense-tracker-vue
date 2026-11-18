<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'update-budget'])

const isEditingBudget = ref(false)
const budgetInput = ref(props.budget)

const monthLabel = computed(() => {
  const [year, month] = props.modelValue.split('-').map(Number)
  const d = new Date(year, month - 1, 1)
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
})

const prevMonth = () => {
  const [year, month] = props.modelValue.split('-').map(Number)
  const d = new Date(year, month - 2, 1)
  const pad = (n) => String(n).padStart(2, '0')
  emit('update:modelValue', `${d.getFullYear()}-${pad(d.getMonth() + 1)}`)
}

const nextMonth = () => {
  const [year, month] = props.modelValue.split('-').map(Number)
  const d = new Date(year, month, 1)
  const pad = (n) => String(n).padStart(2, '0')
  emit('update:modelValue', `${d.getFullYear()}-${pad(d.getMonth() + 1)}`)
}

const goToCurrentMonth = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  emit('update:modelValue', `${d.getFullYear()}-${pad(d.getMonth() + 1)}`)
}

const startEditBudget = () => {
  budgetInput.value = props.budget
  isEditingBudget.value = true
}

const saveBudget = () => {
  const val = parseFloat(budgetInput.value)
  if (!isNaN(val) && val >= 0) {
    emit('update-budget', val)
  }
  isEditingBudget.value = false
}

const cancelEditBudget = () => {
  isEditingBudget.value = false
}
</script>

<template>
  <div class="month-bar bit-panel">
    <div class="nav-cluster">
      <button class="bit-btn bit-btn-sm" @click="prevMonth" title="Previous Month">
        &lt; PREV
      </button>

      <div class="month-indicator">
        <span class="month-code tabular-nums">[ {{ modelValue }} ]</span>
        <span class="month-name">{{ monthLabel }}</span>
      </div>

      <button class="bit-btn bit-btn-sm" @click="nextMonth" title="Next Month">
        NEXT &gt;
      </button>

      <button class="bit-btn bit-btn-sm" @click="goToCurrentMonth" title="Return to current month">
        TODAY
      </button>
    </div>

    <div class="budget-cluster">
      <span class="budget-label">MONTHLY ALLOCATION:</span>
      <div v-if="!isEditingBudget" class="budget-display">
        <span class="budget-val tabular-nums">${{ budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
        <button class="bit-btn bit-btn-sm" @click="startEditBudget">[ SET BUDGET ]</button>
      </div>

      <div v-else class="budget-edit-form">
        <span class="currency-glyph">$</span>
        <input
          v-model="budgetInput"
          type="number"
          step="50"
          min="0"
          class="bit-input budget-num-input tabular-nums"
          @keydown.enter="saveBudget"
          @keydown.esc="cancelEditBudget"
          autofocus
        />
        <button class="bit-btn bit-btn-sm bit-btn-primary" @click="saveBudget">[ OK ]</button>
        <button class="bit-btn bit-btn-sm" @click="cancelEditBudget">[ CANCEL ]</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.month-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
}

.nav-cluster {
  display: flex;
  align-items: center;
  gap: 10px;
}

.month-indicator {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.month-code {
  font-weight: 800;
  font-size: 14px;
}

.month-name {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.budget-cluster {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.budget-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 700;
  letter-spacing: 0.5px;
}

.budget-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.budget-val {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-main);
}

.budget-edit-form {
  display: flex;
  align-items: center;
  gap: 6px;
}

.currency-glyph {
  font-weight: 800;
  color: var(--text-muted);
}

.budget-num-input {
  width: 110px;
  padding: 3px 6px;
  font-size: 12px;
}

@media (max-width: 640px) {
  .month-bar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
