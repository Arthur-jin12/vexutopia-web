import { createRouter, createWebHistory } from 'vue-router';

const PayView = () => import('@/views/PayView.vue');
const NotFoundView = () => import('@/views/NotFoundView.vue');

const routes = [
  {
    path: '/pay/:token',
    name: 'pay',
    component: PayView,
    props: true,
  },
  {
    path: '/order/:token',
    name: 'order',
    component: PayView,
    props: true,
  },
  // Anything else — generic Order Not Found, no branding.
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
