import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { colors, spacing } from '@/~/lib/tokens';
import { Card, CardContent } from '~/components/primitives/card';

// 모의 데이터
const monthlyDetectionData = [
  { value: 45, label: '1월', frontColor: colors.customRed },
  { value: 62, label: '2월', frontColor: colors.customOrange },
  { value: 38, label: '3월', frontColor: colors.customGreen },
  { value: 71, label: '4월', frontColor: colors.customRed },
  { value: 29, label: '5월', frontColor: colors.customGreen },
  { value: 55, label: '6월', frontColor: colors.customOrange },
];

const weeklyTrendData = [
  { value: 50, dataPointText: '50' },
  { value: 80, dataPointText: '80' },
  { value: 90, dataPointText: '90', dataPointColor: colors.customRed },
  { value: 70, dataPointText: '70' },
  { value: 65, dataPointText: '65' },
  { value: 85, dataPointText: '85' },
  { value: 95, dataPointText: '95', dataPointColor: colors.customRed },
];

const typeDistributionData = [
  { value: 40, color: colors.customRed, text: '40%' },
  { value: 30, color: colors.customOrange, text: '30%' },
  { value: 20, color: colors.customGreen, text: '20%' },
  { value: 10, color: colors.primary, text: '10%' },
];

// 월별 감지 현황 차트
export const MonthlyDetectionChart: React.FC = () => {
  return (
    <Card style={styles.chartCard}>
      <CardContent style={styles.cardContent}>
        <Text style={styles.chartTitle}>월별 감지 현황</Text>
        <Text style={styles.chartSubtitle}>최근 6개월 위험 메시지 감지 수</Text>
        
        <View style={styles.chartContainer}>
          <BarChart
            data={monthlyDetectionData}
            width={300}
            height={200}
            barWidth={35}
            spacing={20}
            barBorderRadius={4}
            noOfSections={4}
            maxValue={100}
            isAnimated
            animationDuration={1000}
            yAxisThickness={1}
            yAxisColor={colors.border}
            xAxisThickness={1}
            xAxisColor={colors.border}
            yAxisTextStyle={{
              color: colors.mutedForeground,
              fontSize: 10,
            }}
            xAxisLabelTextStyle={{
              color: colors.mutedForeground,
              fontSize: 10,
            }}
            rulesColor={colors.border}
            rulesType="solid"
            backgroundColor={colors.card}
          />
        </View>
      </CardContent>
    </Card>
  );
};

// 주간 트렌드 차트
export const WeeklyTrendChart: React.FC = () => {
  return (
    <Card style={styles.chartCard}>
      <CardContent style={styles.cardContent}>
        <Text style={styles.chartTitle}>주간 트렌드</Text>
        <Text style={styles.chartSubtitle}>최근 7일간 위험도 추이</Text>
        
        <View style={styles.chartContainer}>
          <LineChart
            data={weeklyTrendData}
            width={300}
            height={200}
            spacing={40}
            color={colors.primary}
            thickness={3}
            dataPointsColor={colors.primary}
            dataPointsRadius={6}
            isAnimated
            animationDuration={1200}
            curved
            curvature={0.3}
            showVerticalLines
            verticalLinesColor={colors.border}
            yAxisThickness={1}
            yAxisColor={colors.border}
            xAxisThickness={1}
            xAxisColor={colors.border}
            yAxisTextStyle={{
              color: colors.mutedForeground,
              fontSize: 10,
            }}
            rulesColor={colors.border}
            rulesType="solid"
            backgroundColor={colors.card}
            areaChart
            startFillColor={colors.primary}
            endFillColor={colors.background}
            startOpacity={0.8}
            endOpacity={0.1}
            dataPointTextColor={colors.foreground}
            textFontSize={10}
            textShiftY={-10}
          />
        </View>
      </CardContent>
    </Card>
  );
};

// 위험 유형 분포 차트
export const TypeDistributionChart: React.FC = () => {
  const renderLegend = () => {
    const types = ['광고', '도배', '분쟁', '기타'];
    
    return (
      <View style={styles.legendContainer}>
        {typeDistributionData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {types[index]} ({item.text})
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Card style={styles.chartCard}>
      <CardContent style={styles.cardContent}>
        <Text style={styles.chartTitle}>위험 유형 분포</Text>
        <Text style={styles.chartSubtitle}>전체 감지 메시지 유형별 비율</Text>
        
        <View style={styles.pieChartContainer}>
          <PieChart
            data={typeDistributionData}
            radius={80}
            isAnimated
            animationDuration={1000}
            showText
            textColor={colors.background}
            textSize={12}
            fontWeight="bold"
            strokeColor={colors.background}
            strokeWidth={2}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text style={styles.centerLabelText}>총 감지</Text>
                <Text style={styles.centerLabelValue}>100</Text>
              </View>
            )}
          />
        </View>
        
        {renderLegend()}
      </CardContent>
    </Card>
  );
};

