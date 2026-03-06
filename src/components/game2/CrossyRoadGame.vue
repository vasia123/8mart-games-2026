<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import GameShell from '../shared/GameShell.vue'
import GameHeader from '../shared/GameHeader.vue'
import VictoryOverlay from '../shared/VictoryOverlay.vue'
import HintReveal from '../shared/HintReveal.vue'
import ArrowPad from './ArrowPad.vue'
import { useGameState } from '../../composables/useGameState'
import { getHint, getGameMeta } from '../../data/hints'

const props = defineProps<{ gameId: number }>()
const meta = getGameMeta(props.gameId)!
const hint = getHint(props.gameId)!

const { isWon, startGame, winGame, resetGame } = useGameState()
const showHint = ref(false)
const gameOver = ref(false)

const COLS = 5
const TOTAL_ROWS = 20
const VISIBLE_ROWS = 7
const CELL_SIZE = 56

// Player position (col, row). Row 0 = finish, row TOTAL_ROWS-1 = start
const playerCol = ref(Math.floor(COLS / 2))
const playerRow = ref(TOTAL_ROWS - 1)

// Lane types
type LaneType = 'grass' | 'road' | 'finish'

interface Obstacle {
  col: number        // fractional position (0..COLS-1)
  speed: number      // cells per second (negative = left)
  emoji: string
}

interface Lane {
  type: LaneType
  obstacles: Obstacle[]
  decoration: string  // bg emoji
}

const lanes = reactive<Lane[]>([])

function generateLanes() {
  lanes.length = 0

  for (let r = 0; r < TOTAL_ROWS; r++) {
    if (r === 0) {
      // Finish line
      lanes.push({ type: 'finish', obstacles: [], decoration: '🌸' })
    } else if (r >= TOTAL_ROWS - 2) {
      // Starting safe zone (last 2 rows)
      lanes.push({ type: 'grass', obstacles: [], decoration: '' })
    } else {
      // Mix of grass and roads
      const difficulty = 1 - r / TOTAL_ROWS // 0 near start, ~1 near finish
      const prevIsGrass = lanes[r - 1]?.type === 'grass'
      // Count consecutive roads before this row
      let consecRoads = 0
      for (let k = r - 1; k >= 0 && lanes[k]?.type === 'road'; k--) consecRoads++
      // Force grass after 3 consecutive roads; force road after grass
      const isRoad = consecRoads >= 3 ? false : (prevIsGrass || Math.random() < 0.4 + difficulty * 0.3)

      if (isRoad) {
        const dir = Math.random() < 0.5 ? 1 : -1
        const speed = (1.0 + Math.random() * 1.5 + difficulty * 1.0) * dir
        const count = 1 + Math.floor(Math.random() * 2)
        const obs: Obstacle[] = []
        for (let i = 0; i < count; i++) {
          obs.push({
            col: Math.random() * COLS,
            speed,
            emoji: '🚜',
          })
        }
        lanes.push({ type: 'road', obstacles: obs, decoration: '' })
      } else {
        lanes.push({ type: 'grass', obstacles: [], decoration: '' })
      }
    }
  }

  // Ensure at least some roads exist
  let roadCount = lanes.filter(l => l.type === 'road').length
  if (roadCount < 5) {
    // Convert some grass to roads
    for (let r = 3; r < TOTAL_ROWS - 3 && roadCount < 6; r += 2) {
      if (lanes[r]!.type === 'grass') {
        const dir = Math.random() < 0.5 ? 1 : -1
        const speed = (1.2 + Math.random() * 1.5) * dir
        lanes[r] = {
          type: 'road',
          obstacles: [
            { col: Math.random() * COLS, speed, emoji: '🚜' },
            { col: Math.random() * COLS, speed, emoji: '🚜' },
          ],
          decoration: '',
        }
        roadCount++
      }
    }
  }
}

// Camera offset: which row is at the bottom of the visible area
const cameraRow = computed(() => {
  const target = playerRow.value + Math.floor(VISIBLE_ROWS / 2)
  return Math.min(TOTAL_ROWS - 1, Math.max(VISIBLE_ROWS - 1, target))
})

const visibleLanes = computed(() => {
  if (lanes.length === 0) return []
  const bottom = cameraRow.value
  const top = bottom - VISIBLE_ROWS + 1
  const result: { row: number; lane: Lane }[] = []
  for (let r = top; r <= bottom; r++) {
    if (r >= 0 && r < lanes.length) {
      result.push({ row: r, lane: lanes[r]! })
    }
  }
  return result
})

// Animation loop
let animFrame = 0
let lastTime = 0

function tick(time: number) {
  if (gameOver.value || isWon.value) return

  const dt = lastTime ? (time - lastTime) / 1000 : 0
  lastTime = time

  // Move obstacles
  for (const lane of lanes) {
    for (const obs of lane.obstacles) {
      obs.col += obs.speed * dt
      // Wrap around
      if (obs.col > COLS + 0.5) obs.col = -0.5
      if (obs.col < -0.5) obs.col = COLS + 0.5
    }
  }

  // Check collision at current position
  if (checkCollision(playerCol.value, playerRow.value)) {
    gameOver.value = true
    return
  }

  animFrame = requestAnimationFrame(tick)
}

