import type { AxialCoord, CubeCoord, PixelCoord, HexDirection } from '../types/hex'

// Six axial direction vectors (flat-top hex): E, NE, NW, W, SW, SE
const AXIAL_DIRECTIONS: AxialCoord[] = [
  { q: 1, r: 0 },   // 0: E
  { q: 1, r: -1 },  // 1: NE
  { q: 0, r: -1 },  // 2: NW
  { q: -1, r: 0 },  // 3: W
  { q: -1, r: 1 },  // 4: SW
  { q: 0, r: 1 },   // 5: SE
]

export function useHexGrid(hexSize: number = 30) {
  function axialToPixel(coord: AxialCoord): PixelCoord {
    const x = hexSize * (3 / 2 * coord.q)
    const y = hexSize * (Math.sqrt(3) / 2 * coord.q + Math.sqrt(3) * coord.r)
    return { x, y }
  }

  function pixelToAxial(px: number, py: number): AxialCoord {
    const q = (2 / 3 * px) / hexSize
    const r = (-1 / 3 * px + Math.sqrt(3) / 3 * py) / hexSize
    return axialRound(q, r)
  }

  function axialRound(q: number, r: number): AxialCoord {
    const s = -q - r
    let rq = Math.round(q)
    let rr = Math.round(r)
    const rs = Math.round(s)
    const dq = Math.abs(rq - q)
    const dr = Math.abs(rr - r)
    const ds = Math.abs(rs - s)
    if (dq > dr && dq > ds) {
      rq = -rr - rs
    } else if (dr > ds) {
      rr = -rq - rs
    }
    return { q: rq, r: rr }
  }

  function axialToCube(coord: AxialCoord): CubeCoord {
    return { q: coord.q, r: coord.r, s: -coord.q - coord.r }
  }

  function cubeDistance(a: CubeCoord, b: CubeCoord): number {
    return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.s - b.s))
  }

  function axialDistance(a: AxialCoord, b: AxialCoord): number {
    return cubeDistance(axialToCube(a), axialToCube(b))
  }

  function neighbors(coord: AxialCoord): AxialCoord[] {
    return AXIAL_DIRECTIONS.map(d => ({
      q: coord.q + d.q,
      r: coord.r + d.r,
    }))
  }

  function neighbor(coord: AxialCoord, dir: HexDirection): AxialCoord {
    const d = AXIAL_DIRECTIONS[dir]!
    return { q: coord.q + d.q, r: coord.r + d.r }
  }

  function hexCorners(cx: number, cy: number): string {
    const corners: string[] = []
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i)
      const x = cx + hexSize * Math.cos(angle)
      const y = cy + hexSize * Math.sin(angle)
      corners.push(`${x},${y}`)
    }
    return corners.join(' ')
  }

  /** Generate all axial coords within radius (hex disk) */
  function hexDisk(radius: number): AxialCoord[] {
    const coords: AxialCoord[] = []
    for (let q = -radius; q <= radius; q++) {
      for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
        coords.push({ q, r })
      }
    }
    return coords
  }

  /** Generate rectangular hex grid */
  function hexRect(cols: number, rows: number): AxialCoord[] {
    const coords: AxialCoord[] = []
    for (let r = 0; r < rows; r++) {
      const offset = Math.floor(r / 2)
      for (let q = -offset; q < cols - offset; q++) {
        coords.push({ q, r })
      }
    }
    return coords
  }

  function coordKey(coord: AxialCoord): string {
    return `${coord.q},${coord.r}`
  }

  function parseKey(key: string): AxialCoord {
    const parts = key.split(',').map(Number)
    return { q: parts[0]!, r: parts[1]! }
  }

  function oppositeDir(dir: HexDirection): HexDirection {
    return ((dir + 3) % 6) as HexDirection
  }

  /** Get direction index from one hex to its neighbor */
  function getDirection(from: AxialCoord, to: AxialCoord): HexDirection | null {
    const dq = to.q - from.q
    const dr = to.r - from.r
    const idx = AXIAL_DIRECTIONS.findIndex(d => d.q === dq && d.r === dr)
    return idx >= 0 ? idx as HexDirection : null
  }

  return {
    hexSize,
    axialToPixel,
    pixelToAxial,
    axialRound,
    axialToCube,
    cubeDistance,
    axialDistance,
    neighbors,
    neighbor,
    hexCorners,
    hexDisk,
    hexRect,
    coordKey,
    parseKey,
    oppositeDir,
    getDirection,
    AXIAL_DIRECTIONS,
  }
}
