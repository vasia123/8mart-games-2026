<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visible = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    visible.value = true
  })
})

const emit = defineEmits<{
  continue: []
}>()
</script>

<template>
  <transition name="fade">
    <div v-if="visible" class="victory-overlay" @click="emit('continue')">
      <div class="victory-card">
        <div class="victory-emoji">🎉</div>
        <h2 class="victory-title">Отлично!</h2>
        <p class="victory-text">Игра пройдена!</p>
        <slot />
        <button class="victory-btn" @click.stop="emit('continue')">
          Показать подсказку
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.victory-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(255, 248, 240, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.victory-card {
  text-align: center;
  animation: scaleIn 0.4s ease-out;
  padding: 32px;
}

.victory-emoji {
  font-size: 64px;
  margin-bottom: 16px;
  animation: float 2s ease-in-out infinite;
}

.victory-title {
  font-family: var(--font-display);
  font-size: 32px;
  color: var(--text);
  margin-bottom: 8px;
}

.victory-text {
  font-size: 16px;
  color: var(--text-light);
  margin-bottom: 24px;
}

.victory-btn {
  background: linear-gradient(135deg, var(--pink), var(--lavender));
  color: white;
  font-size: 16px;
  font-weight: 700;
  padding: 14px 32px;
  border-radius: 50px;
  box-shadow: 0 4px 16px var(--shadow);
  transition: transform 0.2s;
}

.victory-btn:active {
  transform: scale(0.95);
}
</style>
