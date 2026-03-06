import { ref, computed } from 'vue'
import type { GameStatus } from '../types/common'

export function useGameState() {
  const status = ref<GameStatus>('idle')
  const moves = ref(0)

  const isPlaying = computed(() => status.value === 'playing')
  const isWon = computed(() => status.value === 'won')
  const isIdle = computed(() => status.value === 'idle')

  function startGame() {
    status.value = 'playing'
    moves.value = 0
  }

  function addMove() {
    moves.value++
  }

  function winGame() {
    status.value = 'won'
  }

  function resetGame() {
    status.value = 'idle'
    moves.value = 0
  }

  return {
    status,
    moves,
    isPlaying,
    isWon,
    isIdle,
    startGame,
    addMove,
    winGame,
    resetGame,
  }
}
