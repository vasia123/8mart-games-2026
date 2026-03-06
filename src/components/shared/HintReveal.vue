<script setup lang="ts">
import { ref, computed } from 'vue'
import { unlockGame, completeQuest } from '../../composables/useProgress'

const props = defineProps<{
  hintText: string
  nextGameId?: number
  code?: string
}>()

const revealed = ref(false)
const codeInput = ref('')
const codeError = ref(false)
const codeAccepted = ref(false)

const needsCode = computed(() => !!props.code && !!props.nextGameId)

function reveal() {
  revealed.value = true
}

function checkCode() {
  if (codeInput.value.trim().toLowerCase() === props.code?.toLowerCase()) {
    codeAccepted.value = true
    codeError.value = false
    if (props.nextGameId) {
      unlockGame(props.nextGameId)
    } else {
      completeQuest()
    }
  } else {
    codeError.value = true
    setTimeout(() => { codeError.value = false }, 600)
  }
}

// For last game (no code) — unlock final on reveal
function onRevealNoCode() {
  revealed.value = true
  if (!props.code && !props.nextGameId) {
    completeQuest()
  }
}
</script>

<template>
  <div class="hint-reveal">
    <div
      class="hint-card"
      :class="{ revealed }"
      @click="!revealed && (needsCode ? reveal() : onRevealNoCode())"
    >
      <div v-if="!revealed" class="hint-blur">
        <p class="hint-tap">Нажми, чтобы увидеть подсказку</p>
      </div>
      <div v-else class="hint-content">
        <p class="hint-label">Подсказка:</p>
        <p class="hint-text">{{ hintText }}</p>

        <!-- Code entry -->
        <template v-if="needsCode && !codeAccepted">
          <div class="code-entry">
            <input
              v-model="codeInput"
              class="code-input"
              :class="{ shake: codeError }"
              type="text"
              placeholder="Введи код"
              autocomplete="off"
              @keyup.enter="checkCode"
            />
            <button class="code-btn" @click="checkCode">→</button>
          </div>
        </template>

        <!-- Next game link (no code needed or code accepted) -->
        <template v-if="!needsCode || codeAccepted">
          <router-link
            v-if="nextGameId"
            :to="`/game/${nextGameId}`"
            class="hint-next"
          >
            Следующая игра →
          </router-link>
          <router-link
            v-else
            to="/final"
            class="hint-next"
          >
            К финалу! 🎁
          </router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hint-reveal {
  animation: fadeIn 0.4s ease-out;
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
}

.hint-card {
  background: white;
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: 0 4px 20px var(--shadow);
  cursor: pointer;
  transition: all 0.4s ease;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hint-card.revealed {
  cursor: default;
}

.hint-blur {
  text-align: center;
  filter: blur(0);
  animation: pulse 2s ease-in-out infinite;
}

.hint-tap {
  color: var(--text-light);
  font-size: 14px;
}

.hint-content {
  text-align: center;
  animation: scaleIn 0.3s ease-out;
}

.hint-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.hint-text {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.4;
  margin-bottom: 20px;
}

.code-entry {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.code-input {
  width: 140px;
  padding: 10px 16px;
  border: 2px solid #E0D6F0;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  outline: none;
  transition: border-color 0.2s;
}

.code-input:focus {
  border-color: var(--lavender);
}

.code-input.shake {
  animation: shake 0.4s ease-out;
  border-color: #D9534F;
}

.code-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mint), var(--lavender));
  color: white;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-btn:active {
  transform: scale(0.93);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}

.hint-next {
  display: inline-block;
  background: linear-gradient(135deg, var(--mint), var(--lavender));
  color: white;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 24px;
  border-radius: 50px;
  transition: transform 0.2s;
  animation: scaleIn 0.3s ease-out;
}

.hint-next:active {
  transform: scale(0.95);
}
</style>
