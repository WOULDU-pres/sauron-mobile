import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Skeleton } from '~/components/ui/skeleton';
import { useToast } from '~/hooks/useToast';
import { useOperationsData } from '~/hooks/useOperationsData';
import { CostAnalyticsChart, BudgetUtilizationChart, SystemHealthChart } from '~/components/composed/charts';
import { colors } from '~/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const styles = {
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  headerSection: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '48%',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionCard: {
    marginBottom: 16,
  },
  budgetCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  budgetHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  budgetProgress: {
    height: 8,
    backgroundColor: colors.muted,
    borderRadius: 4,
    marginVertical: 8,
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetDetails: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginTop: 8,
  },
  budgetDetailItem: {
    alignItems: 'center' as const,
  },
  budgetDetailValue: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  budgetDetailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center' as const,
  },
  errorText: {
    color: colors.destructive,
    textAlign: 'center' as const,
    marginBottom: 16,
  },
  refreshButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
};

export default function OperationsDashboardScreen() {
  const { showSuccess, showError } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    operationsData,
    budgetUtilization,
    systemHealth,
    isLoading,
    error,
    refreshData,
  } = useOperationsData(showError);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      showSuccess('데이터가 새로고침되었습니다');
    } catch (err) {
      showError('새로고침 중 오류가 발생했습니다');
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'HEALTHY':
      case 'NORMAL':
        return colors.success;
      case 'WARNING':
        return colors.warning;
      case 'CRITICAL':
        return colors.destructive;
      default:
        return colors.muted;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'HEALTHY':
      case 'NORMAL':
        return 'default';
      case 'WARNING':
        return 'secondary';
      case 'CRITICAL':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (error && !operationsData) {
    return (
      <SafeAreaView style={styles.screenContainer}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.destructive} />
          <Text style={styles.errorText}>{error}</Text>
          <Button onPress={handleRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={16} color={colors.background} />
            <Text>다시 시도</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>운영 대시보드</Text>
          <Text style={styles.headerSubtitle}>
            시스템 성능 및 비용 분석 · {new Date().toLocaleDateString('ko-KR')}
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <>
                  <Text style={styles.metricValue}>
                    {operationsData?.totalMessages?.toLocaleString() || 0}
                  </Text>
                  <Text style={styles.metricLabel}>총 메시지 수</Text>
                </>
              )}
            </CardContent>
          </Card>

          <Card style={styles.metricCard}>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <>
                  <Text style={[styles.metricValue, { color: colors.primary }]}>
                    ${operationsData?.totalCost?.toFixed(2) || '0.00'}
                  </Text>
                  <Text style={styles.metricLabel}>총 비용</Text>
                </>
              )}
            </CardContent>
          </Card>

          <Card style={styles.metricCard}>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <>
                  <Badge variant={getStatusBadgeVariant(systemHealth?.status || 'UNKNOWN')}>
                    {systemHealth?.status || 'UNKNOWN'}
                  </Badge>
                  <Text style={styles.metricLabel}>시스템 상태</Text>
                </>
              )}
            </CardContent>
          </Card>

          <Card style={styles.metricCard}>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <>
                  <Text style={styles.metricValue}>
                    {operationsData?.averageResponseTime?.toFixed(0) || 0}ms
                  </Text>
                  <Text style={styles.metricLabel}>평균 응답시간</Text>
                </>
              )}
            </CardContent>
          </Card>
        </View>

        {/* Cost Analytics Chart */}
        <Card style={styles.sectionCard}>
          <CardHeader>
            <CardTitle>비용 분석</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <CostAnalyticsChart data={operationsData?.costMetrics || []} />
            )}
          </CardContent>
        </Card>

        {/* Budget Utilization */}
        <Card style={styles.sectionCard}>
          <CardHeader>
            <CardTitle>예산 사용률</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full mb-4" />
            ) : budgetUtilization && budgetUtilization.length > 0 ? (
              budgetUtilization.map((budget, index) => (
                <Card
                  key={budget.provider}
                  style={[
                    styles.budgetCard,
                    { borderLeftColor: getStatusColor(budget.status) }
                  ]}
                >
                  <CardContent>
                    <View style={styles.budgetHeader}>
                      <Text style={{ fontSize: 16, fontWeight: '600' }}>
                        {budget.provider.toUpperCase()}
                      </Text>
                      <Badge variant={getStatusBadgeVariant(budget.status)}>
                        {budget.status}
                      </Badge>
                    </View>
                    
                    <View style={styles.budgetProgress}>
                      <View
                        style={[
                          styles.budgetProgressFill,
                          {
                            width: `${Math.min(budget.utilizationPercentage, 100)}%`,
                            backgroundColor: getStatusColor(budget.status),
                          }
                        ]}
                      />
                    </View>
                    
                    <View style={styles.budgetDetails}>
                      <View style={styles.budgetDetailItem}>
                        <Text style={styles.budgetDetailValue}>
                          ${budget.currentUsage.toFixed(2)}
                        </Text>
                        <Text style={styles.budgetDetailLabel}>현재 사용</Text>
                      </View>
                      
                      <View style={styles.budgetDetailItem}>
                        <Text style={styles.budgetDetailValue}>
                          ${budget.budgetLimit.toFixed(2)}
                        </Text>
                        <Text style={styles.budgetDetailLabel}>예산 한도</Text>
                      </View>
                      
                      <View style={styles.budgetDetailItem}>
                        <Text style={styles.budgetDetailValue}>
                          {budget.utilizationPercentage.toFixed(1)}%
                        </Text>
                        <Text style={styles.budgetDetailLabel}>사용률</Text>
                      </View>
                      
                      <View style={styles.budgetDetailItem}>
                        <Text style={styles.budgetDetailValue}>
                          {budget.daysRemaining}일
                        </Text>
                        <Text style={styles.budgetDetailLabel}>남은 기간</Text>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Text style={{ textAlign: 'center', color: colors.textSecondary }}>
                설정된 예산이 없습니다
              </Text>
            )}
          </CardContent>
        </Card>

        {/* System Health Chart */}
        {operationsData?.performanceMetrics && operationsData.performanceMetrics.length > 0 && (
          <Card style={styles.sectionCard}>
            <CardHeader>
              <CardTitle>시스템 성능</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemHealthChart data={operationsData.performanceMetrics} />
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}