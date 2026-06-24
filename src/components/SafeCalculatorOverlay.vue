<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const display = ref('')
const esOperador = ref(false)

watch(() => props.modelValue, val => {
  if (!val) {
    display.value = ''
    esOperador.value = false
  }
})

function close() {
  emit('update:modelValue', false)
  display.value = ''
  esOperador.value = false
}

function limpiar() {
  display.value = ''
  esOperador.value = false
}

function borrar() {
  display.value = display.value.slice(0, -1)
  esOperador.value = false
}

function toggleSigno() {
  if (!display.value) return
  if (display.value.startsWith('-')) {
    display.value = display.value.slice(1)
  } else {
    display.value = '-' + display.value
  }
}

function porcentaje() {
  if (!display.value) return
  const num = parseFloat(display.value)
  if (!isNaN(num)) {
    display.value = String(num / 100)
  }
}

function press(key) {
  if (key === 'AC') {
    limpiar()
    return
  }
  if (key === '⌫') {
    borrar()
    return
  }
  if (key === '+/-') {
    toggleSigno()
    return
  }
  if (key === '%') {
    porcentaje()
    return
  }
  if (key === '=') {
    const raw = display.value.replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '')
    if (!/^[0-9+\-*/. ]+$/.test(raw)) return
    try {
      const result = Function(`"use strict"; return (${raw})`)()
      display.value = formatearNumero(String(result))
    } catch {}
    esOperador.value = false
    return
  }

  if (['+', '-', '×', '÷'].includes(key)) {
    if (esOperador.value) {
      display.value = display.value.slice(0, -1) + key
    } else {
      display.value = (display.value + key).slice(-20)
    }
    esOperador.value = true
    return
  }

  esOperador.value = false
  display.value = (display.value + key).slice(-15)

  if (display.value === '133') {
    setTimeout(() => close(), 200)
  }
}

function formatearNumero(num) {
  if (num === 'Infinity' || num === '-Infinity' || num === 'NaN') return 'Error'
  const parts = num.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

onUnmounted(() => {
  display.value = ''
  sessionStorage.clear()
})
</script>

<template>
  <div v-if="modelValue" class="calc-overlay">
    <div class="calc-body">
      <div class="calc-display">{{ formatearNumero(display) || '0' }}</div>

      <div class="calc-keypad">
        <button class="key key-func" @click="press('AC')">AC</button>
        <button class="key key-func" @click="press('+/-')">+/−</button>
        <button class="key key-func" @click="press('%')">%</button>
        <button class="key key-op" @click="press('÷')">÷</button>

        <button class="key key-num" @click="press('7')">7</button>
        <button class="key key-num" @click="press('8')">8</button>
        <button class="key key-num" @click="press('9')">9</button>
        <button class="key key-op" @click="press('×')">×</button>

        <button class="key key-num" @click="press('4')">4</button>
        <button class="key key-num" @click="press('5')">5</button>
        <button class="key key-num" @click="press('6')">6</button>
        <button class="key key-op" @click="press('-')">−</button>

        <button class="key key-num" @click="press('1')">1</button>
        <button class="key key-num" @click="press('2')">2</button>
        <button class="key key-num" @click="press('3')">3</button>
        <button class="key key-op" @click="press('+')">+</button>

        <button class="key key-num key-0" @click="press('0')">0</button>
        <button class="key key-num" @click="press('.')">.</button>
        <button class="key key-op" @click="press('=')">=</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calc-overlay {
  position: absolute;
  inset: 0;
  background: #000;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 36px;
  overflow: hidden;
}

.calc-body {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
}

.calc-display {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 0 20px 16px;
  font-size: 64px;
  font-weight: 300;
  color: #fff;
  min-height: 80px;
  word-break: break-all;
  line-height: 1.1;
}

.calc-keypad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding-bottom: 8px;
}

.key {
  aspect-ratio: 1;
  border: none;
  border-radius: 50%;
  font-size: 22px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.1s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.key:active {
  filter: brightness(1.4);
}

.key-num {
  background: #333;
  color: #fff;
}

.key-func {
  background: #a5a5a5;
  color: #000;
  font-size: 18px;
}

.key-op {
  background: #ff9f0a;
  color: #fff;
  font-size: 28px;
  font-weight: 400;
}

.key-0 {
  grid-column: span 2;
  border-radius: 999px;
  aspect-ratio: auto;
  height: 100%;
  justify-content: flex-start;
  padding-left: 26px;
}
</style>
