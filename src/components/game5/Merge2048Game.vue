<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import GameShell from '../shared/GameShell.vue'
import GameHeader from '../shared/GameHeader.vue'
import VictoryOverlay from '../shared/VictoryOverlay.vue'
import HintReveal from '../shared/HintReveal.vue'
import TileCell from './TileCell.vue'
import { useGameState } from '../../composables/useGameState'
import { getHint, getGameMeta } from '../../data/hints'
import type { Tile2048 } from '../../types/games'

const props = defineProps<{ gameId: number }>()
const meta = getGameMeta(props.gameId)!
const hint = getHint(props.gameId)!

const { isWon, startGame, winGame, addMove } = useGameState()

const SIZE = 4
const WIN_VALUE = 128

let nextId = 0
const tiles = ref<Tile2048[]>([])
const showHint = ref(false)
const gameOver = ref(false)
const score = ref(0)

// Track animation states per tile id
const newTiles = reactive(new Set<number>())
const mergedTiles = reactive(new Set<number>())

function emptyPositions(): { row: number; col: number }[] {
  const occupied = new Set(tiles.value.map(t => `${t.row},${t.col}`))
  const result: { row: number; col: number }[] = []
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!occupied.has(`${r},${c}`)) result.push({ row: r, col: c })
    }
  }
  return result
}

function spawnTile(count = 1) {
  const empty = emptyPositions()
  for (let i = 0; i < count && i < empty.length; i++) {
    const idx = Math.floor(Math.random() * (empty.length - i))
    const pos = empty.splice(idx, 1)[0]!
    const id = nextId++
    tiles.value.push({ id, value: Math.random() < 0.9 ? 2 : 4, row: pos.row, col: pos.col })
    newTiles.add(id)
    setTimeout(() => newTiles.delete(id), 200)
  }
}

function initGame() {
  tiles.value = []
  nextId = 0
  score.value = 0
  gameOver.value = false
  showHint.value = false
  newTiles.clear()
  mergedTiles.clear()
  spawnTile(2)
  startGame()
}

type Direction = 'up' | 'down' | 'left' | 'right'

function move(dir: Direction) {
  if (isWon.value || gameOver.value) return

  const grid: (Tile2048 | null)[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
  for (const t of tiles.value) grid[t.row]![t.col] = t

  const merged = new Set<number>()
  const newGrid: Tile2048[] = []

  function processLine(line: (Tile2048 | null)[]): Tile2048[] {
    const filtered = line.filter(Boolean) as Tile2048[]
    const result: Tile2048[] = []
    let i = 0
    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i]!.value === filtered[i + 1]!.value) {
        const newVal = filtered[i]!.value * 2
        const tile: Tile2048 = { id: nextId++, value: newVal, row: 0, col: 0 }
        result.push(tile)
        merged.add(tile.id)
        score.value += newVal
        if (newVal >= WIN_VALUE) {
          setTimeout(() => winGame(), 300)
        }
        i += 2
      } else {
        result.push({ ...filtered[i]! })
        i++
      }
    }
    return result
  }

  if (dir === 'left' || dir === 'right') {
    for (let r = 0; r < SIZE; r++) {
      const line = grid[r]!.slice()
      if (dir === 'right') line.reverse()
      const processed = processLine(line)
      if (dir === 'right') processed.reverse()
      // Pad to SIZE
      while (processed.length < SIZE) {
        if (dir === 'right') processed.unshift(null as any)
        else processed.push(null as any)
      }
      for (let c = 0; c < SIZE; c++) {
        const tile = processed[c]
        if (tile) {
          const origInCol = grid[r]![c]
          if (!origInCol || origInCol.id !== tile.id || origInCol.row !== r || c !== c) {
            // Check if tile actually moved
          }
          tile.row = r
          tile.col = c
          newGrid.push(tile)
        }
      }
    }
  } else {
    for (let c = 0; c < SIZE; c++) {
      const line: (Tile2048 | null)[] = []
      for (let r = 0; r < SIZE; r++) line.push(grid[r]![c] as Tile2048 | null)
      if (dir === 'down') line.reverse()
      const processed = processLine(line)
      if (dir === 'down') processed.reverse()
      while (processed.length < SIZE) {
        if (dir === 'down') processed.unshift(null as any)
        else processed.push(null as any)
      }
      for (let r = 0; r < SIZE; r++) {
        const tile = processed[r]
        if (tile) {
          tile.row = r
          tile.col = c
          newGrid.push(tile)
        }
      }
    }
  }

  // Check if anything moved
  const oldState = tiles.value.map(t => `${t.row},${t.col},${t.value}`).sort().join('|')
  const newState = newGrid.map(t => `${t.row},${t.col},${t.value}`).sort().join('|')

  if (oldState === newState) return // nothing changed

  tiles.value = newGrid
  addMove()

  // Animate merged tiles
  for (const id of merged) {
    mergedTiles.add(id)
    setTimeout(() => mergedTiles.delete(id), 200)
  }

  spawnTile(1)

  // Check game over
  if (!isWon.value && emptyPositions().length === 0 && !canMerge()) {
    gameOver.value = true
  }
}

