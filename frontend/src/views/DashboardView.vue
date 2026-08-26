<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome back. Here's what's happening today.</p>
      </div>
      <div class="dashboard-actions">
        <button class="btn btn-outline-primary btn-sm" @click="exportDashboard">
          <i class="bi bi-download"></i>
          Export
        </button>
        <router-link to="/sales/pos" class="btn btn-primary btn-sm">
          <i class="bi bi-plus-lg"></i>
          New Sale
        </router-link>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-xl-3 col-md-6">
        <StatCard title="Today's Sales" :displayValue="formatCurrency(dashboard.todaySales)" icon="bi bi-currency-dollar" variant="primary" :change="12.5" />
      </div>
      <div class="col-xl-3 col-md-6">
        <StatCard title="Transactions" :displayValue="String(dashboard.todayTransactions)" icon="bi bi-receipt" variant="success" :change="8.2" />
      </div>
      <div class="col-xl-3 col-md-6">
        <StatCard title="Total Products" :displayValue="String(dashboard.totalProducts)" icon="bi bi-box" variant="info" :change="2.1" />
      </div>
      <div class="col-xl-3 col-md-6">
        <StatCard title="Low Stock" :displayValue="String(dashboard.lowStockCount)" icon="bi bi-exclamation-triangle" variant="warning" :change="-3.4" />
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-lg-8">
        <div class="card chart-card">
          <div class="card-header">
            <div>
              <h6 class="card-title">Sales Overview</h6>
              <p class="card-subtitle">Revenue performance over the last 7 days</p>
            </div>
            <select class="form-select form-select-sm chart-select">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 12 months</option>
            </select>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas ref="salesChartRef"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card chart-card">
          <div class="card-header">
            <div>
              <h6 class="card-title">Sales by Category</h6>
              <p class="card-subtitle">Distribution breakdown</p>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas ref="categoryChartRef"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header">
            <div>
              <h6 class="card-title">Recent Transactions</h6>
              <p class="card-subtitle">Latest sales activity</p>
            </div>
            <router-link to="/sales" class="btn btn-link btn-sm">View all</router-link>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Cashier</th>
                    <th class="text-end">Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="dashboard.recentSales?.length === 0">
                    <td colspan="6" class="text-center py-4 text-muted">No transactions yet</td>
                  </tr>
                  <tr v-for="sale in dashboard.recentSales" :key="sale.id">
                    <td class="fw-semibold">{{ sale.saleNumber }}</td>
                    <td>{{ sale.customer?.name || 'Walk-in' }}</td>
                    <td>{{ sale.cashier?.firstName }} {{ sale.cashier?.lastName }}</td>
                    <td class="text-end fw-semibold">{{ formatCurrency(sale.totalAmount) }}</td>
                    <td>
                      <BaseBadge :variant="sale.paymentStatus === 'Paid' ? 'success' : 'warning'">
                        {{ sale.paymentStatus }}
                      </BaseBadge>
                    </td>
                    <td class="text-muted">{{ formatDate(sale.saleDate) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card">
          <div class="card-header">
            <div>
              <h6 class="card-title">Top Products</h6>
              <p class="card-subtitle">Best sellers this month</p>
            </div>
          </div>
          <div class="card-body p-0">
            <div v-if="dashboard.topProducts?.length === 0" class="empty-state">
              <EmptyState icon="bi bi-bar-chart" title="No data yet" />
            </div>
            <div v-else>
              <div v-for="(item, i) in dashboard.topProducts" :key="i" class="top-product-item">
                <div class="top-product-rank">{{ i + 1 }}</div>
                <div class="top-product-info">
                  <div class="top-product-name">{{ item.product?.name }}</div>
                  <div class="top-product-meta">{{ item._sum?.quantity }} units sold</div>
                </div>
                <div class="top-product-value">{{ formatCurrency(Number(item._sum?.totalPrice || 0)) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { exportCsv } from '../utils/exportCsv';
import StatCard from '../components/common/StatCard.vue';
import BaseBadge from '../components/common/BaseBadge.vue';
import EmptyState from '../components/common/EmptyState.vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const dashboard = ref({
  todaySales: 0, todayTransactions: 0, totalProducts: 0, lowStockCount: 0,
  outOfStockCount: 0, pendingPurchases: 0, totalCustomers: 0, totalSuppliers: 0,
  recentSales: [], topProducts: [], salesByCategory: [], salesChart: [],
});

const salesChartRef = ref(null);
const categoryChartRef = ref(null);

const fetchDashboard = async () => {
  try {
    const { data } = await api.get('/dashboard');
    dashboard.value = data.data;
    await nextTick();
    renderCharts();
  } catch (err) {
    console.error('Failed to fetch dashboard:', err);
  }
};

const renderCharts = () => {
  if (salesChartRef.value) {
    if (dashboard.value.salesChart?.length) {
      new Chart(salesChartRef.value, {
        type: 'bar',
        data: {
          labels: dashboard.value.salesChart.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
          datasets: [{
            label: 'Sales',
            data: dashboard.value.salesChart.map(d => d.total),
            backgroundColor: 'rgba(22, 163, 74, 0.85)',
            hoverBackgroundColor: 'rgba(21, 128, 61, 1)',
            borderRadius: 6,
            borderSkipped: false,
            maxBarThickness: 32,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0f172a',
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) => `Sales: $${ctx.parsed.y.toFixed(2)}`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false },
              ticks: {
                callback: (v) => '$' + v,
                color: '#94a3b8',
                font: { size: 11 },
              },
            },
            x: {
              grid: { display: false },
              ticks: { color: '#94a3b8', font: { size: 11 } },
            },
          },
        },
      });
    }
  }

  if (categoryChartRef.value && dashboard.value.salesByCategory?.length) {
    const colors = ['#16a34a', '#0891b2', '#d97706', '#dc2626', '#7c3aed', '#0ea5e9', '#84cc16', '#ec4899'];
    new Chart(categoryChartRef.value, {
      type: 'doughnut',
      data: {
        labels: dashboard.value.salesByCategory.map(c => c.name),
        datasets: [{
          data: dashboard.value.salesByCategory.map(c => c.total),
          backgroundColor: colors.slice(0, dashboard.value.salesByCategory.length),
          borderWidth: 0,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              padding: 12,
              font: { size: 11 },
              color: '#64748b',
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => ` ${ctx.label}: $${ctx.parsed.toFixed(2)}`,
            },
          },
        },
      },
    });
  }
};

