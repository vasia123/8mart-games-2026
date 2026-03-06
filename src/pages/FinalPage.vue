<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import confetti from 'canvas-confetti'
import { isQuestComplete } from '../composables/useProgress'

const router = useRouter()

onMounted(() => {
  if (!isQuestComplete()) {
    router.replace('/')
    return
  }
  const duration = 4000
  const end = Date.now() + duration

  function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#F8B4C8', '#C8B4F8', '#B4F8D8', '#FFD700'],
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#F8B4C8', '#C8B4F8', '#B4F8D8', '#FFD700'],
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
})
</script>

<template>
  <div class="final">
    <div class="final__content">
      <div class="final__emoji">🌸</div>
      <h1 class="final__title">С 8 Марта!</h1>
      <p class="final__text">
        Вы прошли все 6 испытаний!<br/>
        Вы — настоящая героиня!
      </p>
      <p class="final__heart">💐🎉✨</p>
      <p class="final__wish">
        Пусть каждый день приносит радость,<br/>
        улыбки и цветы!
      </p>
      <router-link to="/" class="final__link">
        На главную
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.final {
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, var(--lavender) 0%, var(--pink) 50%, var(--mint) 100%);
  padding: 24px;
}

.final__content {
  text-align: center;
  animation: scaleIn 0.6s ease-out;
}

.final__emoji {
  font-size: 72px;
  margin-bottom: 16px;
  animation: float 2.5s ease-in-out infinite;
}

.final__title {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
}

.final__text {
  font-size: 16px;
  color: var(--text);
  line-height: 1.6;
  margin-bottom: 16px;
}

.final__heart {
  font-size: 36px;
  margin-bottom: 16px;
  animation: pulse 2s ease-in-out infinite;
}

.final__wish {
  font-size: 15px;
  color: var(--text);
  opacity: 0.85;
  line-height: 1.6;
  margin-bottom: 32px;
  font-style: italic;
}

.final__link {
  display: inline-block;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  padding: 12px 28px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  color: var(--text);
}
</style>
