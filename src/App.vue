<template>
  <div class="project-root-container">
    <router-view />
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #0f172a;
}

#app {
  width: 100%;
  height: 100%;
}

.project-root-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
