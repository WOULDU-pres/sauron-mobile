/**
 * @fileoverview 성능 모니터링 대시보드 컴포넌트
 * 
 * 앱의 성능 지표를 실시간으로 표시하는 대시보드 컴포넌트입니다.
 * 
 * @features
 * - 실시간 성능 지표 표시
 * - API 응답 시간 차트
 * - 에러 발생 현황
 * - 성능 알림 표시
 * - 설정 가능한 임계값
 * 
 * @author Sauron Mobile Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Settings,
  X
} from 'lucide-react-native';
import { Card, CardContent } from '~/components/primitives/card';
import { usePerformanceMonitor, type PerformanceAlert } from '~/hooks/usePerformanceMonitor';
import { errorLogger } from '~/lib/errorLogger';
import { colors, spacing } from '@/~/lib/tokens';
import { createTextStyle, createContainerStyle } from '@/~/lib/utils';

// ===== 타입 정의 =====

interface PerformanceMonitorDashboardProps {
  /** 대시보드 표시 여부 */
  visible: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 개발자 모드 여부 */
  isDeveloperMode?: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ComponentType<any>;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
}

// ===== 스타일 정의 =====

const styles = StyleSheet.create({
  // 모달 스타일
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  
  // 헤더 스타일
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...createTextStyle('xl', 'bold', 'foreground'),
  },
  headerButton: {
    padding: spacing.sm,
  },
  
  // 콘텐츠 스타일
  content: {
    flex: 1,
    padding: spacing.md,
  },
  
  // 메트릭 카드 스타일
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricIcon: {
    marginRight: spacing.sm,
  },
  metricTitle: {
    ...createTextStyle('sm', 'medium', 'mutedForeground'),
    flex: 1,
  },
  metricValue: {
    ...createTextStyle('2xl', 'bold', 'foreground'),
    marginBottom: spacing.xs,
  },
  metricSubtitle: {
    ...createTextStyle('xs', 'normal', 'mutedForeground'),
  },
  
  // 알림 스타일
  alertsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...createTextStyle('lg', 'bold', 'foreground'),
    marginBottom: spacing.md,
  },
  alertItem: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  alertTitle: {
    ...createTextStyle('sm', 'bold', 'foreground'),
    flex: 1,
    marginLeft: spacing.sm,
  },
  alertTime: {
    ...createTextStyle('xs', 'normal', 'mutedForeground'),
  },
  alertMessage: {
    ...createTextStyle('sm', 'normal', 'mutedForeground'),
  },
  
  // 액션 버튼 스타일
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: colors.secondary,
  },
  actionButtonText: {
    ...createTextStyle('sm', 'bold', 'primaryForeground'),
  },
  actionButtonTextSecondary: {
    ...createTextStyle('sm', 'bold', 'secondaryForeground'),
  },
  
  // 상태 표시
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  statusText: {
    ...createTextStyle('sm', 'medium', 'foreground'),
    marginLeft: spacing.sm,
  },
});

// ===== 하위 컴포넌트들 =====

/**
 * 메트릭 카드 컴포넌트
 */
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  color,
  trend,
  subtitle,
}) => {
  const trendColor = trend === 'up' ? colors.destructive : 
                    trend === 'down' ? colors.customGreen : 
                    colors.mutedForeground;
  
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Icon size={16} color={color} style={styles.metricIcon} />
        <Text style={styles.metricTitle}>{title}</Text>
        {trend && (
          <TrendingUp 
            size={12} 
            color={trendColor}
            style={{ transform: [{ rotate: trend === 'down' ? '180deg' : '0deg' }] }}
          />
        )}
      </View>
      <Text style={styles.metricValue}>
        {value}{unit && <Text style={styles.metricSubtitle}>{unit}</Text>}
      </Text>
      {subtitle && (
        <Text style={styles.metricSubtitle}>{subtitle}</Text>
      )}
    </View>
  );
};

/**
 * 성능 알림 아이템 컴포넌트
 */
const AlertItem: React.FC<{ 
  alert: PerformanceAlert; 
  onDismiss: (id: string) => void;
}> = ({ alert, onDismiss }) => {
  const severityColors = {
    low: colors.customGreen,
    medium: colors.customOrange,
    high: colors.customRed,
    critical: colors.destructive,
  };
  
  const getSeverityIcon = () => {
    switch (alert.severity) {
      case 'critical':
        return <AlertTriangle size={16} color={severityColors.critical} />;
      case 'high':
        return <AlertTriangle size={16} color={severityColors.high} />;
      default:
        return <Activity size={16} color={severityColors[alert.severity]} />;
    }
  };
  
  return (
    <View 
      style={[
        styles.alertItem,
        { borderLeftColor: severityColors[alert.severity] }
      ]}
    >
      <View style={styles.alertHeader}>
        {getSeverityIcon()}
        <Text style={styles.alertTitle}>
          {alert.type.replace(/_/g, ' ').toUpperCase()}
        </Text>
        <Text style={styles.alertTime}>
          {alert.timestamp.toLocaleTimeString()}
        </Text>
        <TouchableOpacity
          onPress={() => onDismiss(alert.id)}
          style={{ marginLeft: spacing.sm }}
        >
          <X size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
      <Text style={styles.alertMessage}>{alert.message}</Text>
    </View>
  );
};

// ===== 메인 컴포넌트 =====

/**
 * 성능 모니터링 대시보드 컴포넌트
 */
