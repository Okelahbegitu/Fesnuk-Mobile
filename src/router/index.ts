import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/login'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs'
      },
      {
        path: 'login',
        component: () => import('@/views/login.vue')
      },
      {
        path: 'signup',
        component: () => import('@/views/signup.vue')
      },
      {
        path: 'home/:id_user',
        component: () => import('@/views/home.vue')
      },
      {
        path: 'add/:id_user',
        component: () => import('@/views/add.vue')
      },
      {
        path: 'edit/:id_user/:id_post',
        component: () => import('@/views/edit.vue')
      },
      {
        path: 'delete/:id_user/:id_post',
        component: () => import('@/views/delete.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
