<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: number
  row: number
  col: number
  isNew?: boolean
  isMerged?: boolean
}>()

const EMOJI_MAP: Record<number, string> = {
  2: '🌱',
  4: '🌿',
  8: '🌷',
  16: '🌸',
  32: '🌺',
  64: '🌻',
  128: '💐',
  256: '👑',
}

const BG_MAP: Record<number, string> = {
  2: '#e8f5e9',
  4: '#c8e6c9',
  8: '#f8bbd0',
  16: '#f48fb1',
  32: '#ef5350',
  64: '#ffb74d',
  128: '#ce93d8',
  256: '#ffd54f',
}

const emoji = computed(() => EMOJI_MAP[props.value] ?? '✨')
const bg = computed(() => BG_MAP[props.value] ?? '#ccc')
</script>

<template>
  <div
    class="tile"
    :class="{ 'tile--new': isNew, 'tile--merged': isMerged }"
    :style="{
      '--tile-row': row,
      '--tile-col': col,
      background: bg,
    }"
  >
    <span class="tile__emoji">{{ emoji }}</span>
    <span class="tile__value">{{ value }}</span>
  </div>
</template>

<style scoped>
.tile {
  position: absolute;
  width: calc(25% - 8px);
  height: calc(25% - 8px);
  top: calc(var(--tile-row) * 25% + 4px);
  left: calc(var(--tile-col) * 25% + 4px);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  transition: top 0.12s ease, left 0.12s ease;
  z-index: 1;
}

.tile__emoji {
  font-size: clamp(20px, 6vw, 32px);
  line-height: 1;
}

.tile__value {
  font-family: var(--font-display);
  font-size: clamp(10px, 2.5vw, 13px);
  font-weight: 700;
  color: var(--text);
  line-height: 1;
  opacity: 0.7;
}

.tile--new {
  animation: tileAppear 0.2s ease-out;
}

.tile--merged {
  animation: tilePop 0.2s ease-out;
  z-index: 2;
}

@keyframes tileAppear {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes tilePop {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>
