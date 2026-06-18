import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/leave-approval',
      name: 'LeaveApproval',
      component: () => import('../views/LeaveApproval.vue')
    },
    {
      path: '/leave-apply',
      name: 'LeaveApply',
      component: () => import('../views/LeaveApply.vue')
    }
  ]
})

export default router
