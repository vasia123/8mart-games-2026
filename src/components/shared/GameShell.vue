<script setup lang="ts">
defineProps<{
  noPadding?: boolean
}>()
</script>

<template>
  <div class="game-shell">
    <header class="game-shell__header">
      <slot name="header" />
    </header>
    <main class="game-shell__body" :class="{ 'no-padding': noPadding }">
      <slot />
    </main>
    <footer class="game-shell__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.game-shell {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
  background: var(--cream);
}

.game-shell__header {
  flex-shrink: 0;
  padding: 12px 16px;
  text-align: center;
}

.game-shell__body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  touch-action: none;
}

.game-shell__body.no-padding {
  padding: 0;
}

.game-shell__footer {
  flex-shrink: 0;
  padding: 8px 16px 16px;
  text-align: center;
}
</style>
