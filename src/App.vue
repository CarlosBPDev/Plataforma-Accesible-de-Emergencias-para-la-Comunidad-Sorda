<script setup>
// App.vue actúa como contenedor principal:
// envuelve <router-view> en una transición fade para cambios suaves entre rutas
</script>

<template>
  <transition name="fade" mode="out-in">
    <router-view />
  </transition>
</template>
