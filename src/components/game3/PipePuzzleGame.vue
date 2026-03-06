<script setup lang="ts">
import { ref, reactive } from 'vue'
import GameShell from '../shared/GameShell.vue'
import GameHeader from '../shared/GameHeader.vue'
import HexGrid from '../shared/HexGrid.vue'
import PipeHexCell from './PipeHexCell.vue'
import VictoryOverlay from '../shared/VictoryOverlay.vue'
import HintReveal from '../shared/HintReveal.vue'
import { useHexGrid } from '../../composables/useHexGrid'
import { useGameState } from '../../composables/useGameState'
import { getHint, getGameMeta } from '../../data/hints'
import type { AxialCoord } from '../../types/hex'

const props = defineProps<{ gameId: number }>()
const meta = getGameMeta(props.gameId)!
const hint = getHint(props.gameId)!
const hexSize = 34

const { coordKey, neighbors: getNeighbors } = useHexGrid(hexSize)
const { isWon, startGame, addMove, winGame, moves } = useGameState()
const showHint = ref(false)

interface CellState {
  coord: AxialCoord
  connections: boolean[]
  rotation: number
  isSource: boolean
  isTarget: boolean
  filled: boolean
}

const cellMap = reactive<Map<string, CellState>>(new Map())
const allCoords = ref<AxialCoord[]>([])

function initGame() {
  cellMap.clear()
  showHint.value = false

  // Directions: 0=E, 1=NE, 2=NW, 3=W, 4=SW, 5=SE
  // Dense 13-cell grid: 3-way source, T-junctions, bends, and decoy pipes
  const correctedLayout: { coord: AxialCoord; baseConns: boolean[]; src?: boolean; tgt?: boolean }[] = [
    // Source: 3-way E, NW, SW
    { coord: { q: 0, r: 0 }, baseConns: [true, false, true, false, true, false], src: true },
    // (1,0) T-junction: NW, W, SE — splits east branch
    { coord: { q: 1, r: 0 }, baseConns: [false, false, true, true, false, true] },
    // (1,-1) bend: NE, SE — upper-east relay
    { coord: { q: 1, r: -1 }, baseConns: [false, true, false, false, false, true] },
    // (2,-2) target: SW
    { coord: { q: 2, r: -2 }, baseConns: [false, false, false, false, true, false], tgt: true },
    // (1,1) bend: NW, SE — lower-east relay
    { coord: { q: 1, r: 1 }, baseConns: [false, false, true, false, false, true] },
    // (1,2) target: NW
    { coord: { q: 1, r: 2 }, baseConns: [false, false, true, false, false, false], tgt: true },
    // (0,-1) bend: W, SE — northwest relay
    { coord: { q: 0, r: -1 }, baseConns: [false, false, false, true, false, true] },
    // (-1,-1) bend: E, SW — northwest relay 2
    { coord: { q: -1, r: -1 }, baseConns: [true, false, false, false, true, false] },
    // (-2,0) target: NE
    { coord: { q: -2, r: 0 }, baseConns: [false, true, false, false, false, false], tgt: true },
    // (-1,1) bend: NE, W — southwest relay
    { coord: { q: -1, r: 1 }, baseConns: [false, true, false, true, false, false] },
    // (-2,1) target: E
    { coord: { q: -2, r: 1 }, baseConns: [true, false, false, false, false, false], tgt: true },
    // DECOY (-1,0): bend E, SE — adjacent to many path cells
    { coord: { q: -1, r: 0 }, baseConns: [true, false, false, false, false, true] },
    // DECOY (0,1): bend E, NW — near lower paths
    { coord: { q: 0, r: 1 }, baseConns: [true, false, true, false, false, false] },
  ]

  const seen = new Set<string>()
  const unique = correctedLayout.filter(c => {
    const k = coordKey(c.coord)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })

  allCoords.value = unique.map(c => c.coord)

  for (const item of unique) {
    const key = coordKey(item.coord)
    const scramble = item.src ? 0 : (Math.floor(Math.random() * 5) + 1)
    cellMap.set(key, {
      coord: item.coord,
      connections: [...item.baseConns],
      rotation: scramble,
      isSource: item.src ?? false,
      isTarget: item.tgt ?? false,
      filled: false,
    })
  }

  checkConnectivity()
  startGame()
}

function rotateCell(coord: AxialCoord) {
  if (isWon.value) return
  const key = coordKey(coord)
  const cell = cellMap.get(key)
  if (!cell || cell.isSource) return

  cell.rotation = (cell.rotation + 1) % 6
  addMove()
  checkConnectivity()
}

function getRotatedConnections(cell: CellState): boolean[] {
  const result: boolean[] = []
  for (let i = 0; i < 6; i++) {
    result.push(cell.connections[((i - cell.rotation) % 6 + 6) % 6] ?? false)
  }
  return result
}

function checkConnectivity() {
  for (const cell of cellMap.values()) {
    cell.filled = false
  }

  const sourceKey = [...cellMap.entries()].find(([, c]) => c.isSource)?.[0]
  if (!sourceKey) return

  const source = cellMap.get(sourceKey)!
  source.filled = true

  const queue = [source]
  const visited = new Set<string>([sourceKey])

  while (queue.length) {
    const current = queue.shift()!
    const currentConns = getRotatedConnections(current)

    for (let dir = 0; dir < 6; dir++) {
      if (!currentConns[dir]) continue

      const nCoord = getNeighbors(current.coord)[dir]
      if (!nCoord) continue
      const nKey = coordKey(nCoord)
      if (visited.has(nKey)) continue

      const nb = cellMap.get(nKey)
      if (!nb) continue

      const nbConns = getRotatedConnections(nb)
      const oppDir = (dir + 3) % 6

      if (nbConns[oppDir]) {
        visited.add(nKey)
        nb.filled = true
        queue.push(nb)
      }
    }
  }

  const allTargetsFilled = [...cellMap.values()]
    .filter(c => c.isTarget)
    .every(c => c.filled)

  if (allTargetsFilled) {
    winGame()
  }
}

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
        <span>Ходов: {{ moves }}</span>
      </div>

      <HexGrid :coords="allCoords" :hex-size="hexSize" :padding="30">
        <PipeHexCell
          v-for="[key, cell] in cellMap"
          :key="key"
          :coord="cell.coord"
          :hex-size="hexSize"
          :connections="cell.connections"
          :rotation="cell.rotation"
          :is-source="cell.isSource"
          :is-target="cell.isTarget"
          :filled="cell.filled"
          @rotate="rotateCell"
        />
      </HexGrid>

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
      <p v-if="!showHint && !isWon" class="tip">Тапни ячейку, чтобы повернуть трубу на 60°</p>
    </template>
  </GameShell>
</template>

<style scoped>
.info-bar {
  font-size: 15px;
  color: var(--text);
  margin-bottom: 8px;
}

.tip {
  font-size: 12px;
  color: var(--text-light);
}
</style>
