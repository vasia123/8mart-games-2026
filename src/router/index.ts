import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: () => import('../pages/WelcomePage.vue'),
    },
    {
      path: '/game/:id',
      name: 'game',
      component: () => import('../pages/GamePage.vue'),
      props: true,
    },
    {
      path: '/final',
      name: 'final',
      component: () => import('../pages/FinalPage.vue'),
    },
  ],
})

export default router
