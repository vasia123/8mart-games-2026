export type GameStatus = 'idle' | 'playing' | 'won'

export interface HintConfig {
  gameId: number
  title: string
  hintText: string
  code?: string
}

export interface GameMeta {
  id: number
  title: string
  subtitle: string
  emoji: string
}
