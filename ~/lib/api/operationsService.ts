import httpClient from './httpClient';

// Import shared constants and utilities
import { HTTP_STATUS, ERROR_CODES, API_CONSTANTS } from '@shared/constants';
import { DateTimeUtils, StringUtils } from '@shared/utils';

// Types for operations dashboard
export interface OperationsDashboardData {
  totalMessages: number;
  totalCost: number;
  averageResponseTime?: number;
  systemHealth: string;
  costMetrics: CostMetricData[];
  performanceMetrics: PerformanceMetricData[];
  budgetUtilization: BudgetUtilizationData[];
  recentAlerts: SystemAlertData[];
}

export interface CostMetricData {
  date: string;
  provider: string;
  totalRequests: number;
  totalCost: number;
  averageCostPerRequest: number;
  errorCount: number;
}

export interface PerformanceMetricData {
  timestamp: string;
  metricName: string;
  metricValue: number;
  metricUnit: string;
  serviceComponent: string;
}

export interface BudgetUtilizationData {
  provider: string;
  monthYear: string;
  budgetLimit: number;
  currentUsage: number;
  utilizationPercentage: number;
  daysRemaining: number;
  projectedMonthlyCost: number;
  status: string; // NORMAL, WARNING, CRITICAL
}

export interface SystemAlertData {
  id: number;
  alertType: string;
  message: string;
  severity: string;
  timestamp: string;
  resolved: boolean;
}

export interface CostBudgetData {
  id: number;
  budgetName: string;
  costProvider: string;
  monthlyLimit: number;
  warningThreshold: number;
  alertEnabled: boolean;
  notificationChannels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCostBudgetRequest {
  budgetName: string;
  costProvider: string;
  monthlyLimit: number;
  warningThreshold: number;
  alertEnabled: boolean;
  notificationChannels: string[];
}

class OperationsService {
  private handleError(error: any): never {
    console.error('Operations service error:', error);
    
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    }
    
    if (error.response?.status === HTTP_STATUS.FORBIDDEN) {
      throw new Error('관리자 권한이 필요합니다.');
    }
    
    if (error.response?.status === HTTP_STATUS.NOT_FOUND) {
      throw new Error('요청한 데이터를 찾을 수 없습니다.');
    }
    
    if (error.response?.data?.message) {
      throw new Error(StringUtils.safeTrim(error.response.data.message));
    }
    
    throw new Error('운영 대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
  }

  async getOperationsDashboard(
    startDate: string,
    endDate: string
  ): Promise<OperationsDashboardData> {
    try {
      const response = await httpClient.get<OperationsDashboardData>(
        `${API_CONSTANTS.BASE_PATH}/operations/dashboard?startDate=${startDate}&endDate=${endDate}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentMonthCost(provider?: string): Promise<{ provider: string; currentMonthCost: number; asOfDate: string }> {
    try {
      const params = provider ? `?provider=${provider}` : '';
      const response = await httpClient.get<{ provider: string; currentMonthCost: number; asOfDate: string }>(
        `/v1/operations/cost/current-month${params}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTopCostlyEndpoints(
    startDate: string,
    endDate: string
  ): Promise<Array<{
    endpoint: string;
    totalRequests: number;
    totalCost: number;
    averageResponseTime: number;
  }>> {
    try {
      const response = await httpClient.get<Array<{
        endpoint: string;
        totalRequests: number;
        totalCost: number;
        averageResponseTime: number;
      }>>(`/v1/operations/endpoints/top-costly?startDate=${startDate}&endDate=${endDate}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSystemHealth(): Promise<{
    status: string;
    totalMessages: number;
    totalCost: number;
    lastUpdated: string;
    details: string;
  }> {
    try {
      const response = await httpClient.get<{
        status: string;
        totalMessages: number;
        totalCost: number;
        lastUpdated: string;
        details: string;
      }>('/v1/operations/health');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Budget Management APIs
  async getAllBudgets(): Promise<CostBudgetData[]> {
    try {
      const response = await httpClient.get<CostBudgetData[]>('/v1/operations/budgets');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBudgetByProvider(provider: string): Promise<CostBudgetData> {
    try {
      const response = await httpClient.get<CostBudgetData>(`/v1/operations/budgets/${provider}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createBudget(request: CreateCostBudgetRequest): Promise<CostBudgetData> {
    try {
      const response = await httpClient.post<CostBudgetData>('/v1/operations/budgets', request);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBudget(budgetId: number, request: CreateCostBudgetRequest): Promise<CostBudgetData> {
    try {
      const response = await httpClient.put<CostBudgetData>(`/v1/operations/budgets/${budgetId}`, request);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteBudget(budgetId: number): Promise<void> {
    try {
      await httpClient.delete(`/v1/operations/budgets/${budgetId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBudgetUtilization(): Promise<BudgetUtilizationData[]> {
    try {
      const response = await httpClient.get<BudgetUtilizationData[]>('/v1/operations/budgets/utilization');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBudgetUtilizationByProvider(provider: string): Promise<BudgetUtilizationData> {
    try {
      const response = await httpClient.get<BudgetUtilizationData>(`/v1/operations/budgets/utilization/${provider}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async toggleBudgetAlert(budgetId: number, alertEnabled: boolean): Promise<{
    budgetId: number;
    alertEnabled: boolean;
    message: string;
  }> {
    try {
      const response = await httpClient.post<{
        budgetId: number;
        alertEnabled: boolean;
        message: string;
      }>(`/v1/operations/budgets/${budgetId}/toggle-alert`, { alertEnabled });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

const operationsService = new OperationsService();
export default operationsService;