const exportDashboard = () => {
  exportCsv('dashboard-report.csv', ['Metric', 'Value'], [
    ["Today's Sales", dashboard.value.todaySales],
    ['Transactions', dashboard.value.todayTransactions],
    ['Total Products', dashboard.value.totalProducts],
    ['Low Stock', dashboard.value.lowStockCount],
  ]);
};

onMounted(fetchDashboard);
</script>

<style scoped>
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.125rem 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.dashboard-actions {
  display: flex;
  gap: 0.375rem;
}

.card-subtitle {
  font-size: 0.6875rem;
  color: var(--color-text-tertiary);
  margin: 0.0625rem 0 0 0;
  font-weight: 400;
}

.chart-card .card-header {
  padding: 1rem 1.25rem;
}

.chart-select {
  width: 130px;
  height: 30px;
  font-size: 0.6875rem;
}

.chart-container {
  position: relative;
  height: 260px;
}

.top-product-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  transition: var(--transition-fast);
}

.top-product-item:last-child {
  border-bottom: none;
}

.top-product-item:hover {
  background: var(--color-bg-subtle);
}

.top-product-rank {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-subtle);
  color: var(--color-text-secondary);
  font-size: 0.6875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.top-product-item:nth-child(1) .top-product-rank {
  background: var(--color-primary);
  color: #fff;
}

.top-product-info {
  flex: 1;
  min-width: 0;
}

.top-product-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.top-product-meta {
  font-size: 0.625rem;
  color: var(--color-text-tertiary);
  margin-top: 1px;
}

.top-product-value {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
  flex-shrink: 0;
}

.empty-state {
  padding: 1.5rem 0.875rem;
}

@media (max-width: 767.98px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .dashboard-actions {
    width: 100%;
  }
  .dashboard-actions .btn {
    flex: 1;
  }
  .chart-container {
    height: 200px;
  }
  .chart-select {
    width: 110px;
  }
}
</style>
