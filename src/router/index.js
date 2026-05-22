import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ContextoView from '../views/ContextoView.vue'
import ExitoView from '../views/ExitoView.vue'
import HistorialView from '../views/HistorialView.vue'
import PerfilView from '../views/PerfilView.vue'
import CentralView from '../views/CentralView.vue'
import PoliciaView from '../views/PoliciaView.vue'

const routes = [
  { path: '/', redirect: '/victim' },
  { path: '/historial', redirect: '/victim/historial' },
  { path: '/perfil', redirect: '/victim/perfil' },
  { path: '/contexto', redirect: '/victim/contexto' },
  { path: '/exito', redirect: '/victim/exito' },
  { path: '/victim', name: 'home', component: HomeView },
  { path: '/victim/contexto', name: 'contexto', component: ContextoView },
  { path: '/victim/exito', name: 'exito', component: ExitoView },
  { path: '/victim/historial', name: 'historial', component: HistorialView },
  { path: '/victim/perfil', name: 'perfil', component: PerfilView },
  { path: '/central', name: 'central', component: CentralView },
  { path: '/policia', name: 'policia', component: PoliciaView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
