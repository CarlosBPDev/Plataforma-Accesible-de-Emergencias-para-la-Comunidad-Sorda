import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ContextoView from '../views/ContextoView.vue'
import ExitoView from '../views/ExitoView.vue'
import HistorialView from '../views/HistorialView.vue'
import PerfilView from '../views/PerfilView.vue'
import CentralView from '../views/CentralView.vue'
import PoliciaView from '../views/PoliciaView.vue'
import VideollamadaView from '../views/VideollamadaView.vue'
import LoginView from '../views/LoginView.vue'
import TriageView from '../views/TriageView.vue'

const routes = [
  { path: '/', redirect: '/victim' },
  { path: '/historial', redirect: '/victim/historial' },
  { path: '/perfil', redirect: '/victim/perfil' },
  { path: '/contexto', redirect: '/victim/contexto' },
  { path: '/exito', redirect: '/victim/exito' },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/victim', name: 'home', component: HomeView },
  { path: '/victim/contexto', name: 'contexto', component: ContextoView },
  { path: '/victim/exito', name: 'exito', component: ExitoView },
  { path: '/victim/historial', name: 'historial', component: HistorialView },
  { path: '/victim/perfil', name: 'perfil', component: PerfilView },
  { path: '/triage', name: 'triage', component: TriageView },
  { path: '/central', name: 'central', component: CentralView },
  { path: '/policia', name: 'policia', component: PoliciaView },
  { path: '/videollamada', name: 'videollamada', component: VideollamadaView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const perfilExiste = localStorage.getItem('perfil')

  if (to.name !== 'login' && to.name !== 'central' && to.name !== 'policia' && to.name !== 'videollamada') {
    if (!perfilExiste) {
      return next({ name: 'login' })
    }
  }

  if (to.name === 'login' && perfilExiste) {
    return next({ name: 'home' })
  }

  next()
})

export default router
