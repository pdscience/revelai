import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import AppPage from '../views/AppPage.vue'
import GuestPage from '../views/GuestPage.vue'

const routes = [
  { path: '/', name: 'landing', component: LandingPage },
  {
    path: '/app',
    name: 'app',
    component: AppPage,
    beforeEnter: (to) => {
      if (to.query.join) {
        return { path: '/guest', query: { join: to.query.join } }
      }
      const stored = sessionStorage.getItem('revelai_access')
      if (!stored && !to.query.access) {
        return { path: '/' }
      }
      if (to.query.access) {
        sessionStorage.setItem('revelai_access', to.query.access)
        window.history.replaceState({}, '', to.path)
      }
    }
  },
  {
    path: '/guest',
    name: 'guest',
    component: GuestPage,
    beforeEnter: (to) => {
      if (!to.query.join) {
        return { path: '/' }
      }
    }
  },
  {
    path: '/payment-success',
    name: 'payment-success',
    component: () => import('../views/PaymentSuccess.vue'),
  },
  {
    path: '/privacidade',
    name: 'privacy',
    component: () => import('../views/PrivacyPolicy.vue'),
  },
  {
    path: '/termos',
    name: 'terms',
    component: () => import('../views/TermsOfUse.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
