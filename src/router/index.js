import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import HomeView from '../views/HomeView.vue'
import { useAuth } from '@/services/useAuth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [


    {
      path: '/',
      component: MainLayout,
      redirect: '/home',
      meta: { requiresAuth: true }, // Ce composant contient la sidebar et la topbar
      children: [
        {
          path: '/home',
          name: 'home',
          component: HomeView,
          },
          {
            path: '/recipe',
            name: 'recipe',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/RecipeView.vue'),
          },
          {
            path: '/reciperequest',
            name: 'recipeRequest',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/RecipeRequestView.vue'),
          },
          {
            path: '/dashboard',
            name: 'Dashboard',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/DashboardView.vue'),
          },{
            path: '/createrecipe',
            name: 'NewRecipe',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/CreateRecipe.vue'),
          },
      ]
    },
    {
      path: '/login',
      name: 'Login',
      meta: { requiresGuest: true },
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/LoginView.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuth();

  const needsAuth = to.meta.requiresAuth;
  const needsGuest = to.meta.requiresGuest;
  if (needsAuth && !isAuthenticated.value) {
    next({ name: 'Login' });
  }
  else if (needsGuest && isAuthenticated.value) {
    next({ name: 'Dashboard' });
  }
  else {
    next();
  }
});

export default router
