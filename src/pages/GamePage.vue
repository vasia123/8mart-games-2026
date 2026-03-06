<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isGameUnlocked } from '../composables/useProgress'

const route = useRoute()
const router = useRouter()
const gameId = computed(() => Number(route.params.id))

const gameComponents: Record<number, ReturnType<typeof defineAsyncComponent>> = {
  1: defineAsyncComponent(() => import('../components/game1/BloomChainGame.vue')),
  2: defineAsyncComponent(() => import('../components/game2/CrossyRoadGame.vue')),
  3: defineAsyncComponent(() => import('../components/game3/PipePuzzleGame.vue')),
  4: defineAsyncComponent(() => import('../components/game4/HexMinesweeperGame.vue')),
  5: defineAsyncComponent(() => import('../components/game5/Merge2048Game.vue')),
  6: defineAsyncComponent(() => import('../components/game6/FlappyBeeGame.vue')),
}

const currentGame = computed(() => gameComponents[gameId.value])
const locked = computed(() => !isGameUnlocked(gameId.value))

function goBack() {
  router.push('/')
}
</script>

<template>
  <div v-if="locked" class="locked-screen">
    <p class="locked-emoji">🔒</p>
    <p class="locked-text">Сначала пройди предыдущие игры!</p>
    <button class="locked-btn" @click="goBack">На главную</button>
  </div>
  <component
    v-else-if="currentGame"
    :is="currentGame"
    :key="gameId"
    :game-id="gameId"
  />
  <div v-else style="padding: 40px; text-align: center;">
    Игра не найдена 🤔
  </div>
</template>

<style scoped>
.locked-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 40px;
  text-align: center;
}

.locked-emoji {
  font-size: 48px;
  margin-bottom: 16px;
}

.locked-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 24px;
}

.locked-btn {
  background: linear-gradient(135deg, var(--pink), var(--lavender));
  color: white;
  font-size: 15px;
  font-weight: 700;
  padding: 12px 28px;
  border-radius: 50px;
}
</style>