// 실시간 상태 차트
export const RealtimeStatusChart: React.FC = () => {
  const realtimeData = [
    { value: 85, label: '정상', frontColor: colors.customGreen },
    { value: 10, label: '주의', frontColor: colors.customOrange },
    { value: 5, label: '위험', frontColor: colors.customRed },
  ];

  return (
    <Card style={styles.chartCard}>
      <CardContent style={styles.cardContent}>
        <Text style={styles.chartTitle}>실시간 채팅방 상태</Text>
        <Text style={styles.chartSubtitle}>현재 모니터링 중인 채팅방 상태</Text>
        
        <View style={styles.chartContainer}>
          <BarChart
            data={realtimeData}
            width={250}
            height={150}
            barWidth={50}
            spacing={30}
            barBorderRadius={8}
            horizontal
            isAnimated
            animationDuration={800}
            yAxisThickness={0}
            xAxisThickness={1}
            xAxisColor={colors.border}
            xAxisLabelTextStyle={{
              color: colors.mutedForeground,
              fontSize: 10,
            }}
            rulesColor={colors.border}
            backgroundColor={colors.card}
            showYAxisIndices={false}
            showReferenceLine1
            referenceLine1Position={50}
            referenceLine1Config={{
              color: colors.mutedForeground,
              thickness: 1,
              width: 200,
              type: 'dashed' as const,
            }}
          />
        </View>
      </CardContent>
    </Card>
  );
};

// 종합 대시보드 차트
export const ComprehensiveChart: React.FC = () => {
  const multiLineData = [
    { value: 50, dataPointText: '50' },
    { value: 80, dataPointText: '80' },
    { value: 90, dataPointText: '90' },
    { value: 70, dataPointText: '70' },
    { value: 65, dataPointText: '65' },
    { value: 85, dataPointText: '85' },
  ];

  const multiLineData2 = [
    { value: 30, dataPointText: '30' },
    { value: 60, dataPointText: '60' },
    { value: 75, dataPointText: '75' },
    { value: 55, dataPointText: '55' },
    { value: 45, dataPointText: '45' },
    { value: 70, dataPointText: '70' },
  ];

  return (
    <Card style={styles.chartCard}>
      <CardContent style={styles.cardContent}>
        <Text style={styles.chartTitle}>종합 분석</Text>
        <Text style={styles.chartSubtitle}>감지율 vs 처리율 비교</Text>
        
        <View style={styles.chartContainer}>
          <LineChart
            data={multiLineData}
            data2={multiLineData2}
            width={300}
            height={200}
            spacing={45}
            color={colors.customRed}
            color2={colors.primary}
            thickness={3}
            thickness2={3}
            dataPointsRadius={5}
            dataPointsRadius2={5}
            isAnimated
            animationDuration={1500}
            curved
            showVerticalLines
            verticalLinesColor={colors.border}
            yAxisThickness={1}
            yAxisColor={colors.border}
            xAxisThickness={1}
            xAxisColor={colors.border}
            yAxisTextStyle={{
              color: colors.mutedForeground,
              fontSize: 10,
            }}
            rulesColor={colors.border}
            backgroundColor={colors.card}
          />
        </View>
        
        <View style={styles.multiLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.customRed }]} />
            <Text style={styles.legendText}>감지율</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>처리율</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    marginBottom: spacing.md,
  },
  cardContent: {
    padding: spacing.lg,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: spacing.md,
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  pieChartContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  centerLabel: {
    alignItems: 'center',
  },
  centerLabelText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  centerLabelValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.foreground,
  },
  multiLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.lg,
  },
});

// New Operations Dashboard Charts

// Cost Analytics Chart
export interface CostAnalyticsData {
  date: string;
  provider: string;
  totalRequests: number;
  totalCost: number;
  averageCostPerRequest: number;
  errorCount: number;
}

