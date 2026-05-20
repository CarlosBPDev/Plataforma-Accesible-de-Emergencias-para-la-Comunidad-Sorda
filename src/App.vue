<script setup>
// App.vue actúa como contenedor principal:
// envuelve <router-view> en una transición fade para cambios suaves entre rutas
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
