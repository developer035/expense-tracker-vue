<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { CATEGORIES, PAYMENT_METHODS } from '../constants/categories'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  initialData: {
    type: Object,
    default: null
  },
  defaultDate: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'submit'])

const form = ref({
  description: '',
  amount: '',
  category: 'food',
  date: '',
  paymentMethod: 'Credit Card',
  notes: ''
})

const errorMessage = ref('')

const resetForm = () => {
  if (props.initialData) {
    form.value = {
      description: props.initialData.description,
      amount: String(props.initialData.amount),
      category: props.initialData.category,
      date: props.initialData.date,
      paymentMethod: props.initialData.paymentMethod || 'Credit Card',
      notes: props.initialData.notes || ''
    }
  } else {
    // Determine default date: if today matches the defaultDate month, use today's full date
    const today = new Date()
    const todayMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    const dateVal = props.defaultDate === todayMonth
      ? `${todayMonth}-${String(today.getDate()).padStart(2, '0')}`
      : `${props.defaultDate}-01`

    form.value = {
      description: '',
      amount: '',
      category: 'food',
      date: dateVal,
      paymentMethod: 'Credit Card',
      notes: ''
    }
  }
  errorMessage.value = ''
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) resetForm()
  }
)

const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const handleSubmit = () => {
  errorMessage.value = ''

  if (!form.value.description.trim()) {
    errorMessage.value = 'ERROR: Description is required.'
    return
  }

  const amt = parseFloat(form.value.amount)
  if (isNaN(amt) || amt <= 0) {
    errorMessage.value = 'ERROR: Enter a valid positive transaction amount.'
    return
  }

  if (!form.value.date) {
    errorMessage.value = 'ERROR: Transaction date is required.'
    return
  }

  emit('submit', {
    ...form.value,
    amount: amt
  })
}
</script>

<template>
  <div v-if="isOpen" class="bit-modal-backdrop" @click.self="emit('close')">
    <div class="bit-modal-content">
      <div class="bit-panel-header">
        <span>► {{ initialData ? 'EDIT TRANSACTION RECORD' : 'CREATE TRANSACTION RECORD' }}</span>
        <button class="bit-btn bit-btn-sm" @click="emit('close')">[X]</button>
      </div>

      <div class="bit-panel-body">
        <form @submit.prevent="handleSubmit" class="form-grid">
          <!-- Error banner -->
          <div v-if="errorMessage" class="error-banner">
            {{ errorMessage }}
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label">DESCRIPTION *</label>
            <input
              v-model="form.description"
              type="text"
              placeholder="e.g. Monthly Supermarket Groceries"
              class="bit-input"
              autofocus
              required
            />
          </div>

          <!-- Amount & Date (2 columns) -->
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">AMOUNT ($ USD) *</label>
              <input
                v-model="form.amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                class="bit-input tabular-nums"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">TRANSACTION DATE *</label>
              <input
                v-model="form.date"
                type="date"
                class="bit-input tabular-nums"
                required
              />
            </div>
          </div>

          <!-- Category & Payment Method (2 columns) -->
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">CATEGORY *</label>
              <select v-model="form.category" class="bit-select">
                <option v-for="cat in CATEGORIES" :key="cat.id" :value="cat.id">
                  [{{ cat.code }}] {{ cat.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">PAYMENT METHOD</label>
              <select v-model="form.paymentMethod" class="bit-select">
                <option v-for="method in PAYMENT_METHODS" :key="method" :value="method">
                  {{ method }}
                </option>
              </select>
            </div>
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label class="form-label">NOTES / TAGS (OPTIONAL)</label>
            <input
              v-model="form.notes"
              type="text"
              placeholder="e.g. Tax deductible, invoice #402"
              class="bit-input"
            />
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" class="bit-btn" @click="emit('close')">
              [ CANCEL ]
            </button>
            <button type="submit" class="bit-btn bit-btn-primary">
              [ {{ initialData ? 'UPDATE ENTRY' : 'COMMIT ENTRY' }} ]
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error-banner {
  padding: 6px 10px;
  background: var(--bg-primary);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.8px;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 500px) {
  .form-row-2 {
    grid-template-columns: 1fr;
  }
}
</style>
