<script setup>
import { computed } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  dailyMap: {
    type: Object,
    required: true
  },
  totalSpent: {
    type: Number,
    required: true
  }
})

// Generate a 20-slot ASCII block bar for categories
const makeCategoryBar = (percentage) => {
  const slots = 20
  const filled = Math.min(slots, Math.max(0, Math.round((percentage / 100) * slots)))
  const empty = slots - filled
  return '█'.repeat(filled) + '░'.repeat(empty)
}

// Compute daily max to scale daily activity bars
const dailyMax = computed(() => {
  let max = 0
  const map = props.dailyMap.map || {}
  for (const day in map) {
    if (map[day] > max) max = map[day]
  }
  return max || 1
})

const getDailyIntensity = (amount) => {
  if (!amount || amount <= 0) return { height: '3px', glyph: '·', opacity: 0.25 }
  const ratio = amount / dailyMax.value
  const percent = Math.max(15, Math.min(100, Math.round(ratio * 100)))
  return {
    height: `${percent}%`,
    glyph: ratio > 0.7 ? '█' : ratio > 0.3 ? '▄' : ' ',
    opacity: 1
  }
}
</script>

<template>
  <div class="charts-container">
    <!-- Category Breakdown Panel -->
    <div class="chart-panel bit-panel">
      <div class="bit-panel-header">
        <span>► CATEGORY ALLOCATION LEDGER</span>
        <span>{{ categories.length }} ACTIVE SEGMENTS</span>
      </div>

      <div class="bit-panel-body">
        <div v-if="categories.length === 0" class="empty-state">
          NO CATEGORIZED EXPENSES LOGGED FOR THIS CYCLE
        </div>

        <div v-else class="cat-list">
          <div v-for="cat in categories" :key="cat.id" class="cat-row">
            <div class="cat-meta">
              <span class="cat-code bit-badge">[{{ cat.code }}]</span>
              <span class="cat-name">{{ cat.label }}</span>
            </div>

            <div class="cat-ascii-bar tabular-nums">
              <span class="bracket">[</span>
              <span class="blocks">{{ makeCategoryBar(cat.percentage) }}</span>
              <span class="bracket">]</span>
            </div>

            <div class="cat-figures tabular-nums">
              <span class="cat-pct">{{ cat.percentage.toFixed(1) }}%</span>
              <span class="cat-amt">${{ cat.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Spending Velocity / Barcode Panel -->
    <div class="chart-panel bit-panel">
      <div class="bit-panel-header">
        <span>► 31-DAY SPENDING FREQUENCY BARCODE</span>
        <span class="tabular-nums">PEAK DAY: ${{ dailyMax.toFixed(2) }}</span>
      </div>

      <div class="bit-panel-body">
        <div class="barcode-wrapper">
          <div class="barcode-grid">
            <div
              v-for="day in dailyMap.daysInMonth"
              :key="day"
              class="barcode-column"
              :title="`Day ${day}: $${(dailyMap.map[day] || 0).toFixed(2)}`"
            >
              <div class="column-track">
                <div
                  class="column-fill"
                  :style="{
                    height: getDailyIntensity(dailyMap.map[day]).height,
                    opacity: getDailyIntensity(dailyMap.map[day]).opacity
                  }"
                  :class="{ 'has-spend': dailyMap.map[day] > 0 }"
                ></div>
              </div>
              <span class="col-num tabular-nums">{{ day % 5 === 0 || day === 1 ? day : '·' }}</span>
            </div>
          </div>
        </div>

        <div class="barcode-footer">
          <span>TICK SCALE: 1 UNIT = DAILY CADENCE</span>
          <span>DOT (·) = PASSIVE DAY | BAR (█) = ACTIVE SPEND</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.chart-panel {
  display: flex;
  flex-direction: column;
}

.empty-state {
  padding: 24px 12px;
  text-align: center;
  color: var(--text-dim);
  font-size: 11px;
  letter-spacing: 0.5px;
}

.cat-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cat-row {
  display: grid;
  grid-template-columns: 140px 1fr 110px;
  align-items: center;
  gap: 10px;
  font-size: 11px;
}

.cat-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}

.cat-code {
  font-size: 9px;
  flex-shrink: 0;
}

.cat-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-main);
  font-weight: 600;
}

.cat-ascii-bar {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.5px;
  line-height: 1;
}

.cat-ascii-bar .bracket {
  color: var(--text-dim);
}

.cat-ascii-bar .blocks {
  color: var(--text-main);
}

.cat-figures {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  font-weight: 700;
}

.cat-pct {
  color: var(--text-muted);
  width: 40px;
  text-align: right;
}

.cat-amt {
  color: var(--text-main);
  width: 60px;
  text-align: right;
}

/* Barcode */
.barcode-wrapper {
  padding: 10px 0 4px 0;
}

.barcode-grid {
  display: flex;
  align-items: flex-end;
  height: 90px;
  gap: 2px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 2px;
}

.barcode-column {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  cursor: pointer;
}

.barcode-column:hover .column-fill {
  background: var(--text-main) !important;
}

.column-track {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.column-fill {
  width: 100%;
  background: var(--text-dim);
  transition: height 0.15s ease;
}

.column-fill.has-spend {
  background: var(--accent);
}

.col-num {
  font-size: 9px;
  color: var(--text-dim);
  margin-top: 4px;
}

.barcode-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 9px;
  color: var(--text-dim);
  letter-spacing: 0.5px;
}

@media (max-width: 900px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}
</style>
