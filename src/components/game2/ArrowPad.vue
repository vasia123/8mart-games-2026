<script setup lang="ts">
const emit = defineEmits<{
  move: [dir: 'up' | 'down' | 'left' | 'right']
}>()
</script>

<template>
  <div class="arrow-pad">
    <button class="arrow-btn up" @click="emit('move', 'up')">▲</button>
    <div class="arrow-mid">
      <button class="arrow-btn left" @click="emit('move', 'left')">◀</button>
      <div class="arrow-spacer" />
      <button class="arrow-btn right" @click="emit('move', 'right')">▶</button>
    </div>
    <button class="arrow-btn down" @click="emit('move', 'down')">▼</button>
  </div>
</template>

<style scoped>
.arrow-pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  -webkit-tap-highlight-color: transparent;
}

.arrow-mid {
  display: flex;
  align-items: center;
  gap: 4px;
}

.arrow-spacer {
  width: 56px;
  height: 56px;
}

.arrow-btn {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(200, 180, 248, 0.35);
  color: var(--text);
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
}

.arrow-btn:active {
  background: rgba(200, 180, 248, 0.6);
  transform: scale(0.93);
}
</style>