function checkCollision(col: number, row: number): boolean {
  const lane = lanes[row]
  if (!lane || lane.type !== 'road') return false
  for (const obs of lane.obstacles) {
    if (Math.abs(obs.col - col) < 0.2) return true
  }
  return false
}

function move(dir: 'up' | 'down' | 'left' | 'right') {
  if (gameOver.value || isWon.value) return

  let newCol = playerCol.value
  let newRow = playerRow.value

  switch (dir) {
    case 'up': newRow--; break
    case 'down': newRow++; break
    case 'left': newCol--; break
    case 'right': newCol++; break
  }

  // Bounds check
  if (newCol < 0 || newCol >= COLS) return
  if (newRow < 0 || newRow >= TOTAL_ROWS) return

  playerCol.value = newCol
  playerRow.value = newRow

  // Check win
  if (newRow === 0) {
    winGame()
    return
  }

  // Check collision after move
  if (checkCollision(newCol, newRow)) {
    gameOver.value = true
  }
}

function initGame() {
  gameOver.value = false
  showHint.value = false
  playerCol.value = Math.floor(COLS / 2)
  playerRow.value = TOTAL_ROWS - 1
  lastTime = 0
  generateLanes()
  startGame()
  animFrame = requestAnimationFrame(tick)
}

function restart() {
  cancelAnimationFrame(animFrame)
  resetGame()
  initGame()
}

onMounted(() => {
  initGame()
})

onUnmounted(() => {
  cancelAnimationFrame(animFrame)
})

function obstacleStyle(obs: Obstacle): Record<string, string> {
  const left = (obs.col / COLS) * 100
  return {
    position: 'absolute',
    left: `${left}%`,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: `${CELL_SIZE * 0.6}px`,
    lineHeight: '1',
    transition: 'none',
  }
}

const progress = computed(() => {
  return Math.round(((TOTAL_ROWS - 1 - playerRow.value) / (TOTAL_ROWS - 1)) * 100)
})
</script>

<template>
  <GameShell :no-padding="true">
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
        <span>🦋 {{ progress }}%</span>
        <span v-if="gameOver" class="game-over-text">Газонокосилка! 🚜</span>
      </div>

      <!-- Game board -->
      <div class="board-wrapper">
        <div class="board">
          <div
            v-for="{ row, lane } in visibleLanes"
            :key="row"
            class="lane"
            :class="lane.type"
          >
            <!-- Grass decoration -->
            <template v-if="lane.type === 'grass'">
              <span
                v-for="c in COLS"
                :key="c"
                class="grass-cell"
                :style="{ left: `${((c - 0.5) / COLS) * 100}%` }"
              >{{ lane.decoration }}</span>
            </template>

            <!-- Finish decoration -->
            <template v-if="lane.type === 'finish'">
              <span
                v-for="c in COLS"
                :key="c"
                class="finish-cell"
                :style="{ left: `${((c - 0.5) / COLS) * 100}%` }"
              >{{ ['🌸', '🌺', '🌷', '🌸', '🌻'][c - 1] }}</span>
            </template>

            <!-- Obstacles -->
            <span
              v-for="(obs, oi) in lane.obstacles"
              :key="oi"
              :style="obstacleStyle(obs)"
            >{{ obs.emoji }}</span>

            <!-- Player -->
            <span
              v-if="row === playerRow"
              class="player"
              :style="{
                left: `${((playerCol + 0.5) / COLS) * 100}%`,
              }"
            >🦋</span>
          </div>
        </div>
      </div>

      <!-- Arrow controls -->
      <ArrowPad v-if="!gameOver && !isWon" @move="move" />

      <button v-if="gameOver" class="restart-btn" @click="restart">
        Попробовать снова
      </button>

      <VictoryOverlay v-if="isWon" @continue="showHint = true" />
    </template>

    <template v-else>
      <HintReveal
        :hint-text="hint.hintText"
        :code="hint.code"
        :next-game-id="gameId < 6 ? gameId + 1 : undefined"
      />
    </template>
  </GameShell>
</template>

<style scoped>
.info-bar {
  display: flex;
  gap: 16px;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  padding: 4px 16px;
}

.game-over-text {
  color: #D9534F;
  animation: scaleIn 0.3s ease-out;
}

.board-wrapper {
  flex: 1;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.board {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
}

.lane {
  position: relative;
  height: v-bind('CELL_SIZE + "px"');
  width: 100%;
  overflow: hidden;
}

.lane.grass {
  background: #C8F0C8;
}

.lane.road {
  background: #D8D0C0;
  border-top: 1px dashed #B8B0A0;
  border-bottom: 1px dashed #B8B0A0;
}

.lane.finish {
  background: linear-gradient(90deg, #FFE0F0, #F0E0FF, #E0F0FF);
}

.grass-cell,
.finish-cell {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: v-bind('CELL_SIZE * 0.4 + "px"');
  opacity: 0.6;
  pointer-events: none;
}

.finish-cell {
  font-size: v-bind('CELL_SIZE * 0.55 + "px"');
  opacity: 1;
}

.player {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: v-bind('CELL_SIZE * 0.65 + "px"');
  z-index: 10;
  transition: left 0.1s ease;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.restart-btn {
  margin-top: 8px;
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
</style>
