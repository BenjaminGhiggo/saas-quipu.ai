import { create } from 'zustand';
import { MetricsData, MetricsPeriod } from '@/shared/types';

interface MetricsStore {
  data: MetricsData | null;
  loading: boolean;
  error: string | null;
  selectedPeriod: MetricsPeriod;
  
  // Actions
  fetchMetrics: (period?: string) => Promise<void>;
  setPeriod: (period: MetricsPeriod) => void;
  exportReport: (format: 'pdf' | 'excel') => Promise<void>;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const periods: MetricsPeriod[] = [
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
  { label: 'Año', value: 'year' },
];

export const useMetricsStore = create<MetricsStore>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  selectedPeriod: periods[1], // Default to month

  fetchMetrics: async (period = 'month') => {
    set({ loading: true, error: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock data based on period
      const generateChartData = () => {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const currentMonth = new Date().getMonth();
        
        return months.slice(0, currentMonth + 1).map((month) => ({
          month,
          amount: Math.random() * 10000 + 2000,
        }));
      };

      const mockData: MetricsData = {
        period: periods.find(p => p.value === period) || periods[1],
        sales: {
          total: 45230.50,
          count: 127,
          average: 356.15,
          growth: 12.5,
        },
        purchases: {
          total: 23450.30,
          count: 89,
          average: 263.48,
          growth: -5.2,
        },
        taxes: {
          igv: 4072.14,
          rent: 678.46,
          total: 4750.60,
        },
        charts: {
          salesByMonth: generateChartData(),
          purchasesByMonth: generateChartData(),
          taxesByMonth: generateChartData().map(item => ({
            month: item.month,
            igv: Math.random() * 800 + 200,
            rent: Math.random() * 200 + 50,
          })),
        },
      };

      set({ 
        data: mockData, 
        loading: false,
        selectedPeriod: mockData.period,
      });
      
    } catch (error) {
      set({ error: 'Error fetching metrics', loading: false });
    }
  },

  setPeriod: (period: MetricsPeriod) => {
    set({ selectedPeriod: period });
    get().fetchMetrics(period.value);
  },

  exportReport: async (format: 'pdf' | 'excel') => {
    set({ loading: true, error: null });
    
    try {
      // Mock export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would trigger a download
      console.log(`Exporting report in ${format} format`);
      
      set({ loading: false });
      
      // Simulate file download
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,Mock report data';
      link.download = `metrics-report.${format}`;
      link.click();
      
    } catch (error) {
      set({ error: `Error exporting ${format} report`, loading: false });
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));