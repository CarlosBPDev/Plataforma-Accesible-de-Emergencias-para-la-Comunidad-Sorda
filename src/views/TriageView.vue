<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAlertStore } from '../stores/alertStore'
import { emergencias } from '../data/emergencias'
import TriageCard from '../components/TriageCard.vue'
import SafeCalculatorOverlay from '../components/SafeCalculatorOverlay.vue'

const router = useRouter()
const alertStore = useAlertStore()
const mostrarCalculadora = ref(false)
const menuAbierto = ref(false)

function seleccionarEmergencia(id) {
  const emergencia = emergencias.find(e => e.id === id)
  if (emergencia) {
    alertStore.setEmergencia(emergencia)
    router.push({ name: 'contexto' })
  }
}

function irAHistorial() {
  router.push({ name: 'historial' })
}
</script>

<template>
  <div class="mobile-phone-frame page triage">
    <div class="home-bg-shape"></div>

    <header class="home-header">
      <div class="header-content">
        <img
          class="escudo"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Roundel_of_Carabineros_de_Chile.svg/250px-Roundel_of_Carabineros_de_Chile.svg.png"
          alt="Carabineros"
        />
        <div class="header-text">
          <span class="brand-tag">Carabineros de Chile</span>
          <h1 class="brand-title">EMERGENCIA</h1>
        </div>
      </div>

      <button class="menu-btn" @click="menuAbierto = true" aria-label="Menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </header>

    <div class="sidebar-overlay" :class="{ open: menuAbierto }" @click="menuAbierto = false">
      <nav class="sidebar-menu" @click.stop>
        <button class="sidebar-close" @click="menuAbierto = false" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div class="sidebar-item" @click="router.push('/victim/perfil'); menuAbierto = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>PERFIL</span>
        </div>

        <div class="sidebar-item" @click="irAHistorial(); menuAbierto = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>HISTORIAL</span>
        </div>

        <div class="sidebar-item danger" @click="mostrarCalculadora = true; menuAbierto = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>OCULTAR</span>
        </div>
      </nav>
    </div>

    <main class="triage-main">
      <div class="triage-label">EXPLICAR</div>
      <div class="triage-grid">
        <TriageCard
          v-for="em in emergencias"
          :key="em.id"
          v-bind="em"
          @select="seleccionarEmergencia"
        />
      </div>
    </main>

    <footer class="home-footer">
      <div class="gps-badge" :class="{ active: alertStore.ubicacion }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span>{{ alertStore.ubicacionNombre || alertStore.ubicacion || '...' }}</span>
      </div>

      <button class="ocultar-btn" @click="mostrarCalculadora = true" aria-label="Modo camuflaje">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span>OCULTAR</span>
      </button>
    </footer>

    <SafeCalculatorOverlay v-model="mostrarCalculadora" />
  </div>
</template>

<style scoped>
.mobile-phone-frame {
  width: 100%;
  max-width: 450px;
  height: 100vh;
  max-height: 850px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #0a4a2e 0%, #006F3E 50%, #0a5a35 100%);
  border: 4px solid #1a1a2e;
  border-radius: 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.home-bg-shape {
  position: absolute;
  top: -150px;
  right: -100px;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.home-header {
  position: relative;
  z-index: 2;
  padding: 20px 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.escudo {
  height: 44px;
  width: auto;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
}

.header-text {
  display: flex;
  flex-direction: column;
}

.brand-tag {
  font-size: 9px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.brand-title {
  margin: 2px 0 0;
  font-size: 22px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 1px;
  text-shadow: 0 2px 12px rgba(0,0,0,0.2);
}

.menu-btn {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  backdrop-filter: blur(8px);
}

.menu-btn:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.92);
}

.menu-btn svg {
  width: 22px;
  height: 22px;
}

.sidebar-overlay {
  position: absolute;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.sidebar-overlay.open {
  opacity: 1;
  pointer-events: auto;
}

.sidebar-menu {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 220px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16162a 100%);
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
  gap: 8px;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-overlay.open .sidebar-menu {
  transform: translateX(0);
}

.sidebar-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: flex-end;
  margin-bottom: 24px;
  padding: 0;
}

.sidebar-close svg {
  width: 18px;
  height: 18px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
}

.sidebar-item:active {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-item svg {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  opacity: 0.8;
}

.sidebar-item.danger {
  margin-top: auto;
  background: rgba(220, 38, 38, 0.12);
  border-color: rgba(220, 38, 38, 0.2);
  color: #fca5a5;
}

.triage-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 20px;
  position: relative;
  z-index: 2;
  overflow-y: auto;
}

.triage-label {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.triage-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 320px;
}

.home-footer {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 0 24px 40px;
}

.gps-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  color: #f59e0b;
  transition: all 0.4s ease;
}

.gps-badge.active {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.1);
}

.gps-badge svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.gps-badge span {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.ocultar-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.ocultar-btn:active {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(0.96);
  color: #fff;
}

.ocultar-btn svg {
  width: 20px;
  height: 20px;
}
</style>