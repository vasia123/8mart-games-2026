<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import GameShell from '../shared/GameShell.vue'
import GameHeader from '../shared/GameHeader.vue'
import VictoryOverlay from '../shared/VictoryOverlay.vue'
import HintReveal from '../shared/HintReveal.vue'
import BloomBud from './BloomBud.vue'
import { useGameState } from '../../composables/useGameState'
import { getHint, getGameMeta } from '../../data/hints'
import { bloomLevel } from '../../data/levels/bloom'

const props = defineProps<{ gameId: number }>()
const meta = getGameMeta(props.gameId)!
const hint = getHint(props.gameId)!

const { moves, isWon, startGame, addMove, winGame, resetGame } = useGameState()
const showHint = ref(false)

const cellSize = 56 // pixel size per cell
const gridCols = 5
const gridRows = 5

interface BudState {
  key: string
  col: number
  row: number
  pollen: number
  threshold: number
  bloomed: boolean
}

const buds = reactive<Map<string, BudState>>(new Map())

function cellKey(col: number, row: number) {
  return `${col},${row}`
}

function getNeighbors4(col: number, row: number): string[] {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]] as const
  return dirs
    .map(([dc, dr]) => cellKey(col + dc, row + dr))
    .filter(k => buds.has(k))
}

function initGame() {
  buds.clear()
  showHint.value = false
  for (const cell of bloomLevel.cells) {
    const key = cellKey(cell.coord.q, cell.coord.r)
    buds.set(key, {
      key,
      col: cell.coord.q,
      row: cell.coord.r,
      pollen: 0,
      threshold: cell.threshold,
      bloomed: false,
    })
  }
  startGame()
}

function tapBud(key: string) {
  if (isWon.value) return
  if (moves.value >= bloomLevel.maxTaps) return

  const bud = buds.get(key)
  if (!bud || bud.bloomed) return

  addMove()
  bloomBud(bud)
}

function bloomBud(bud: BudState) {
  if (bud.bloomed) return
  bud.bloomed = true

  // BFS cascade: send pollen to neighbors
  const queue: BudState[] = [bud]
  const processNext = () => {
    if (queue.length === 0) {
      checkWin()
      return
    }

    const current = queue.shift()!
    const neighborKeys = getNeighbors4(current.col, current.row)

    for (const nk of neighborKeys) {
      const neighbor = buds.get(nk)
      if (!neighbor || neighbor.bloomed) continue
      neighbor.pollen++
      if (neighbor.pollen >= neighbor.threshold) {
        neighbor.bloomed = true
        queue.push(neighbor)
      }
    }

    // Small delay for visual cascade effect
    if (queue.length > 0) {
      setTimeout(processNext, 120)
    } else {
      checkWin()
    }
  }

  setTimeout(processNext, 150)
}

function checkWin() {
  const allBloomed = [...buds.values()].every(b => b.bloomed)
  if (allBloomed) {
    winGame()
  }
}

function restart() {
  resetGame()
  initGame()
}

const tapsLeft = computed(() => bloomLevel.maxTaps - moves.value)

const gridWidth = computed(() => gridCols * cellSize)
const gridHeight = computed(() => gridRows * cellSize)

initGame()
</script>

<template>
  <GameShell>
    <template #header>
      <GameHeader
        :step="gameId"
        :title="meta.title"
        :subtitle="meta.subtitle"
        :emoji="meta.emoji"
      />
    </template>

    <template v-if="!showHint">
      <div class="info-bar">
        <span>Тапов осталось: <strong>{{ tapsLeft }}</strong></span>
      </div>

      <svg
        class="bloom-grid"
        :viewBox="`-${cellSize / 2} -${cellSize / 2} ${gridWidth + cellSize} ${gridHeight + cellSize}`"
      >
        <BloomBud
          v-for="[key, bud] in buds"
          :key="key"
          :x="bud.col * cellSize + cellSize / 2"
          :y="bud.row * cellSize + cellSize / 2"
          :size="cellSize"
          :bloomed="bud.bloomed"
          :pollen="bud.pollen"
          :threshold="bud.threshold"
          @tap="tapBud(key)"
        />
      </svg>

      <div v-if="tapsLeft === 0 && !isWon" class="out-of-taps">
        <p>Тапы закончились!</p>
        <button class="restart-btn" @click="restart">Заново</button>
      </div>

      <VictoryOverlay v-if="isWon" @continue="showHint = true" />
    </template>

    <template v-else>
      <HintReveal
        :hint-text="hint.hintText"
        :code="hint.code"
        :next-game-id="gameId < 6 ? gameId + 1 : undefined"
      />
    </template>

    <template #footer>
      <p v-if="!showHint && !isWon" class="tip">Тапни пчелу — расцветет бутон и пошлёт пыльцу соседям.<br/>Пчёлы = сколько пыльцы нужно. Пчела улетела = пыльца получена.</p>
    </template>
  </GameShell>
</template>

<style scoped>
.info-bar {
  font-size: 15px;
  color: var(--text);
  margin-bottom: 8px;
}

.bloom-grid {
  width: 100%;
  max-width: 340px;
  max-height: 55vh;
  touch-action: none;
}

.out-of-taps {
  text-align: center;
  animation: fadeIn 0.3s ease-out;
  margin-top: 16px;
}

.out-of-taps p {
  font-size: 16px;
  color: var(--text);
  margin-bottom: 12px;
}

.restart-btn {
  background: linear-gradient(135deg, var(--pink), var(--lavender));
  color: white;
  font-size: 15px;
  font-weight: 700;
  padding: 12px 28px;
  border-radius: 50px;
}

.tip {
  font-size: 12px;
  color: var(--text-light);
}
</style>
