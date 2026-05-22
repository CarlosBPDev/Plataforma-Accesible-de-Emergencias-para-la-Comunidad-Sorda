<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { path: '/victim', name: 'Inicio', icon: 'home' },
  { path: '/victim/historial', name: 'Historial', icon: 'historial' },
  { path: '/victim/perfil', name: 'Perfil', icon: 'perfil' },
]

const isVictim = computed(() => route.path.startsWith('/victim'))
const isCentral = computed(() => route.path.startsWith('/central'))
const shellClass = computed(() => (isCentral.value ? 'full' : 'mobile'))

function icono(tipo) {
  if (tipo === 'home') {
    return 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10'
  }
  if (tipo === 'historial') {
    return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z M12 6v6l4 2'
  }
  return 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z M2 22v-2c0-2.21 3.58-4 8-4s8 1.79 8 4v2'
}
</script>

<template>
  <div class="app-shell" :class="shellClass">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <nav v-if="isVictim" class="bottom-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: route.path === item.path }"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path :d="icono(item.icon)" />
        </svg>
        <span>{{ item.name }}</span>
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0 12px;
  background: var(--surface);
  border-top: 2px solid var(--border);
  z-index: 100;
}

.app-shell.mobile {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.app-shell.full {
  max-width: none;
  margin: 0;
  min-height: 100vh;
  background: transparent;
  box-shadow: none;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: var(--on-surface-muted);
  font-size: 11px;
  font-weight: 700;
  transition: color 0.2s ease;
  padding: 4px 16px;
}

.nav-item svg {
  width: 24px;
  height: 24px;
}

.nav-item.active {
  color: var(--primary);
}
</style>
