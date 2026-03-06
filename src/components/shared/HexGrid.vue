<script setup lang="ts">
import { computed } from 'vue'
import type { AxialCoord } from '../../types/hex'
import { useHexGrid } from '../../composables/useHexGrid'

const props = defineProps<{
  coords: AxialCoord[]
  hexSize?: number
  padding?: number
}>()

const { axialToPixel } = useHexGrid(props.hexSize ?? 30)

const viewBox = computed(() => {
  const pad = props.padding ?? 40
  const size = props.hexSize ?? 30
  if (props.coords.length === 0) return '0 0 100 100'

  const pixels = props.coords.map(c => axialToPixel(c))
  const xs = pixels.map(p => p.x)
  const ys = pixels.map(p => p.y)

  const minX = Math.min(...xs) - size - pad
  const maxX = Math.max(...xs) + size + pad
  const minY = Math.min(...ys) - size - pad
  const maxY = Math.max(...ys) + size + pad

  return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`
})
</script>

<template>
  <svg
    class="hex-grid"
    :viewBox="viewBox"
    xmlns="http://www.w3.org/2000/svg"
  >
    <slot />
  </svg>
</template>

<style scoped>
.hex-grid {
  width: 100%;
  height: 100%;
  max-height: 60vh;
  touch-action: none;
}
</style>
