const STORAGE_KEY = '8mart-progress'

/** Returns the highest unlocked game id (1-based). Game 1 is always unlocked. */
export function getUnlockedGame(): number {
  const val = localStorage.getItem(STORAGE_KEY)
  return val ? Math.max(1, Number(val)) : 1
}

/** Unlock the next game (call after correct code entry). */
export function unlockGame(gameId: number) {
  const current = getUnlockedGame()
  if (gameId > current) {
    localStorage.setItem(STORAGE_KEY, String(gameId))
  }
}

/** Check if a specific game is accessible. */
export function isGameUnlocked(gameId: number): boolean {
  return gameId <= getUnlockedGame()
}

/** Check if all games are completed (final page accessible). */
export function isQuestComplete(): boolean {
  return getUnlockedGame() > 6
}

/** Mark quest as complete (after last game). */
export function completeQuest() {
  localStorage.setItem(STORAGE_KEY, '7')
}