const PerformanceMonitorDashboard: React.FC<PerformanceMonitorDashboardProps> = ({
  visible,
  onClose,
  isDeveloperMode = false,
}) => {
  // ===== 상태 관리 =====
  
  const {
    stats,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearMetrics,
    dismissAlert,
  } = usePerformanceMonitor();
  
  const [errorStats, setErrorStats] = useState(errorLogger.getStats());
  
  // ===== 생명주기 관리 =====
  
  // 에러 통계 주기적 업데이트
  useEffect(() => {
    if (!visible) return;
    
    const interval = setInterval(() => {
      setErrorStats(errorLogger.getStats());
    }, 5000); // 5초마다 업데이트
    
    return () => clearInterval(interval);
  }, [visible]);
  
  // ===== 이벤트 핸들러들 =====
  
  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };
  
  const handleClearMetrics = () => {
    Alert.alert(
      '메트릭 초기화',
      '모든 성능 데이터를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: clearMetrics
        },
      ]
    );
  };
  
  const handleClearErrorLogs = () => {
    Alert.alert(
      '에러 로그 초기화',
      '모든 에러 로그를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => errorLogger.clearLogs().then(() => setErrorStats(errorLogger.getStats()))
        },
      ]
    );
  };
  
  // ===== 계산된 값들 =====
  
  const recentAlerts = useMemo(() => 
    alerts.slice(-5).reverse(), 
    [alerts]
  );
  
  const healthStatus = useMemo(() => {
    if (!isMonitoring) return { status: 'stopped', color: colors.mutedForeground };
    if (stats.successRate < 95) return { status: 'warning', color: colors.customOrange };
    if (stats.averageResponseTime > 2000) return { status: 'slow', color: colors.customRed };
    return { status: 'healthy', color: colors.customGreen };
  }, [isMonitoring, stats]);
  
  // ===== 렌더링 =====
  
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>성능 모니터링</Text>
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <X size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            {/* 모니터링 상태 */}
            <View style={styles.statusIndicator}>
              <CheckCircle 
                size={16} 
                color={healthStatus.color} 
              />
              <Text style={styles.statusText}>
                {isMonitoring ? `모니터링 활성 (${healthStatus.status})` : '모니터링 비활성'}
              </Text>
            </View>
            
            {/* 성능 메트릭 카드들 */}
            <View style={styles.metricsGrid}>
              <MetricCard
                title="평균 응답시간"
                value={stats.averageResponseTime}
                unit="ms"
                icon={Clock}
                color={colors.primary}
                subtitle={`최대: ${stats.maxResponseTime}ms`}
              />
              
              <MetricCard
                title="성공률"
                value={stats.successRate}
                unit="%"
                icon={CheckCircle}
                color={colors.customGreen}
                subtitle={`${stats.successfulRequests}/${stats.totalRequests}`}
              />
              
              <MetricCard
                title="분당 요청수"
                value={stats.requestsPerMinute}
                icon={TrendingUp}
                color={colors.customBlue}
                subtitle="최근 1분"
              />
              
              <MetricCard
                title="총 에러수"
                value={errorStats.totalErrors}
                icon={AlertTriangle}
                color={colors.customRed}
                subtitle={`24시간: ${errorStats.last24Hours}`}
              />
            </View>
            
            {/* 에러 분포 */}
            {errorStats.totalErrors > 0 && (
              <View style={styles.alertsSection}>
                <Text style={styles.sectionTitle}>에러 분포</Text>
                <View style={styles.metricsGrid}>
                  <MetricCard
                    title="네트워크 에러"
                    value={errorStats.errorsByCategory.network}
                    icon={Activity}
                    color={colors.customOrange}
                  />
                  
                  <MetricCard
                    title="API 에러"
                    value={errorStats.errorsByCategory.api}
                    icon={Activity}
                    color={colors.customRed}
                  />
                  
                  <MetricCard
                    title="UI 에러"
                    value={errorStats.errorsByCategory.ui}
                    icon={Activity}
                    color={colors.customPurple}
                  />
                  
                  <MetricCard
                    title="해결된 에러"
                    value={errorStats.resolvedErrors}
                    icon={CheckCircle}
                    color={colors.customGreen}
                  />
                </View>
              </View>
            )}
            
            {/* 최근 알림들 */}
            {recentAlerts.length > 0 && (
              <View style={styles.alertsSection}>
                <Text style={styles.sectionTitle}>최근 알림</Text>
                {recentAlerts.map(alert => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onDismiss={dismissAlert}
                  />
                ))}
              </View>
            )}
            
            {/* 개발자 정보 (개발자 모드일 때만) */}
            {isDeveloperMode && (
              <View style={styles.alertsSection}>
                <Text style={styles.sectionTitle}>개발자 정보</Text>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>최빈 에러</Text>
                  <Text style={styles.metricValue}>
                    {errorStats.mostFrequentError || 'N/A'}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
          
          {/* 액션 버튼들 */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                !isMonitoring && styles.actionButtonSecondary
              ]}
              onPress={handleToggleMonitoring}
            >
              <Text style={[
                styles.actionButtonText,
                !isMonitoring && styles.actionButtonTextSecondary
              ]}>
                {isMonitoring ? '모니터링 정지' : '모니터링 시작'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={handleClearMetrics}
            >
              <Text style={styles.actionButtonTextSecondary}>
                메트릭 초기화
              </Text>
            </TouchableOpacity>
            
            {isDeveloperMode && (
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={handleClearErrorLogs}
              >
                <Text style={styles.actionButtonTextSecondary}>
                  로그 초기화
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PerformanceMonitorDashboard;