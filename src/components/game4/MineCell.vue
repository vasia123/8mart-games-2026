<script setup lang="ts">
import { computed } from 'vue'
import type { AxialCoord } from '../../types/hex'
import { useHexGrid } from '../../composables/useHexGrid'

const props = defineProps<{
  coord: AxialCoord
  hexSize: number
  revealed: boolean
  flagged: boolean
  hasBee: boolean
  neighborBees: number
  gameOver: boolean
}>()

const emit = defineEmits<{
  reveal: [coord: AxialCoord]
  flag: [coord: AxialCoord]
}>()

const { axialToPixel, hexCorners } = useHexGrid(props.hexSize)

const pixel = computed(() => axialToPixel(props.coord))
const points = computed(() => hexCorners(pixel.value.x, pixel.value.y))

const fill = computed(() => {
  if (props.gameOver && props.hasBee) return '#FFE0E0'
  if (props.flagged) return '#FFE8B0'
  if (!props.revealed) return '#F0EBF8'
  if (props.hasBee) return '#FFE0E0'
  return '#ffffff'
})

const numberColors: Record<number, string> = {
  1: '#4A90D9',
  2: '#5CB85C',
  3: '#D9534F',
  4: '#8B5CF6',
  5: '#D97706',
  6: '#EC4899',
}

let longPressTimer: number | null = null

let isTap = false

function onTouchStart(e: TouchEvent) {
  e.preventDefault()
  isTap = true
  longPressTimer = window.setTimeout(() => {
    isTap = false
    longPressTimer = null
    emit('flag', props.coord)
  }, 400)
}

function onTouchEnd() {
  if (longPressTimer !== null) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
  if (isTap) {
    isTap = false
    emit('reveal', props.coord)
  }
}

function onTouchMove() {
  isTap = false
  if (longPressTimer !== null) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}
</script>

<template>
  <g
    class="mine-cell"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
    @touchmove="onTouchMove"
    @click.prevent="emit('reveal', coord)"
    @contextmenu.prevent="emit('flag', coord)"
  >
    <polygon
      :points="points"
      :fill="fill"
      stroke="#d8d0e8"
      stroke-width="1.5"
    />

    <!-- Unrevealed -->
    <template v-if="!revealed && !flagged && !gameOver">
      <circle
        :cx="pixel.x" :cy="pixel.y"
        :r="hexSize * 0.3"
        fill="#E8E0F0"
      />
    </template>

    <!-- Flag -->
    <template v-if="flagged && !gameOver">
      <text
        :x="pixel.x" :y="pixel.y + 1"
        text-anchor="middle"
        dominant-baseline="central"
        :font-size="hexSize * 0.7"
      >🚩</text>
    </template>

    <!-- Revealed number -->
    <template v-if="revealed && !hasBee && neighborBees > 0">
      <text
        :x="pixel.x" :y="pixel.y + 1"
        text-anchor="middle"
        dominant-baseline="central"
        :font-size="hexSize * 0.65"
        font-weight="700"
        :fill="numberColors[neighborBees] ?? '#333'"
      >{{ neighborBees }}</text>
    </template>

    <!-- Revealed flower (safe, 0 neighbors) -->
    <template v-if="revealed && !hasBee && neighborBees === 0">
      <text
        :x="pixel.x" :y="pixel.y + 1"
        text-anchor="middle"
        dominant-baseline="central"
        :font-size="hexSize * 0.5"
      >🌸</text>
    </template>

    <!-- Bee (revealed or game over) -->
    <template v-if="(revealed || gameOver) && hasBee">
      <text
        :x="pixel.x" :y="pixel.y + 1"
        text-anchor="middle"
        dominant-baseline="central"
        :font-size="hexSize * 0.7"
      >🐝</text>
    </template>
  </g>
</template>

<style scoped>
.mine-cell {
  cursor: pointer;
  pointer-events: all;
  -webkit-tap-highlight-color: transparent;
}
.mine-cell:active polygon {
  filter: brightness(0.93);
}
</style>