function canMerge(): boolean {
  const grid: number[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
  for (const t of tiles.value) grid[t.row]![t.col] = t.value
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = grid[r]![c]
      if (c + 1 < SIZE && grid[r]![c + 1] === v) return true
      if (r + 1 < SIZE && grid[r + 1]![c] === v) return true
    }
  }
  return false
}

// Touch handling
let touchStartX = 0
let touchStartY = 0

function onTouchStart(e: TouchEvent) {
  const touch = e.touches[0]!
  touchStartX = touch.clientX
  touchStartY = touch.clientY
}

function onTouchEnd(e: TouchEvent) {
  const touch = e.changedTouches[0]!
  const dx = touch.clientX - touchStartX
  const dy = touch.clientY - touchStartY
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  const threshold = 30

  if (Math.max(absDx, absDy) < threshold) return

  if (absDx > absDy) {
    move(dx > 0 ? 'right' : 'left')
  } else {
    move(dy > 0 ? 'down' : 'up')
  }
}

// Keyboard support
function onKeyDown(e: KeyboardEvent) {
  const map: Record<string, Direction> = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
  }
  const dir = map[e.key]
  if (dir) {
    e.preventDefault()
    move(dir)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  initGame()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})

function onVictoryContinue() {
  showHint.value = true
}
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
      <div class="board-wrapper">
        <div class="score">{{ score }}</div>
        <div
          class="board"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <!-- Background cells -->
          <div v-for="i in SIZE * SIZE" :key="'bg-' + i" class="cell-bg" />
          <!-- Tiles -->
          <TileCell
            v-for="tile in tiles"
            :key="tile.id"
            :value="tile.value"
            :row="tile.row"
            :col="tile.col"
            :is-new="newTiles.has(tile.id)"
            :is-merged="mergedTiles.has(tile.id)"
          />
        </div>

        <div v-if="gameOver" class="game-over-overlay" @click="initGame">
          <div class="game-over-card">
            <p class="game-over-text">Нет ходов!</p>
            <button class="retry-btn" @click.stop="initGame">Ещё раз</button>
          </div>
        </div>
      </div>

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
      <p v-if="!isWon && !gameOver && !showHint" class="tip">
        Свайпай в любую сторону, чтобы двигать плитки. Собери 💐!
      </p>
      <button v-if="!isWon && !gameOver && !showHint" class="reset-btn" @click="initGame">
        Начать заново
      </button>
    </template>
  </GameShell>
</template>

<style scoped>
.board-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
}

.score {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.board {
  position: relative;
  width: min(80vw, 340px);
  height: min(80vw, 340px);
  background: var(--text-light);
  border-radius: var(--radius);
  padding: 4px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 4px;
}

.cell-bg {
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-sm);
}

.game-over-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 248, 240, 0.85);
  border-radius: var(--radius);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.game-over-card {
  text-align: center;
  animation: scaleIn 0.3s ease-out;
}

.game-over-text {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
}

.retry-btn,
.reset-btn {
  background: linear-gradient(135deg, var(--pink), var(--lavender));
  color: white;
  font-size: 14px;
  font-weight: 700;
  padding: 10px 24px;
  border-radius: 50px;
  transition: transform 0.2s;
}

.retry-btn:active,
.reset-btn:active {
  transform: scale(0.95);
}

.reset-btn {
  background: linear-gradient(135deg, var(--mint), var(--lavender));
  color: white;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 20px;
  border-radius: 50px;
}

.tip {
  font-size: 12px;
  color: var(--text-light);
  margin-bottom: 4px;
}
</style>
