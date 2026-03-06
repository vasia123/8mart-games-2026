<script setup lang="ts">
import { computed } from 'vue'
import type { AxialCoord } from '../../types/hex'
import { useHexGrid } from '../../composables/useHexGrid'

const props = defineProps<{
  coord: AxialCoord
  hexSize?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  interactive?: boolean
}>()

const emit = defineEmits<{
  click: [coord: AxialCoord]
}>()

const size = computed(() => props.hexSize ?? 30)
const { axialToPixel, hexCorners } = useHexGrid(size.value)

const pixel = computed(() => axialToPixel(props.coord))
const points = computed(() => hexCorners(pixel.value.x, pixel.value.y))
</script>

<template>
  <g
    :class="{ interactive }"
    @click="emit('click', coord)"
    @touchend.prevent="emit('click', coord)"
  >
    <polygon
      :points="points"
      :fill="fill ?? '#ffffff'"
      :stroke="stroke ?? '#e0d8f0'"
      :stroke-width="strokeWidth ?? 1.5"
    />
    <slot :cx="pixel.x" :cy="pixel.y" :size="size" />
  </g>
</template>

<style scoped>
.interactive {
  cursor: pointer;
}
.interactive:active polygon {
  filter: brightness(0.95);
}
</style>
