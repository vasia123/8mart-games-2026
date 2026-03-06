import type { AxialCoord } from './hex'

// Game 1: Bloom Chain
export interface BloomCell {
  coord: AxialCoord
  pollen: number
  threshold: number
  bloomed: boolean
}

// Game 2: Color Mixing
export type FlowerColor = 'red' | 'blue' | 'yellow' | 'orange' | 'green' | 'purple' | 'white'

export interface FlowerToken {
  id: number
  color: FlowerColor
  x: number
  y: number
}

// Game 3: Pipe Puzzle
export interface PipeCell {
  coord: AxialCoord
  connections: boolean[] // 6 directions, rotatable
  rotation: number // 0-5
  isSource: boolean
  isTarget: boolean
  filled: boolean
}

// Game 4: Hex Minesweeper
export interface MineCell {
  coord: AxialCoord
  hasBee: boolean
  revealed: boolean
  flagged: boolean
  neighborBees: number
}

// Game 5: Flower 2048
export interface Tile2048 {
  id: number
  value: number
  row: number
  col: number
}

// Game 6: Hex Sokoban
export type SokobanTile = 'empty' | 'wall' | 'floor' | 'target'

export interface SokobanState {
  player: AxialCoord
  boxes: AxialCoord[]
  tiles: Map<string, SokobanTile>
  targets: AxialCoord[]
  moves: number
  history: { player: AxialCoord; boxes: AxialCoord[] }[]
}
