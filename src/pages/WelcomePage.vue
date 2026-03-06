<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function start() {
  router.push('/game/1')
}
</script>

<template>
  <div class="welcome">
    <div class="welcome__content">
      <div class="welcome__flowers">🌷🌸🌺</div>
      <h1 class="welcome__title">Квест<br/>8 Марта</h1>
      <p class="welcome__desc">
        6 мини-игр, спрятанных по офису.<br/>
        Сканируй QR-коды, проходи игры,<br/>
        получай подсказки к следующему этапу!
      </p>
      <div class="welcome__rules">
        <div class="welcome__rule">📱 Сканируй QR-код</div>
        <div class="welcome__rule">🎮 Пройди мини-игру</div>
        <div class="welcome__rule">🔍 Получи подсказку</div>
        <div class="welcome__rule">🎁 Найди финальный приз!</div>
      </div>
      <button class="welcome__btn" @click="start">
        Начать квест
      </button>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, var(--cream) 0%, var(--pink) 50%, var(--lavender) 100%);
  padding: 24px;
}

.welcome__content {
  text-align: center;
  animation: fadeIn 0.6s ease-out;
}

.welcome__flowers {
  font-size: 48px;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

.welcome__title {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.1;
  margin-bottom: 16px;
}

.welcome__desc {
  font-size: 15px;
  color: var(--text);
  line-height: 1.5;
  margin-bottom: 24px;
  opacity: 0.85;
}

.welcome__rules {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 32px;
}

.welcome__rule {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
}

.welcome__btn {
  background: white;
  color: var(--text);
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  padding: 16px 40px;
  border-radius: 50px;
  box-shadow: 0 4px 20px var(--shadow);
  transition: transform 0.2s;
}

.welcome__btn:active {
  transform: scale(0.95);
}
</style>
