<script setup lang="ts">
defineProps<{
  step: number
  title: string
  subtitle?: string
  emoji?: string
}>()
</script>

<template>
  <div class="game-header">
    <div class="game-header__step">Этап {{ step }} из 6</div>
    <h1 class="game-header__title">
      <span v-if="emoji" class="game-header__emoji">{{ emoji }}</span>
      {{ title }}
    </h1>
    <p v-if="subtitle" class="game-header__subtitle">{{ subtitle }}</p>
  </div>
</template>

<style scoped>
.game-header {
  animation: fadeIn 0.4s ease-out;
}

.game-header__step {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.game-header__title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
}

.game-header__emoji {
  margin-right: 4px;
}

.game-header__subtitle {
  font-size: 13px;
  color: var(--text-light);
  margin-top: 2px;
}
</style>
