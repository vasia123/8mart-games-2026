<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import GameShell from '../shared/GameShell.vue'
import GameHeader from '../shared/GameHeader.vue'
import HexGrid from '../shared/HexGrid.vue'
import MineCell from './MineCell.vue'
import VictoryOverlay from '../shared/VictoryOverlay.vue'
import HintReveal from '../shared/HintReveal.vue'
import { useHexGrid } from '../../composables/useHexGrid'
import { useGameState } from '../../composables/useGameState'
import { getHint, getGameMeta } from '../../data/hints'
import { MINESWEEPER_CONFIG } from '../../data/levels/minesweeper'
import type { AxialCoord } from '../../types/hex'
import type { MineCell as MineCellType } from '../../types/games'

const props = defineProps<{ gameId: number }>()
const meta = getGameMeta(props.gameId)!
const hint = getHint(props.gameId)!
const hexSize = 28

const { hexDisk, neighbors, coordKey } = useHexGrid(hexSize)
const { isWon, startGame, winGame, resetGame } = useGameState()

const { radius, beeCount } = MINESWEEPER_CONFIG
const allCoords = hexDisk(radius)

const cells = reactive<Map<string, MineCellType>>(new Map())
const gameOver = ref(false)
const showHint = ref(false)
let generated = false

function initCells() {
  cells.clear()
  generated = false
  gameOver.value = false
  showHint.value = false
  for (const coord of allCoords) {
    cells.set(coordKey(coord), {
      coord,
      hasBee: false,
      revealed: false,
      flagged: false,
      neighborBees: 0,
    })
  }
  startGame()
}

function generateBees(safeCoord: AxialCoord) {
  const safeKey = coordKey(safeCoord)
  const safeNeighbors = new Set(neighbors(safeCoord).map(coordKey))
  safeNeighbors.add(safeKey)

  const candidates = allCoords
    .map(coordKey)
    .filter(k => !safeNeighbors.has(k))

  // Shuffle and pick
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j]!, candidates[i]!]
  }

  for (let i = 0; i < beeCount && i < candidates.length; i++) {
    cells.get(candidates[i]!)!.hasBee = true
  }

  // Calculate neighbor counts
  for (const [, cell] of cells) {
    if (cell.hasBee) continue
    const ns = neighbors(cell.coord)
    cell.neighborBees = ns.filter(n => {
      const nk = coordKey(n)
      return cells.has(nk) && cells.get(nk)!.hasBee
    }).length
  }

  generated = true
}

function revealCell(coord: AxialCoord) {
  if (gameOver.value || isWon.value) return
  const key = coordKey(coord)
  const cell = cells.get(key)
  if (!cell || cell.revealed || cell.flagged) return

  if (!generated) {
    generateBees(coord)
  }

  cell.revealed = true

  if (cell.hasBee) {
    gameOver.value = true
    return
  }

  // Flood fill for zeros
  if (cell.neighborBees === 0) {
    const queue = [coord]
    while (queue.length) {
      const current = queue.shift()!
      for (const n of neighbors(current)) {
        const nk = coordKey(n)
        const nc = cells.get(nk)
        if (!nc || nc.revealed || nc.flagged || nc.hasBee) continue
        nc.revealed = true
        if (nc.neighborBees === 0) {
          queue.push(n)
        }
      }
    }
  }

  checkWin()
}

function flagCell(coord: AxialCoord) {
  if (gameOver.value || isWon.value) return
  const key = coordKey(coord)
  const cell = cells.get(key)
  if (!cell || cell.revealed) return
  cell.flagged = !cell.flagged
}

function checkWin() {
  const unrevealed = [...cells.values()].filter(c => !c.revealed && !c.hasBee)
  if (unrevealed.length === 0) {
    winGame()
  }
}

function onVictoryContinue() {
  showHint.value = true
}

function restart() {
  resetGame()
  initCells()
}

const flagCount = computed(() =>
  [...cells.values()].filter(c => c.flagged).length
)

// Init on mount
initCells()
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
        <span>🐝 {{ beeCount - flagCount }}</span>
        <span v-if="gameOver" class="game-over-text">Ой, пчела! 🐝</span>
      </div>

      <HexGrid :coords="allCoords" :hex-size="hexSize" :padding="20">
        <MineCell
          v-for="[key, cell] in cells"
          :key="key"
          :coord="cell.coord"
          :hex-size="hexSize"
          :revealed="cell.revealed"
          :flagged="cell.flagged"
          :has-bee="cell.hasBee"
          :neighbor-bees="cell.neighborBees"
          :game-over="gameOver"
          @reveal="revealCell"
          @flag="flagCell"
        />
      </HexGrid>

      <VictoryOverlay v-if="isWon" @continue="onVictoryContinue" />
    </template>

    <template v-else>
      <HintReveal
        :hint-text="hint.hintText"
        :code="hint.code"
        :next-game-id="gameId < 6 ? gameId + 1 : undefined"
      />
    </template>

    <template #footer>
      <button v-if="gameOver && !isWon" class="restart-btn" @click="restart">
        Попробовать снова
      </button>
      <p v-else-if="!showHint" class="tip">Тап — открыть, долгое нажатие — флажок</p>
    </template>
  </GameShell>
</template>

<style scoped>
.info-bar {
  display: flex;
  gap: 16px;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.game-over-text {
  color: #D9534F;
  animation: scaleIn 0.3s ease-out;
}

.restart-btn {
  background: linear-gradient(135deg, var(--pink), var(--lavender));
  color: white;
  font-size: 15px;
  font-weight: 700;
  padding: 12px 28px;
  border-radius: 50px;
  box-shadow: 0 4px 16px var(--shadow);
}

.restart-btn:active {
  transform: scale(0.95);
}

.tip {
  font-size: 12px;
  color: var(--text-light);
}
</style>