export const CostAnalyticsChart: React.FC<{ data: CostAnalyticsData[] }> = ({ data }) => {
  // Transform data for chart display
  const chartData = data.slice(0, 7).map((item, index) => ({
    value: item.totalCost,
    label: new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    frontColor: item.totalCost > 1 ? colors.customRed : 
                item.totalCost > 0.5 ? colors.customOrange : colors.customGreen,
    dataPointText: `$${item.totalCost.toFixed(2)}`,
  }));

  if (!data || data.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartSubtitle, { textAlign: 'center' }]}>
          비용 데이터가 없습니다
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.chartContainer}>
      <LineChart
        data={chartData}
        width={300}
        height={200}
        spacing={40}
        color={colors.primary}
        thickness={3}
        dataPointsRadius={6}
        isAnimated
        animationDuration={1200}
        curved
        showVerticalLines
        verticalLinesColor={colors.border}
        yAxisThickness={1}
        yAxisColor={colors.border}
        xAxisThickness={1}
        xAxisColor={colors.border}
        yAxisTextStyle={{
          color: colors.mutedForeground,
          fontSize: 10,
        }}
        xAxisLabelTextStyle={{
          color: colors.mutedForeground,
          fontSize: 10,
        }}
        rulesColor={colors.border}
        backgroundColor={colors.card}
        dataPointTextColor={colors.foreground}
        textFontSize={10}
        textShiftY={-15}
      />
    </View>
  );
};

// Budget Utilization Chart
export interface BudgetUtilizationData {
  provider: string;
  monthYear: string;
  budgetLimit: number;
  currentUsage: number;
  utilizationPercentage: number;
  daysRemaining: number;
  projectedMonthlyCost: number;
  status: string;
}

export const BudgetUtilizationChart: React.FC<{ data: BudgetUtilizationData[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartSubtitle, { textAlign: 'center' }]}>
          예산 데이터가 없습니다
        </Text>
      </View>
    );
  }

  const chartData = data.map((item) => ({
    value: Math.min(item.utilizationPercentage, 100),
    label: item.provider.toUpperCase(),
    frontColor: item.status === 'CRITICAL' ? colors.customRed :
                item.status === 'WARNING' ? colors.customOrange : colors.customGreen,
    dataPointText: `${item.utilizationPercentage.toFixed(1)}%`,
  }));

  return (
    <View style={styles.chartContainer}>
      <BarChart
        data={chartData}
        width={300}
        height={200}
        barWidth={35}
        spacing={30}
        barBorderRadius={4}
        noOfSections={4}
        maxValue={100}
        isAnimated
        animationDuration={1000}
        yAxisThickness={1}
        yAxisColor={colors.border}
        xAxisThickness={1}
        xAxisColor={colors.border}
        yAxisTextStyle={{
          color: colors.mutedForeground,
          fontSize: 10,
        }}
        xAxisLabelTextStyle={{
          color: colors.mutedForeground,
          fontSize: 10,
        }}
        rulesColor={colors.border}
        backgroundColor={colors.card}
        showReferenceLine1
        referenceLine1Position={80}
        referenceLine1Config={{
          color: colors.customOrange,
          thickness: 2,
          width: 300,
          type: 'dashed' as const,
        }}
      />
    </View>
  );
};

// System Health Chart
export interface PerformanceMetricData {
  timestamp: string;
  metricName: string;
  metricValue: number;
  metricUnit: string;
  serviceComponent: string;
}

export const SystemHealthChart: React.FC<{ data: PerformanceMetricData[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartSubtitle, { textAlign: 'center' }]}>
          성능 데이터가 없습니다
        </Text>
      </View>
    );
  }

  // Group data by metric name and take recent values
  const responseTimeData = data
    .filter(item => item.metricName.includes('response_time'))
    .slice(-7)
    .map((item, index) => ({
      value: item.metricValue,
      dataPointText: `${item.metricValue.toFixed(0)}ms`,
    }));

  const throughputData = data
    .filter(item => item.metricName.includes('throughput'))
    .slice(-7)
    .map((item, index) => ({
      value: item.metricValue,
      dataPointText: `${item.metricValue.toFixed(0)}`,
    }));

  return (
    <View style={styles.chartContainer}>
      <LineChart
        data={responseTimeData}
        data2={throughputData}
        width={300}
        height={200}
        spacing={40}
        color={colors.customRed}
        color2={colors.primary}
        thickness={3}
        thickness2={3}
        dataPointsRadius={5}
        dataPointsRadius2={5}
        isAnimated
        animationDuration={1500}
        curved
        showVerticalLines
        verticalLinesColor={colors.border}
        yAxisThickness={1}
        yAxisColor={colors.border}
        xAxisThickness={1}
        xAxisColor={colors.border}
        yAxisTextStyle={{
          color: colors.mutedForeground,
          fontSize: 10,
        }}
        rulesColor={colors.border}
        backgroundColor={colors.card}
      />
      
      <View style={styles.multiLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.customRed }]} />
          <Text style={styles.legendText}>응답시간 (ms)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>처리량 (req/s)</Text>
        </View>
      </View>
    </View>
  );
}; 