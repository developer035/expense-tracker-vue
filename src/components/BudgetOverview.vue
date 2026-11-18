<script setup>
import { computed } from 'vue'

const props = defineProps({
  budget: {
    type: Number,
    required: true
  },
  totalSpent: {
    type: Number,
    required: true
  },
  remaining: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  }
})

// Generate bitmap ASCII bar using solid and shaded blocks: █ and ░
const asciiBar = computed(() => {
  const totalSlots = 32
  const filledSlots = Math.min(totalSlots, Math.max(0, Math.round((props.percentage / 100) * totalSlots)))
  const emptySlots = Math.max(0, totalSlots - filledSlots)
  
  // Choose block glyph depending on whether over budget
  const fillChar = props.percentage > 100 ? '▓' : '█'
  const emptyChar = '░'

  return fillChar.repeat(filledSlots) + emptyChar.repeat(emptySlots)
})

const isDeficit = computed(() => props.remaining < 0)
const isWarning = computed(() => props.percentage >= 85 && props.percentage <= 100)

const statusText = computed(() => {
  if (isDeficit.value) return 'CRITICAL // OVER BUDGET LIMIT'
  if (isWarning.value) return 'CAUTION // APPROACHING BUDGET CAP'
  return 'OPTIMAL // WITHIN ALLOCATION'
})

const statusClass = computed(() => {
  if (isDeficit.value) return 'status-danger'
  if (isWarning.value) return 'status-warning'
  return 'status-normal'
})
</script>

<template>
  <div class="overview-grid">
    <!-- Stat 1: Total Spent -->
    <div class="stat-card bit-panel">
      <div class="stat-meta">TOTAL EXPENDITURE</div>
      <div class="stat-value tabular-nums">
        ${{ totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
      </div>
      <div class="stat-sub">CURRENT CYCLE</div>
    </div>

    <!-- Stat 2: Monthly Budget -->
    <div class="stat-card bit-panel">
      <div class="stat-meta">MONTHLY ALLOCATION</div>
      <div class="stat-value tabular-nums">
        ${{ budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
      </div>
      <div class="stat-sub">TARGET CEILING</div>
    </div>

    <!-- Stat 3: Remaining Balance -->
    <div class="stat-card bit-panel">
      <div class="stat-meta">REMAINING SURPLUS</div>
      <div class="stat-value tabular-nums" :class="{ 'val-danger': isDeficit, 'val-positive': !isDeficit }">
        {{ isDeficit ? '-' : '+' }}${{ Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
      </div>
      <div class="stat-sub" :class="{ 'val-danger': isDeficit }">
        {{ isDeficit ? 'DEFICIT OVERRUN' : 'REMAINING UNSPENT' }}
      </div>
    </div>

    <!-- Stat 4: Utilization Rate -->
    <div class="stat-card bit-panel">
      <div class="stat-meta">BUDGET UTILIZATION</div>
      <div class="stat-value tabular-nums" :class="{ 'val-danger': isDeficit, 'val-warning': isWarning }">
        {{ percentage.toFixed(1) }}%
      </div>
      <div class="stat-sub">OF TOTAL CAP</div>
    </div>
  </div>

  <!-- ASCII / Bitmap Progress Meter Panel -->
  <div class="meter-panel bit-panel">
    <div class="meter-header">
      <div class="meter-title">
        <span class="glyph">►</span>
        <span>BITMAP BUDGET GAUGE</span>
      </div>
      <div class="meter-status" :class="statusClass">
        <span class="status-dot">■</span>
        <span>{{ statusText }}</span>
      </div>
    </div>

    <div class="meter-body">
      <div class="ascii-bar tabular-nums" :class="{ 'ascii-danger': isDeficit, 'ascii-warning': isWarning }">
        <span class="bracket">[</span>
        <span class="fill-stream">{{ asciiBar }}</span>
        <span class="bracket">]</span>
      </div>

      <div class="meter-info">
        <span class="tabular-nums">SPENT: ${{ totalSpent.toFixed(2) }}</span>
        <span class="divider">/</span>
        <span class="tabular-nums">CAP: ${{ budget.toFixed(2) }}</span>
        <span class="divider">|</span>
        <span class="tabular-nums">RATIO: {{ (totalSpent / (budget || 1)).toFixed(3) }}x</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 14px;
}

.stat-card {
  padding: 12px 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
}

.stat-meta {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.8px;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.5px;
  margin-bottom: 2px;
}

.stat-sub {
  font-size: 9px;
  color: var(--text-dim);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.val-positive {
  color: var(--color-positive);
}

.val-warning {
  color: var(--color-warning);
}

.val-danger {
  color: var(--color-danger);
}

/* Meter Panel */
.meter-panel {
  margin-top: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
}

.meter-header {
  padding: 8px 12px;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
}

.meter-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-main);
}

.meter-title .glyph {
  font-size: 9px;
  color: var(--text-muted);
}

.meter-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
}

.status-dot {
  font-size: 8px;
}

.status-normal {
  color: var(--color-positive);
}

.status-warning {
  color: var(--color-warning);
}

.status-danger {
  color: var(--color-danger);
}

.meter-body {
  padding: 12px 14px;
}

.ascii-bar {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1px;
  line-height: 1;
  word-break: break-all;
  color: var(--text-main);
  margin-bottom: 8px;
}

.ascii-bar .bracket {
  color: var(--text-muted);
}

.ascii-bar .fill-stream {
  color: var(--color-positive);
}

.ascii-warning .fill-stream {
  color: var(--color-warning);
}

.ascii-danger .fill-stream {
  color: var(--color-danger);
}

.meter-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.meter-info .divider {
  color: var(--text-dim);
}

@media (max-width: 900px) {
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 500px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
