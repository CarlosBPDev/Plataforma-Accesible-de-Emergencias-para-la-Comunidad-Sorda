import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ContextoView from '../views/ContextoView.vue'
import ExitoView from '../views/ExitoView.vue'
import HistorialView from '../views/HistorialView.vue'
import PerfilView from '../views/PerfilView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/contexto', name: 'contexto', component: ContextoView },
  { path: '/exito', name: 'exito', component: ExitoView },
  { path: '/historial', name: 'historial', component: HistorialView },
  { path: '/perfil', name: 'perfil', component: PerfilView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
