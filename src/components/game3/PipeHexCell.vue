<script setup lang="ts">
import { computed } from 'vue'
import type { AxialCoord } from '../../types/hex'
import { useHexGrid } from '../../composables/useHexGrid'

const props = defineProps<{
  coord: AxialCoord
  hexSize: number
  connections: boolean[] // 6 dirs
  rotation: number // 0-5
  isSource: boolean
  isTarget: boolean
  filled: boolean
}>()

const emit = defineEmits<{
  rotate: [coord: AxialCoord]
}>()

const { axialToPixel, hexCorners } = useHexGrid(props.hexSize)

const pixel = computed(() => axialToPixel(props.coord))
const points = computed(() => hexCorners(pixel.value.x, pixel.value.y))

/** Get actual connections after rotation */
function getRotatedConnections(): boolean[] {
  const result: boolean[] = []
  for (let i = 0; i < 6; i++) {
    result.push(props.connections[((i - props.rotation) % 6 + 6) % 6] ?? false)
  }
  return result
}

/** Draw pipe segments from center to edges for connected directions */
const pipeLines = computed(() => {
  const cx = pixel.value.x
  const cy = pixel.value.y
  const r = props.hexSize * 0.75
  const conns = getRotatedConnections()
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = []

  for (let i = 0; i < 6; i++) {
    if (conns[i]) {
      const angle = (30 - 60 * i) * Math.PI / 180
      lines.push({
        x1: cx,
        y1: cy,
        x2: cx + Math.cos(angle) * r,
        y2: cy + Math.sin(angle) * r,
      })
    }
  }
  return lines
})

const fillColor = computed(() => {
  if (props.isSource) return '#B4F8D8'
  if (props.isTarget) return props.filled ? '#B4F8D8' : '#FFE8E8'
  return '#F8F4FF'
})

const pipeColor = computed(() => props.filled ? '#4ECDC4' : '#C8B4F8')
</script>

<template>
  <g
    class="pipe-cell"
    @click="emit('rotate', coord)"
    @touchend.prevent="emit('rotate', coord)"
  >
    <polygon
      :points="points"
      :fill="fillColor"
      stroke="#d8d0e8"
      stroke-width="1.5"
    />

    <!-- Pipe segments -->
    <line
      v-for="(line, i) in pipeLines"
      :key="i"
      :x1="line.x1" :y1="line.y1"
      :x2="line.x2" :y2="line.y2"
      :stroke="pipeColor"
      stroke-width="4"
      stroke-linecap="round"
    />

    <!-- Center node -->
    <circle
      v-if="pipeLines.length > 0"
      :cx="pixel.x" :cy="pixel.y"
      :r="hexSize * 0.12"
      :fill="pipeColor"
    />

    <!-- Source icon -->
    <text
      v-if="isSource"
      :x="pixel.x" :y="pixel.y + 1"
      text-anchor="middle"
      dominant-baseline="central"
      :font-size="hexSize * 0.5"
    >💧</text>

    <!-- Target icon -->
    <text
      v-if="isTarget"
      :x="pixel.x" :y="pixel.y + 1"
      text-anchor="middle"
      dominant-baseline="central"
      :font-size="hexSize * 0.5"
    >{{ filled ? '🌸' : '🌱' }}</text>
  </g>
</template>

<style scoped>
.pipe-cell {
  cursor: pointer;
}
.pipe-cell:active polygon {
  filter: brightness(0.95);
}
</style>
