<script setup>
import { computed } from 'vue'

const props = defineProps({
  analytics: {
    type: Object,
    required: true
  },
  budget: {
    type: Number,
    required: true
  }
})

const projectedDiff = computed(() => {
  return props.analytics.projectedTotal - props.budget
})

const isProjectedOver = computed(() => projectedDiff.value > 0)
</script>

<template>
  <div class="summary-strip bit-panel">
    <div class="summary-cell">
      <div class="cell-label">DAILY BURN RATE</div>
      <div class="cell-value tabular-nums">
        ${{ analytics.avgDaily.toFixed(2) }}
        <span class="cell-unit">/ DAY</span>
      </div>
    </div>

    <div class="summary-cell">
      <div class="cell-label">PEAK TRANSACTION</div>
      <div class="cell-value tabular-nums">
        <template v-if="analytics.highestExpense">
          ${{ analytics.highestExpense.amount.toFixed(2) }}
          <span class="cell-unit truncate" :title="analytics.highestExpense.description">
            ({{ analytics.highestExpense.description }})
          </span>
        </template>
        <template v-else>
          N/A
        </template>
      </div>
    </div>

    <div class="summary-cell">
      <div class="cell-label">PROJECTED MONTH END</div>
      <div class="cell-value tabular-nums" :class="{ 'val-danger': isProjectedOver }">
        ${{ analytics.projectedTotal.toFixed(2) }}
        <span class="cell-unit">
          ({{ isProjectedOver ? '+' : '' }}${{ projectedDiff.toFixed(2) }})
        </span>
      </div>
    </div>

    <div class="summary-cell">
      <div class="cell-label">CYCLE COUNTDOWN</div>
      <div class="cell-value tabular-nums">
        {{ analytics.daysRemaining }}
        <span class="cell-unit">DAYS LEFT</span>
      </div>
    </div>

    <div class="summary-cell">
      <div class="cell-label">TRANSACTION VOLUME</div>
      <div class="cell-value tabular-nums">
        {{ analytics.transactionCount }}
        <span class="cell-unit">ENTRIES</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1px;
  background: var(--border-color);
  border: 1px solid var(--border-color);
  margin-top: 12px;
}

.summary-cell {
  padding: 10px 12px;
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.cell-label {
  font-size: 9px;
  font-weight: 700;
  color: var(--text-dim);
  letter-spacing: 0.8px;
  margin-bottom: 3px;
}

.cell-value {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-main);
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.cell-unit {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
}

.truncate {
  max-width: 130px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}

.val-danger {
  color: var(--color-danger);
}

@media (max-width: 900px) {
  .summary-strip {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 500px) {
  .summary-strip {
    grid-template-columns: 1fr;
  }
}
</style>
