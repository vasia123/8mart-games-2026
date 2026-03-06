<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import GameShell from '../shared/GameShell.vue'
import GameHeader from '../shared/GameHeader.vue'
import VictoryOverlay from '../shared/VictoryOverlay.vue'
import HintReveal from '../shared/HintReveal.vue'
import { useGameState } from '../../composables/useGameState'
import { getHint, getGameMeta } from '../../data/hints'

const props = defineProps<{ gameId: number }>()
const meta = getGameMeta(props.gameId)!
const hint = getHint(props.gameId)!

const { isWon, startGame, winGame, resetGame } = useGameState()
const showHint = ref(false)
const gameOver = ref(false)
const started = ref(false)

// Game dimensions (logical units)
const W = 320
const H = 480

// Bee
const BEE_X = W * 0.2
const BEE_SIZE = 28
const beeY = ref(H / 2)
let velocity = 0
const GRAVITY = 450
const JUMP_FORCE = -220

// Pipes
interface Pipe {
  x: number
  gapY: number
  gapH: number
  scored: boolean
}

const pipes = ref<Pipe[]>([])
const PIPE_W = 44
const PIPE_SPEED = 120
const PIPE_GAP = 120
const PIPE_INTERVAL = 180 // horizontal distance between pipes
const WIN_SCORE = 8

const score = ref(0)
let pipesSpawned = 0

let animFrame = 0
let lastTime = 0

function spawnPipe(x: number): Pipe {
  const minGapY = 80
  const maxGapY = H - 80 - PIPE_GAP
  const gapY = minGapY + Math.random() * (maxGapY - minGapY)
  return { x, gapY, gapH: PIPE_GAP, scored: false }
}

function tick(time: number) {
  if (gameOver.value || isWon.value) return

  const dt = lastTime ? (time - lastTime) / 1000 : 0
  lastTime = time

  if (!started.value) {
    animFrame = requestAnimationFrame(tick)
    return
  }

  // Gravity
  velocity += GRAVITY * dt
  beeY.value += velocity * dt

  // Floor / ceiling
  if (beeY.value < BEE_SIZE / 2) {
    beeY.value = BEE_SIZE / 2
    velocity = 0
  }
  if (beeY.value > H - BEE_SIZE / 2) {
    gameOver.value = true
    return
  }

  // Move pipes
  for (const p of pipes.value) {
    p.x -= PIPE_SPEED * dt
  }

  // Remove off-screen pipes
  pipes.value = pipes.value.filter(p => p.x > -PIPE_W)

  // Spawn new pipes (max WIN_SCORE)
  const lastPipe = pipes.value[pipes.value.length - 1]
  if (pipesSpawned < WIN_SCORE && (!lastPipe || lastPipe.x < W - PIPE_INTERVAL)) {
    pipes.value.push(spawnPipe(W + 20))
    pipesSpawned++
  }

  // Check collision & scoring
  for (const p of pipes.value) {
    // Score
    if (!p.scored && p.x + PIPE_W / 2 < BEE_X) {
      p.scored = true
      score.value++
      if (score.value >= WIN_SCORE) {
        winGame()
        return
      }
    }

    // Collision
    if (checkCollision(p)) {
      gameOver.value = true
      return
    }
  }

  animFrame = requestAnimationFrame(tick)
}

function checkCollision(p: Pipe): boolean {
  const beeLeft = BEE_X - BEE_SIZE / 2 + 8
  const beeRight = BEE_X + BEE_SIZE / 2 - 8
  const beeTop = beeY.value - BEE_SIZE / 2 + 8
  const beeBottom = beeY.value + BEE_SIZE / 2 - 8

  const pipeLeft = p.x
  const pipeRight = p.x + PIPE_W

  // No horizontal overlap
  if (beeRight < pipeLeft || beeLeft > pipeRight) return false

  // In the gap?
  if (beeTop > p.gapY && beeBottom < p.gapY + p.gapH) return false

  return true
}

function flap() {
  if (gameOver.value || isWon.value) return
  if (!started.value) {
    started.value = true
  }
  velocity = JUMP_FORCE
}

function initGame() {
  gameOver.value = false
  started.value = false
  showHint.value = false
  score.value = 0
  pipesSpawned = 0
  beeY.value = H / 2
  velocity = 0
  pipes.value = []
  lastTime = 0
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

const beeStyle = computed(() => ({
  left: `${(BEE_X / W) * 100}%`,
  top: `${(beeY.value / H) * 100}%`,
  width: `${BEE_SIZE}px`,
  height: `${BEE_SIZE}px`,
  transform: `translate(-50%, -50%) scaleX(-1) rotate(${Math.min(velocity / 8, 40)}deg)`,
}))

function pipeTopStyle(p: Pipe) {
  return {
    left: `${(p.x / W) * 100}%`,
    top: '0',
    width: `${(PIPE_W / W) * 100}%`,
    height: `${(p.gapY / H) * 100}%`,
  }
}

function pipeBottomStyle(p: Pipe) {
  const bottomTop = p.gapY + p.gapH
  return {
    left: `${(p.x / W) * 100}%`,
    top: `${(bottomTop / H) * 100}%`,
    width: `${(PIPE_W / W) * 100}%`,
    height: `${((H - bottomTop) / H) * 100}%`,
  }
}

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
        <span>🐝 {{ score }} / {{ WIN_SCORE }}</span>
        <span v-if="gameOver" class="game-over-text">Ой! 🌿</span>
      </div>

      <div class="game-area" @click="flap" @touchstart.prevent="flap">
        <!-- Pipes -->
        <template v-for="(p, i) in pipes" :key="i">
          <div class="pipe pipe-top" :style="pipeTopStyle(p)">
            <div class="pipe-cap pipe-cap-bottom" />
          </div>
          <div class="pipe pipe-bottom" :style="pipeBottomStyle(p)">
            <div class="pipe-cap pipe-cap-top" />
          </div>
        </template>

        <!-- Bee -->
        <div class="bee" :style="beeStyle">🐝</div>

        <!-- Tap to start -->
        <div v-if="!started && !gameOver" class="tap-hint">
          Тапни, чтобы лететь!
        </div>

        <!-- Ground -->
        <div class="ground" />
      </div>

      <button v-if="gameOver" class="restart-btn" @click.stop="restart">
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

.game-area {
  flex: 1;
  width: 100%;
  max-width: 320px;
  aspect-ratio: 320 / 480;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #E8F4FD 0%, #D4EDFA 40%, #C8E6C9 100%);
  border-radius: 16px;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  cursor: pointer;
}

.bee {
  position: absolute;
  font-size: 24px;
  line-height: 1;
  z-index: 10;
  transition: none;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
}

.pipe {
  position: absolute;
  background: linear-gradient(90deg, #66BB6A, #43A047);
  border-radius: 4px;
  z-index: 5;
}

.pipe-cap {
  position: absolute;
  left: -3px;
  right: -3px;
  height: 12px;
  background: linear-gradient(90deg, #4CAF50, #388E3C);
  border-radius: 4px;
}

.pipe-cap-bottom {
  bottom: 0;
}

.pipe-cap-top {
  top: 0;
}

.ground {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4%;
  background: linear-gradient(0deg, #8D6E63, #A1887F);
}

.tap-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  background: rgba(255,255,255,0.85);
  padding: 12px 24px;
  border-radius: 50px;
  z-index: 20;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.05); }
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
