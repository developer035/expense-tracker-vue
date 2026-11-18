<script setup>
import { computed } from 'vue'
import { CATEGORIES } from '../constants/categories'

const props = defineProps({
  expenses: {
    type: Array,
    required: true
  },
  totalCount: {
    type: Number,
    required: true
  },
  searchQuery: {
    type: String,
    required: true
  },
  selectedCategory: {
    type: String,
    required: true
  },
  sortBy: {
    type: String,
    required: true
  },
  sortOrder: {
    type: String,
    required: true
  }
})

const emit = defineEmits([
  'update:searchQuery',
  'update:selectedCategory',
  'update:sortBy',
  'update:sortOrder',
  'open-add-modal',
  'open-edit-modal',
  'delete-expense'
])

const subtotal = computed(() => {
  return props.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)
})

const getCategoryMeta = (catId) => {
  return CATEGORIES.find((c) => c.id === catId) || { code: 'MSC', label: catId }
}

const toggleSort = (field) => {
  if (props.sortBy === field) {
    emit('update:sortOrder', props.sortOrder === 'asc' ? 'desc' : 'asc')
  } else {
    emit('update:sortBy', field)
    emit('update:sortOrder', field === 'amount' ? 'desc' : 'asc')
  }
}

const handleDelete = (item) => {
  if (window.confirm(`Delete expense record "${item.description}" ($${item.amount.toFixed(2)})?`)) {
    emit('delete-expense', item.id)
  }
}
</script>

<template>
  <div class="ledger-container bit-panel">
    <!-- Controls Bar -->
    <div class="ledger-toolbar">
      <div class="filter-group">
        <!-- Search -->
        <div class="search-box">
          <span class="search-glyph">&gt;</span>
          <input
            :value="searchQuery"
            type="text"
            placeholder="FILTER BY DESCRIPTION, NOTE, METHOD..."
            class="bit-input search-input"
            @input="emit('update:searchQuery', $event.target.value)"
          />
          <button
            v-if="searchQuery"
            class="bit-btn bit-btn-sm clear-btn"
            @click="emit('update:searchQuery', '')"
            title="Clear filter"
          >
            [X]
          </button>
        </div>

        <!-- Category Dropdown -->
        <select
          :value="selectedCategory"
          class="bit-select category-select"
          @change="emit('update:selectedCategory', $event.target.value)"
        >
          <option value="all">[ ALL CATEGORIES ]</option>
          <option v-for="cat in CATEGORIES" :key="cat.id" :value="cat.id">
            [{{ cat.code }}] {{ cat.label }}
          </option>
        </select>
      </div>

      <!-- Add Record CTA -->
      <button class="bit-btn bit-btn-primary add-btn" @click="emit('open-add-modal')">
        <span>+ RECORD NEW EXPENSE</span>
      </button>
    </div>

    <!-- Tabular Ledger -->
    <div class="table-scroller">
      <table class="bit-table">
        <thead>
          <tr>
            <th class="th-date clickable" @click="toggleSort('date')">
              DATE <span class="sort-glyph">{{ sortBy === 'date' ? (sortOrder === 'asc' ? '▲' : '▼') : '─' }}</span>
            </th>
            <th class="th-desc">DESCRIPTION &amp; DETAILS</th>
            <th class="th-cat clickable" @click="toggleSort('category')">
              CATEGORY <span class="sort-glyph">{{ sortBy === 'category' ? (sortOrder === 'asc' ? '▲' : '▼') : '─' }}</span>
            </th>
            <th class="th-method">METHOD</th>
            <th class="th-amount clickable" @click="toggleSort('amount')">
              AMOUNT <span class="sort-glyph">{{ sortBy === 'amount' ? (sortOrder === 'asc' ? '▲' : '▼') : '─' }}</span>
            </th>
            <th class="th-actions">ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          <!-- Empty State -->
          <tr v-if="expenses.length === 0">
            <td colspan="6" class="td-empty">
              <div class="empty-box">
                <p>+-------------------------------------------------------------+</p>
                <p>|  NO MATCHING TRANSACTION ENTRIES LOCATED IN CURRENT QUERY   |</p>
                <p>+-------------------------------------------------------------+</p>
                <button class="bit-btn bit-btn-sm" style="margin-top: 10px;" @click="emit('open-add-modal')">
                  [ + CREATE FIRST ENTRY ]
                </button>
              </div>
            </td>
          </tr>

          <!-- Table Rows -->
          <tr v-for="item in expenses" :key="item.id" class="ledger-row">
            <td class="td-date tabular-nums">{{ item.date }}</td>
            <td class="td-desc">
              <div class="desc-title">{{ item.description }}</div>
              <div v-if="item.notes" class="desc-notes"># {{ item.notes }}</div>
            </td>
            <td class="td-cat">
              <span class="bit-badge">
                [{{ getCategoryMeta(item.category).code }}] {{ getCategoryMeta(item.category).label }}
              </span>
            </td>
            <td class="td-method">
              <span class="method-tag">{{ item.paymentMethod || 'Card' }}</span>
            </td>
            <td class="td-amount tabular-nums">
              ${{ item.amount.toFixed(2) }}
            </td>
            <td class="td-actions">
              <button class="bit-btn bit-btn-sm" @click="emit('open-edit-modal', item)" title="Edit entry">
                EDIT
              </button>
              <button class="bit-btn bit-btn-sm bit-btn-danger" @click="handleDelete(item)" title="Delete entry">
                DEL
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Ledger Footer Summary -->
    <div class="ledger-footer">
      <div class="footer-left tabular-nums">
        <span>SHOWING {{ expenses.length }} OF {{ totalCount }} TRANSACTIONS</span>
      </div>
      <div class="footer-right tabular-nums">
        <span>SUB-TOTAL: <strong>${{ subtotal.toFixed(2) }}</strong></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ledger-container {
  margin-top: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
}

