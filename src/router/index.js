import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
	{
	  path: '/login',
	  component: () => import('@/views/login.vue'),
	  hidden: true
	},
	{
	  path: '/home',
	  component: () => import('@/views/index.vue'),
	  hidden: true
	},
	{
	  path: '/team',
	  component: () => import('@/views/teamSpace.vue'),
	  hidden: true
	}
  ],
})

export default router
