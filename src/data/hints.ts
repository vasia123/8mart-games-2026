import type { HintConfig, GameMeta } from '../types/common'

export const gameMeta: GameMeta[] = [
  { id: 1, title: 'Каскадное цветение', subtitle: 'Bloom Chain', emoji: '🌸' },
  { id: 2, title: 'Цветочный переход', subtitle: 'Crossy Road', emoji: '🦋' },
  { id: 3, title: 'Полей цветы', subtitle: 'Hex Pipe Puzzle', emoji: '💧' },
  { id: 4, title: 'Пчелиный сапёр', subtitle: 'Hex Minesweeper', emoji: '🐝' },
  { id: 5, title: 'Цветочный 2048', subtitle: 'Flower 2048', emoji: '🌷' },
  { id: 6, title: 'Пчела в полёте', subtitle: 'Flappy Bee', emoji: '🐝' },
]

// ← Отредактируйте подсказки и коды под ваш офис!
export const hints: HintConfig[] = [
  { gameId: 1, title: 'Каскадное цветение', hintText: 'Код знает самый высокий 🦒', code: 'весна' },
  { gameId: 2, title: 'Цветочный переход', hintText: 'Код у того, у кого самые красивые наушники 🎧', code: 'подснежник' },
  { gameId: 3, title: 'Полей цветы', hintText: 'Код знает самый большой любитель настолок 🎲', code: 'лучик' },
  { gameId: 4, title: 'Пчелиный сапёр', hintText: 'Код у самого бородатого 🧔', code: 'шмель' },
  { gameId: 5, title: 'Цветочный 2048', hintText: 'Код знает самый улыбчивый 😊', code: 'подарок' },
  { gameId: 6, title: 'Пчела в полёте', hintText: 'Поздравляем! Вы прошли весь квест! 🎉🌸' },
]

export function getHint(gameId: number): HintConfig | undefined {
  return hints.find(h => h.gameId === gameId)
}

export function getGameMeta(gameId: number): GameMeta | undefined {
  return gameMeta.find(g => g.id === gameId)
}
