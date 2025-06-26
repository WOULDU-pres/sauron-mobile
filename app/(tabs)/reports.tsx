/**
 * 리포트 화면 - React Native 버전
 * 웹의 ReportsView 구조를 React Native로 이식
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,

} from 'react-native';
import { Card, CardContent } from '~/components/ui/card';
import { colors, spacing } from '~/lib/tokens';
import { createTextStyle } from '~/lib/utils';
import { ChartSkeleton, SectionHeader } from '~/components/ui/common';

// ===== 데이터 타입 정의 (향후 차트 구현용) =====
// Note: These interfaces are kept for future chart implementation

// ===== 모의 데이터 =====
// Note: Data variables are currently unused but kept for future chart implementation

const estimatedCost = {
  amount: 125000,
  period: '이번 달',
};

// ChartSkeleton은 이제 ~/components/ui/common에서 import

// ===== 일일 리포트 컴포넌트 =====
const DailyReport: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const cardTitleStyle = createTextStyle('base', 'bold', 'foreground');

  if (isLoading) {
    return (
      <View>
        <SectionHeader title="일일 리포트" />
        <Card>
          <CardContent>
            <View style={{ height: 24, backgroundColor: colors.muted, borderRadius: 4, marginBottom: spacing.md }} />
            <ChartSkeleton height={200} />
          </CardContent>
        </Card>
      </View>
    );
  }

  return (
    <View>
      <SectionHeader title="일일 리포트" />
      <Card>
        <CardContent>
          <Text style={[cardTitleStyle, { marginBottom: spacing.md }]}>
            일일 이상 메시지 현황
          </Text>
          {/* 차트 영역 - 추후 차트 라이브러리로 교체 */}
          <View style={{
            height: 200,
            backgroundColor: colors.muted,
            borderRadius: 8,
            padding: spacing.md,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={createTextStyle('sm', 'medium', 'mutedForeground')}>
              막대 차트 영역
            </Text>
            <Text style={createTextStyle('xs', 'normal', 'mutedForeground')}>
              (추후 차트 라이브러리 연동)
            </Text>
          </View>
        </CardContent>
      </Card>
    </View>
  );
};

// ===== 주간 리포트 컴포넌트 =====
const WeeklyReport: React.FC = () => {
  const cardTitleStyle = createTextStyle('base', 'bold', 'foreground');

  return (
    <View>
      <SectionHeader title="주간 리포트" />
      <View style={{ gap: spacing.md }}>
        <Card>
          <CardContent>
            <Text style={[cardTitleStyle, { marginBottom: spacing.md }]}>
              주간 이상 메시지 현황
            </Text>
            <View style={{
              height: 200,
              backgroundColor: colors.muted,
              borderRadius: 8,
              padding: spacing.md,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={createTextStyle('sm', 'medium', 'mutedForeground')}>
                라인 차트 영역
              </Text>
            </View>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Text style={[cardTitleStyle, { marginBottom: spacing.md }]}>
              이상 메시지 유형별 분포 (최근 30일)
            </Text>
            <View style={{
              height: 250,
              backgroundColor: colors.muted,
              borderRadius: 8,
              padding: spacing.md,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={createTextStyle('sm', 'medium', 'mutedForeground')}>
                파이 차트 영역
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>
    </View>
  );
};

// ===== API 리포트 컴포넌트 =====
const ApiReport: React.FC = () => {
  const cardTitleStyle = createTextStyle('base', 'bold', 'foreground');
  const costAmountStyle = createTextStyle('3xl', 'bold', 'foreground');
  const costPeriodStyle = createTextStyle('sm', 'normal', 'mutedForeground');

  return (
    <View>
      <SectionHeader title="API 리포트" />
      <View style={{ gap: spacing.lg }}>
        {/* 예상 총 금액 */}
        <Card>
          <CardContent>
            <Text style={[createTextStyle('base', 'semibold', 'foreground'), { marginBottom: spacing.xs }]}>
              예상 총 금액
            </Text>
            <Text style={costAmountStyle}>
              {estimatedCost.amount.toLocaleString()}원
            </Text>
            <Text style={costPeriodStyle}>
              {estimatedCost.period} 사용량 기준
            </Text>
          </CardContent>
        </Card>
        
        {/* 사용량 분석 */}
        <View>
          <Text style={[createTextStyle('base', 'semibold', 'foreground'), { 
            marginBottom: spacing.sm, 
            paddingHorizontal: spacing.xs 
          }]}>
            사용량 분석
          </Text>
          <View style={{ gap: spacing.md }}>
            <Card>
              <CardContent>
                <Text style={[cardTitleStyle, { marginBottom: spacing.md }]}>
                  API 사용량 (최근 7일)
                </Text>
                <View style={{
                  height: 200,
                  backgroundColor: colors.muted,
                  borderRadius: 8,
                  padding: spacing.md,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={createTextStyle('sm', 'medium', 'mutedForeground')}>
                    라인 차트 영역
                  </Text>
                </View>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Text style={[cardTitleStyle, { marginBottom: spacing.md }]}>
                  시간대별 API 호출량
                </Text>
                <View style={{
                  height: 200,
                  backgroundColor: colors.muted,
                  borderRadius: 8,
                  padding: spacing.md,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={createTextStyle('sm', 'medium', 'mutedForeground')}>
                    막대 차트 영역
                  </Text>
                </View>
              </CardContent>
            </Card>
                     </View>
         </View>
       </View>
     </View>
  );
};

// ===== 메인 리포트 화면 컴포넌트 =====
export default function ReportsScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          padding: spacing.md,
          gap: spacing.xl,
          paddingBottom: spacing.xl 
        }}
      >
        <DailyReport />
        <WeeklyReport />
        <ApiReport />
      </ScrollView>
    </SafeAreaView>
  );
} 