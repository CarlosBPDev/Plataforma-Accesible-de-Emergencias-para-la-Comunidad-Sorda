<script setup>
import { reactive } from 'vue'

// Objeto reactivo con los 4 campos del perfil del usuario
const perfil = reactive({
  rut: '',
  nombre: '',
  telefono: '',
  contacto: '', // contacto de emergencia
})

function guardar() {
  localStorage.setItem('perfil', JSON.stringify(perfil))
}
</script>

<template>
  <div class="page perfil">
    <header class="perfil-header">
      <router-link to="/" class="back-btn" aria-label="Volver al inicio">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </router-link>
      <h1>Perfil</h1>
    </header>

    <p class="perfil-desc">Tus datos personales se usarán al enviar una alerta.</p>

    <form class="perfil-form" @submit.prevent="guardar">
      <label class="form-group">
        <span class="form-label">RUT</span>
        <input
          name="rut"
          v-model="perfil.rut"
          type="text"
          inputmode="numeric"
          placeholder="12.345.678-9"
          autocomplete="off"
        />
      </label>

      <label class="form-group">
        <span class="form-label">Nombre completo</span>
        <input
          name="nombre"
          v-model="perfil.nombre"
          type="text"
          placeholder="Ej: María Pérez"
          autocomplete="name"
        />
      </label>

      <label class="form-group">
        <span class="form-label">Teléfono</span>
        <input
          name="telefono"
          v-model="perfil.telefono"
          type="tel"
          inputmode="numeric"
          placeholder="+56 9 1234 5678"
          autocomplete="tel"
        />
      </label>

      <label class="form-group">
        <span class="form-label">Contacto de emergencia</span>
        <input
          name="contacto"
          v-model="perfil.contacto"
          type="text"
          placeholder="Nombre y teléfono de un familiar"
          autocomplete="off"
        />
      </label>

      <button type="submit" class="save-btn">Guardar datos</button>
    </form>
  </div>
</template>

<style scoped>
.perfil-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--on-surface);
  cursor: pointer;
  text-decoration: none;
}

.back-btn svg {
  width: 22px;
  height: 22px;
}

.perfil-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
}

.perfil-desc {
  margin-bottom: 24px;
  color: var(--on-surface-muted);
  font-size: 15px;
}

.perfil-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--on-surface);
}

.form-group input {
  padding: 14px;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  font-size: 16px;
  font-family: inherit;
  color: var(--on-surface);
  background: var(--surface);
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary);
}

.save-btn {
  width: 100%;
  padding: 16px;
  margin-top: 8px;
  border: none;
  border-radius: var(--radius);
  background: var(--primary);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.save-btn:active {
  transform: scale(0.97);
}
</style>