.ledger-toolbar {
  padding: 10px 12px;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  max-width: 600px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}

.search-glyph {
  position: absolute;
  left: 8px;
  color: var(--text-dim);
  font-weight: 800;
  pointer-events: none;
}

.search-input {
  padding-left: 24px;
  padding-right: 32px;
}

.clear-btn {
  position: absolute;
  right: 4px;
  padding: 1px 4px;
  font-size: 9px;
}

.category-select {
  width: 180px;
}

.add-btn {
  white-space: nowrap;
}

/* Table */
.table-scroller {
  overflow-x: auto;
}

.bit-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 12px;
}

.bit-table th {
  padding: 8px 12px;
  background: var(--bg-surface);
  border-bottom: 2px solid var(--border-color);
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  user-select: none;
}

.bit-table th.clickable {
  cursor: pointer;
}

.bit-table th.clickable:hover {
  color: var(--text-main);
}

.sort-glyph {
  font-size: 9px;
  margin-left: 4px;
}

.bit-table td {
  padding: 9px 12px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.ledger-row:hover {
  background: var(--bg-elevated);
}

.td-date {
  font-weight: 700;
  white-space: nowrap;
  color: var(--text-main);
  width: 110px;
}

.td-desc {
  max-width: 280px;
}

.desc-title {
  font-weight: 600;
  color: var(--text-main);
}

.desc-notes {
  font-size: 10px;
  color: var(--text-dim);
  margin-top: 2px;
}

.td-cat {
  white-space: nowrap;
  width: 180px;
}

.td-method {
  white-space: nowrap;
  width: 120px;
  color: var(--text-muted);
  font-size: 11px;
}

.td-amount {
  font-weight: 800;
  text-align: right;
  white-space: nowrap;
  width: 110px;
  color: var(--text-main);
}

.th-amount {
  text-align: right;
}

.td-actions {
  white-space: nowrap;
  text-align: right;
  width: 120px;
}

.td-actions .bit-btn {
  margin-left: 6px;
}

.td-empty {
  padding: 40px 16px;
  text-align: center;
}

.empty-box {
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.5px;
}

.ledger-footer {
  padding: 8px 12px;
  background: var(--bg-elevated);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .filter-group {
    max-width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
  .category-select {
    width: 100%;
  }
}
</style>
