import type { AxialCoord } from '../../types/hex'

// 5x5 grid with pre-designed thresholds
// The solution: tap all 4 corners + 1 interior cell (e.g. center) = 5 taps
//
// Key insight for the player:
//   Corners have threshold 3 but only 2 neighbors → they can NEVER bloom
//   from cascade alone (max pollen from neighbors = 2 < 3).
//   So all 4 corners MUST be tapped directly.
//   Then one interior tap triggers a chain reaction through the rest.
//
// Verified solutions: 4 corners + any of (1,1),(1,3),(3,1),(3,3),(2,2),(2,0),(0,2),(2,4),(4,2)
export interface BloomLevelCell {
  coord: AxialCoord
  threshold: number // pollen needed to bloom
}

export interface BloomLevel {
  cells: BloomLevelCell[]
  maxTaps: number
}

function makeGrid(): BloomLevelCell[] {
  const cells: BloomLevelCell[] = []
  // Corners = 3 (unreachable by cascade, forced taps)
  // Inner cross (1,2),(2,1),(2,3),(3,2) = 1 (easy cascade)
  // Center and diagonals = 2 (need 2 pollen sources)
  // Edges = 2 (need corner pollen + interior cascade)
  const thresholds = [
    [3, 2, 2, 2, 3],
    [2, 2, 1, 2, 2],
    [2, 1, 2, 1, 2],
    [2, 2, 1, 2, 2],
    [3, 2, 2, 2, 3],
  ]

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      cells.push({
        coord: { q: col, r: row },
        threshold: thresholds[row]![col]!,
      })
    }
  }
  return cells
}

export const bloomLevel: BloomLevel = {
  cells: makeGrid(),
  maxTaps: 5,
}
