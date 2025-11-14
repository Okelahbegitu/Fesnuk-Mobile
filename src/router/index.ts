import TabsPage from '@/views/TabsPage.vue';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/login'  // buka / langsung ke login
  },
  {
    path: '/tabs',
    component: TabsPage,
    children: [
      {
        path: '', // default tab (optional)
        redirect: 'login'
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
