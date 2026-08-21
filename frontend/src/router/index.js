import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';

const roleRoutes = {
  '/products': ['Admin', 'Manager', 'Inventory Staff'],
  '/products/create': ['Admin', 'Manager', 'Inventory Staff'],
  '/inventory': ['Admin', 'Manager', 'Inventory Staff'],
  '/inventory/movements': ['Admin', 'Manager', 'Inventory Staff'],
  '/sales/pos': ['Admin', 'Manager', 'Cashier'],
  '/sales': ['Admin', 'Manager', 'Cashier'],
  '/purchases': ['Admin', 'Manager'],
  '/purchases/create': ['Admin', 'Manager'],
  '/customers': ['Admin', 'Manager', 'Cashier'],
  '/suppliers': ['Admin', 'Manager', 'Inventory Staff'],
  '/expenses': ['Admin', 'Manager'],
  '/reports/sales': ['Admin', 'Manager'],
  '/reports/profit': ['Admin', 'Manager'],
  '/reports/inventory': ['Admin', 'Manager'],
  '/settings': ['Admin'],
  '/users': ['Admin'],
};

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: { breadcrumb: 'Dashboard' },
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('../views/ProductsView.vue'),
        meta: { breadcrumb: 'Products' },
      },
      {
        path: 'products/create',
        name: 'ProductCreate',
        component: () => import('../views/ProductFormView.vue'),
        meta: { breadcrumb: 'Create Product' },
      },
      {
        path: 'products/:id',
        name: 'ProductDetail',
        component: () => import('../views/ProductDetailView.vue'),
        meta: { breadcrumb: 'Product Detail' },
      },
      {
        path: 'products/:id/edit',
        name: 'ProductEdit',
        component: () => import('../views/ProductFormView.vue'),
        meta: { breadcrumb: 'Edit Product' },
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('../views/InventoryView.vue'),
        meta: { breadcrumb: 'Inventory' },
      },
      {
        path: 'inventory/movements',
        name: 'InventoryMovements',
        component: () => import('../views/InventoryMovementsView.vue'),
        meta: { breadcrumb: 'Stock Movements' },
      },
      {
        path: 'sales',
        name: 'Sales',
        component: () => import('../views/SalesView.vue'),
        meta: { breadcrumb: 'Sales' },
      },
      {
        path: 'sales/pos',
        name: 'POS',
        component: () => import('../views/POSView.vue'),
        meta: { breadcrumb: 'Point of Sale' },
      },
      {
        path: 'sales/:id',
        name: 'SaleDetail',
        component: () => import('../views/SaleDetailView.vue'),
        meta: { breadcrumb: 'Sale Detail' },
      },
      {
        path: 'purchases',
        name: 'Purchases',
        component: () => import('../views/PurchasesView.vue'),
        meta: { breadcrumb: 'Purchases' },
      },
      {
        path: 'purchases/create',
        name: 'PurchaseCreate',
        component: () => import('../views/PurchaseFormView.vue'),
        meta: { breadcrumb: 'Create Purchase' },
      },
      {
        path: 'purchases/:id',
        name: 'PurchaseDetail',
        component: () => import('../views/PurchaseDetailView.vue'),
        meta: { breadcrumb: 'Purchase Detail' },
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('../views/CustomersView.vue'),
        meta: { breadcrumb: 'Customers' },
      },
      {
        path: 'suppliers',
        name: 'Suppliers',
        component: () => import('../views/SuppliersView.vue'),
        meta: { breadcrumb: 'Suppliers' },
      },
      {
        path: 'expenses',
        name: 'Expenses',
        component: () => import('../views/ExpensesView.vue'),
        meta: { breadcrumb: 'Expenses' },
      },
      {
        path: 'reports/sales',
        name: 'SalesReport',
        component: () => import('../views/SalesReportView.vue'),
        meta: { breadcrumb: 'Sales Report' },
      },
      {
        path: 'reports/profit',
        name: 'ProfitReport',
        component: () => import('../views/ProfitReportView.vue'),
        meta: { breadcrumb: 'Profit Report' },
      },
      {
        path: 'reports/inventory',
        name: 'InventoryReport',
        component: () => import('../views/InventoryReportView.vue'),
        meta: { breadcrumb: 'Inventory Report' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/SettingsView.vue'),
        meta: { breadcrumb: 'Settings' },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/UsersView.vue'),
        meta: { breadcrumb: 'Users', roles: ['Admin'] },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }

  if (to.meta.guest && token) {
    return next('/dashboard');
  }

  if (token && to.path !== '/login' && to.path !== '/dashboard') {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        const userRole = user?.role?.name || '';
        const allowedRoles = roleRoutes[to.path];
        if (allowedRoles && !allowedRoles.includes(userRole)) {
          return next('/dashboard');
        }
      } catch (e) {
        // Invalid user data, allow access
      }
    }
  }

  next();
});

export default router;
