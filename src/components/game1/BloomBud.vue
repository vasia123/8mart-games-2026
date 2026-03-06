<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  x: number
  y: number
  size: number
  bloomed: boolean
  pollen: number
  threshold: number
}>()

const emit = defineEmits<{
  tap: []
}>()

const bgColor = computed(() => {
  if (props.bloomed) return '#DFFBE8'
  if (props.pollen > 0) return '#FFF8E8'
  return '#F0EBF8'
})

// Bigger bees when fewer: 1→0.4, 2→0.3, 3→0.24
const beeSize = computed(() => {
  const sizes: Record<number, number> = { 1: 0.4, 2: 0.3, 3: 0.24 }
  return sizes[props.threshold] ?? 0.22
})

const beeDist = computed(() => {
  if (props.threshold === 1) return 0
  return props.size * 0.2
})

function beePos(index: number, total: number) {
  if (total === 1) return { x: props.x, y: props.y }
  // 2 bees: diagonal (top-left, bottom-right)
  if (total === 2) {
    const d = beeDist.value * 0.55
    const offsets = [{ x: -d, y: -d }, { x: d, y: d }]
    const o = offsets[index]!
    return { x: props.x + o.x, y: props.y + o.y }
  }
  const angle = (360 / total) * index - 90
  const rad = angle * Math.PI / 180
  return {
    x: props.x + Math.cos(rad) * beeDist.value,
    y: props.y + Math.sin(rad) * beeDist.value,
  }
}
</script>

<template>
  <g @click="emit('tap')" @touchend.prevent="emit('tap')" class="bloom-bud">
    <!-- Background cell -->
    <circle
      :cx="x" :cy="y"
      :r="size * 0.42"
      :fill="bgColor"
      stroke="#d8d0e8"
      stroke-width="1.5"
      :style="{ transition: 'fill 0.3s ease' }"
    />

    <!-- Bloomed: flower -->
    <template v-if="bloomed">
      <g :style="{ transformOrigin: `${x}px ${y}px`, animation: 'bloom 0.4s ease-out both' }">
        <text
          :x="x" :y="y + 1"
          text-anchor="middle"
          dominant-baseline="central"
          :font-size="size * 0.5"
        >🌸</text>
      </g>
    </template>

    <!-- Not bloomed: bee emojis -->
    <template v-else>
      <text
        v-for="i in threshold"
        :key="i"
        :x="beePos(i - 1, threshold).x"
        :y="beePos(i - 1, threshold).y + 1"
        text-anchor="middle"
        dominant-baseline="central"
        :font-size="size * beeSize"
        :opacity="i <= pollen ? 0.25 : 1"
        :style="{ transition: 'opacity 0.3s ease' }"
      >🐝</text>
    </template>
  </g>
</template>

<style scoped>
.bloom-bud {
  cursor: pointer;
}
.bloom-bud:active circle {
  filter: brightness(0.93);
}
</style>
