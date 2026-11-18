<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  theme: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['toggle-theme', 'export-json', 'import-json', 'reset-data'])

const timeString = ref('')
const fileInput = ref(null)

const updateClock = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  timeString.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

let timer = null
onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const triggerImport = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    emit('import-json', event.target.result)
    e.target.value = ''
  }
  reader.readAsText(file)
}

const confirmReset = () => {
  if (window.confirm('Reset all expenses to default demonstration records? Existing custom changes will be overwritten.')) {
    emit('reset-data')
  }
}
</script>

<template>
  <header class="header-container">
    <div class="header-left">
      <div class="brand">
        <span class="brand-glyph">■</span>
        <span class="brand-title">BIT//EXPENSE</span>
        <span class="brand-ver">v1.0.0</span>
      </div>
      <div class="sys-badge">
        <span class="sys-led"></span>
        <span>SYS:READY</span>
      </div>
    </div>

    <div class="header-center">
      <span class="clock-display tabular-nums">[ {{ timeString }} ]</span>
    </div>

    <div class="header-right">
      <button class="bit-btn bit-btn-sm" @click="emit('toggle-theme')" title="Toggle Dark/Light Mode">
        [ {{ theme === 'dark' ? 'LIGHT_MODE' : 'DARK_MODE' }} ]
      </button>

      <button class="bit-btn bit-btn-sm" @click="emit('export-json')" title="Export Backup JSON">
        [ EXPORT ]
      </button>

      <button class="bit-btn bit-btn-sm" @click="triggerImport" title="Import Backup JSON">
        [ IMPORT ]
      </button>
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        style="display: none"
        @change="handleFileChange"
      />

      <button class="bit-btn bit-btn-sm bit-btn-danger" @click="confirmReset" title="Reset to sample data">
        [ RESET ]
      </button>
    </div>
  </header>
</template>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 16px;
  background: var(--bg-surface);
  border-bottom: 2px solid var(--border-color);
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 6px;
}

.brand-glyph {
  font-size: 14px;
  color: var(--accent);
}

.brand-title {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1px;
}

.brand-ver {
  font-size: 10px;
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  padding: 1px 4px;
}

.sys-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--text-dim);
}

.sys-led {
  width: 6px;
  height: 6px;
  background: var(--color-positive);
  display: inline-block;
  box-shadow: 0 0 4px var(--color-positive);
}

.clock-display {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-center {
    width: 100%;
  }
}
</style>
