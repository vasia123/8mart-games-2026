import type { AxialCoord } from '../../types/hex'

export interface PipeLevelCell {
  coord: AxialCoord
  /** Which of the 6 hex directions this pipe connects to (before rotation) */
  connections: boolean[]
  /** Initial rotation (0-5, each step = 60°) */
  initialRotation: number
  /** Target rotation for solved state */
  solvedRotation: number
  isSource: boolean
  isTarget: boolean
}

export interface PipeLevel {
  cells: PipeLevelCell[]
}

// A small hex pipe puzzle: connect source to 3 targets
// Using a hex grid with radius ~2
export const pipeLevel: PipeLevel = {
  cells: [
    // Source at center
    {
      coord: { q: 0, r: 0 },
      connections: [true, false, false, true, false, false], // E and W - straight
      initialRotation: 1, // rotated 60° from solved
      solvedRotation: 0,
      isSource: true,
      isTarget: false,
    },
    // Ring 1
    {
      coord: { q: 1, r: 0 }, // E
      connections: [true, false, false, true, false, false], // straight E-W
      initialRotation: 2,
      solvedRotation: 0,
      isSource: false,
      isTarget: false,
    },
    {
      coord: { q: -1, r: 0 }, // W
      connections: [true, false, false, false, true, false], // E and SW - bend
      initialRotation: 3,
      solvedRotation: 0,
      isSource: false,
      isTarget: false,
    },
    {
      coord: { q: 0, r: -1 }, // NW of center
      connections: [false, false, false, false, false, true], // SE only - endpoint
      initialRotation: 2,
      solvedRotation: 0,
      isSource: false,
      isTarget: true,
    },
    {
      coord: { q: 2, r: 0 }, // far E
      connections: [false, false, false, true, false, false], // W only - endpoint
      initialRotation: 4,
      solvedRotation: 0,
      isSource: false,
      isTarget: true,
    },
    {
      coord: { q: -1, r: 1 }, // SW
      connections: [false, true, false, false, false, false], // NE only - endpoint
      initialRotation: 3,
      solvedRotation: 0,
      isSource: false,
      isTarget: true,
    },
    // Connector between W and NW
    {
      coord: { q: 0, r: -1 }, // already defined above, skip
      connections: [false, false, false, false, false, true],
      initialRotation: 2,
      solvedRotation: 0,
      isSource: false,
      isTarget: true,
    },
    // Additional connectors
    {
      coord: { q: -1, r: 1 }, // SW connector
      connections: [false, true, false, false, false, false],
      initialRotation: 1,
      solvedRotation: 0,
      isSource: false,
      isTarget: false,
    },
  ].filter((cell, index, arr) =>
    // Deduplicate by coord
    arr.findIndex(c => c.coord.q === cell.coord.q && c.coord.r === cell.coord.r) === index
  ),
}
