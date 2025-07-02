import { useState, useEffect, useCallback } from 'react';
import operationsService, { 
  OperationsDashboardData, 
  BudgetUtilizationData,
  CostBudgetData 
} from '~/lib/api/operationsService';

interface UseOperationsDataResult {
  operationsData: OperationsDashboardData | null;
  budgetUtilization: BudgetUtilizationData[] | null;
  budgets: CostBudgetData[] | null;
  systemHealth: any | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  refreshBudgets: () => Promise<void>;
}

export function useOperationsData(onError?: (error: string) => void): UseOperationsDataResult {
  const [operationsData, setOperationsData] = useState<OperationsDashboardData | null>(null);
  const [budgetUtilization, setBudgetUtilization] = useState<BudgetUtilizationData[] | null>(null);
  const [budgets, setBudgets] = useState<CostBudgetData[] | null>(null);
  const [systemHealth, setSystemHealth] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: any) => {
    const errorMessage = err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.';
    setError(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
    console.error('Operations data error:', err);
  }, [onError]);

  const fetchOperationsData = useCallback(async () => {
    try {
      setError(null);
      
      // Get date range for last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      
      const data = await operationsService.getOperationsDashboard(
        formatDate(startDate),
        formatDate(endDate)
      );
      
      setOperationsData(data);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  const fetchBudgetUtilization = useCallback(async () => {
    try {
      const utilization = await operationsService.getBudgetUtilization();
      setBudgetUtilization(utilization);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  const fetchBudgets = useCallback(async () => {
    try {
      const budgetData = await operationsService.getAllBudgets();
      setBudgets(budgetData);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  const fetchSystemHealth = useCallback(async () => {
    try {
      const health = await operationsService.getSystemHealth();
      setSystemHealth(health);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchOperationsData(),
        fetchBudgetUtilization(),
        fetchSystemHealth()
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchOperationsData, fetchBudgetUtilization, fetchSystemHealth]);

  const refreshBudgets = useCallback(async () => {
    await fetchBudgets();
  }, [fetchBudgets]);

  // Initial data load
  useEffect(() => {
    refreshData();
    fetchBudgets();
  }, [refreshData, fetchBudgets]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshData]);

  return {
    operationsData,
    budgetUtilization,
    budgets,
    systemHealth,
    isLoading,
    error,
    refreshData,
    refreshBudgets,
  };
}