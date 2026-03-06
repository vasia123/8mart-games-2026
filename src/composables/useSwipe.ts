import { ref, onMounted, onUnmounted } from 'vue'
import type { HexDirection } from '../types/hex'
import type { Ref } from 'vue'

const MIN_DISTANCE = 30

export function useSwipe(
  elementRef: Ref<HTMLElement | SVGElement | null>,
  onSwipe: (dir: HexDirection) => void
) {
  const startX = ref(0)
  const startY = ref(0)

  function handleStart(e: TouchEvent) {
    const touch = e.touches[0]
    if (!touch) return
    startX.value = touch.clientX
    startY.value = touch.clientY
  }

  function handleEnd(e: TouchEvent) {
    const touch = e.changedTouches[0]
    if (!touch) return
    const dx = touch.clientX - startX.value
    const dy = touch.clientY - startY.value
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < MIN_DISTANCE) return

    let angle = Math.atan2(-dy, dx) * (180 / Math.PI)
    if (angle < 0) angle += 360

    const dir = Math.round(angle / 60) % 6
    onSwipe(dir as HexDirection)
  }

  onMounted(() => {
    const el = elementRef.value
    if (!el) return
    el.addEventListener('touchstart', handleStart as EventListener, { passive: true })
    el.addEventListener('touchend', handleEnd as EventListener, { passive: true })
  })

  onUnmounted(() => {
    const el = elementRef.value
    if (!el) return
    el.removeEventListener('touchstart', handleStart as EventListener)
    el.removeEventListener('touchend', handleEnd as EventListener)
  })
}
