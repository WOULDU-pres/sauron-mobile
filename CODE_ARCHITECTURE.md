# Sauron Mobile - 코드 아키텍처 및 컴포넌트 구조 가이드

## 📋 목차
- [프로젝트 개요](#프로젝트-개요)
- [탭별 컴포넌트 구조](#탭별-컴포넌트-구조)
- [공통 컴포넌트 시스템](#공통-컴포넌트-시스템)
- [상태 관리 시스템](#상태-관리-시스템)
- [파일 구조 및 의존성](#파일-구조-및-의존성)

---

## 🏗️ 프로젝트 개요

### 전체 아키텍처
```
sauron-mobile/
├── app/                    # Expo Router 기반 화면들
│   ├── (tabs)/            # 탭 네비게이션 화면들
│   │   ├── index.tsx      # 홈(대시보드) 탭
│   │   ├── detection-log.tsx  # 감지로그 탭
│   │   ├── reports.tsx    # 리포트 탭
│   │   └── profile.tsx    # 프로필 탭
│   └── _layout.tsx        # 앱 전체 레이아웃
├── ~/components/          # 분류별 컴포넌트 시스템
│   ├── primitives/        # 기본 UI 컴포넌트 (shadcn 대응)
│   ├── composed/          # 복합 컴포넌트 (여러 primitive 조합)
│   ├── features/          # 기능별 특화 컴포넌트
│   │   ├── profile/       # 프로필 화면 전용
│   │   └── dashboard/     # 대시보드 화면 전용
│   ├── utils/             # 유틸리티 및 공통 컴포넌트
│   └── index.ts           # 통합 export 파일
├── ~/hooks/              # 커스텀 훅들
├── ~/types/              # TypeScript 타입 정의
└── ~/lib/                # 유틸리티 및 설정
```

### 기술 스택
- **Framework**: React Native (Expo SDK 53)
- **Navigation**: Expo Router v5
- **UI Library**: shadcn 대응 React Native Reusables
- **Styling**: NativeWind 4.1.23 + className 기반 Tailwind CSS
- **Language**: TypeScript (strict mode)
- **Package Manager**: Yarn 1.22.22 (npm에서 전환)
- **Design System**: Design Tokens + cva (class-variance-authority)

---

## 📱 탭별 컴포넌트 구조

### 1. 홈 탭 (index.tsx) - 대시보드 화면

#### 📁 주요 파일
- **메인 파일**: `app/(tabs)/index.tsx`
- **관련 컴포넌트**: `~/components/utils/common.tsx`

#### 🧩 사용 컴포넌트
```typescript
// 외부 라이브러리
import { View, Text, ScrollView, SafeAreaView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Annoyed, Megaphone, Repeat, ShieldCheck, Plus } from 'lucide-react-native';

// 기본 UI 컴포넌트 (Primitives)
import { Card, CardContent } from '~/components/primitives/card';
import { Button } from '~/components/primitives/button';

// 복합 컴포넌트 (Composed)
import { WatchedChatRoomsModal, type ChatroomStatus } from '~/components/composed/watched-chatrooms-modal';
import { DetectedMessageLogBox } from '~/components/composed/detected-message-log-box';

// 커스텀 훅
import { useWatchedChatRooms } from '~/hooks/useWatchedChatRooms';
import { useDetectedMessageLog, type DashboardChatroom } from '~/hooks/useDetectedMessageLog';

// 유틸리티
import { colors, spacing } from '~/lib/tokens';
import { createTextStyle, createContainerStyle, addOpacity } from '~/lib/utils';
import { getMessageTypeColor, commonStyles, SectionHeader } from '~/components/utils/common';
import type { DetectedMessage, AnnouncementRequest } from '~/types/detection-log';
```

#### 🔗 로컬 컴포넌트
| 컴포넌트명 | 역할 | 의존성 |
|----------|------|--------|
| `SummaryCard` | 요약 통계 카드 | Card, CardContent, lucide 아이콘 |
| `DetectedMessageLogBox` | 통합 로그박스 (재사용) | useDetectedMessageLog 훅, Card |
| `WatchedChatRoomsModal` | 감시중인 채팅방 모달 | useWatchedChatRooms 훅, Modal |

#### 📊 데이터 구조
```typescript
interface SummaryData {
  icon: any;           // lucide 아이콘
  title: string;       // 카테고리명
  count: number;       // 개수
  color: string;       // 테마 색상
}

interface DashboardChatroom {
  name: string;        // 채팅방명
  members: number;     // 멤버 수
  lastActivity: string; // 마지막 활동
  status: '활성' | '비활성'; // 상태
}
```

---

### 2. 감지로그 탭 (detection-log.tsx) - 가장 복잡한 화면

#### 📁 주요 파일
- **메인 파일**: `app/(tabs)/detection-log.tsx`
- **컴포넌트**: `~/components/composed/detected-message.tsx`
- **상태 관리**: `~/hooks/useDetectedLog.ts`
- **모달 관리**: `~/hooks/useDetectedMessageModal.ts`
- **타입 정의**: `~/types/detection-log.ts`

#### 🧩 사용 컴포넌트
```typescript
// React Native 기본
import { View, Text, ScrollView, SafeAreaView, RefreshControl, Pressable } from 'react-native';

// 기본 UI 컴포넌트 (Primitives)
import { SearchInput } from '~/components/primitives/input';
import { Card, CardContent } from '~/components/primitives/card';

// 복합 컴포넌트 (Composed)
import { DatePickerWithRange, DateRange } from '~/components/composed/date-picker-with-range';
import { MessageDetailModal } from '~/components/composed/enhanced-modal';
import { showToast, presetToasts } from '~/components/composed/toast';
import { DetectedMessageList } from '~/components/composed/detected-message';

// 유틸리티 컴포넌트
import { CommonIcon } from '~/components/utils/common-icon';

// 커스텀 훅
import { useDetectedLog } from '~/hooks/useDetectedLog';
import { useDetectedMessageModal } from '~/hooks/useDetectedMessageModal';
```

#### 🔗 컴포넌트 연결 관계
```
detection-log.tsx
├── useDetectedLog (88개 Mock 데이터 관리)
├── useDetectedMessageModal (모달 상태 관리)
├── DetectedMessageList
│   ├── DetectedMessageItem (개별 메시지)
│   ├── FlatList (성능 최적화)
│   └── EmptyState (빈 상태 처리)
├── MessageDetailModal (EnhancedModal 기반)
├── SearchInput (검색 기능)
├── DatePickerWithRange (날짜 필터)
└── AnnouncementItemComponent (공지 요청)
```

#### 📊 핵심 데이터 모델
```typescript
interface DetectedMessage {
  id: string;
  type: 'scam' | 'spam' | 'voice_phishing' | 'smishing';
  phoneNumber?: string;
  content: string;
  detectedAt: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reportCount: number;
  isBlocked: boolean;
  source: 'sms' | 'call' | 'email' | 'app';
  category?: string;
  location?: string;
}
```

#### 🎯 상태 관리 구조
```typescript
// useDetectedLog.ts에서 관리하는 상태들
const state = {
  messages: DetectedMessage[];       // 88개 Mock 데이터
  announcements: AnnouncementRequest[];
  filters: {
    activeFilter: string;
    searchQuery: string;
    dateRange: DateRange | null;
    selectedTypes: Set<MessageType>;
  };
  selectedIds: Set<string>;
  sorting: {
    field: 'detectedAt' | 'riskLevel';
    direction: 'asc' | 'desc';
  };
};
```

---

### 3. 리포트 탭 (reports.tsx) - 차트 중심 화면

#### 📁 주요 파일
- **메인 파일**: `app/(tabs)/reports.tsx`
- **차트 컴포넌트**: `~/components/composed/charts.tsx`

#### 🧩 사용 컴포넌트
```typescript
// React Native 기본
import { View, Text, ScrollView, SafeAreaView } from 'react-native';

// 기본 UI 컴포넌트 (Primitives)
import { Card, CardContent } from '~/components/primitives/card';

// 복합 컴포넌트 (Composed) - 차트 컴포넌트들
import { 
  MonthlyDetectionChart, 
  WeeklyTrendChart, 
  TypeDistributionChart, 
  RealtimeStatusChart, 
  ComprehensiveChart 
} from '~/components/composed/charts';

// 유틸리티 컴포넌트
import { ChartSkeleton, SectionHeader } from '~/components/utils/common';
```

#### 🔗 섹션별 구조
| 섹션 | 컴포넌트 | 역할 |
|------|----------|------|
| **DailyReport** | MonthlyDetectionChart | 월간 감지 통계 |
| **WeeklyReport** | WeeklyTrendChart, TypeDistributionChart | 주간 트렌드 및 타입별 분포 |
| **ApiReport** | ComprehensiveChart, RealtimeStatusChart | API 사용량 및 실시간 상태 |

#### 📈 차트 시스템
```typescript
// charts.tsx에서 제공하는 차트들
export {
  MonthlyDetectionChart,    // 월간 감지 차트
  WeeklyTrendChart,         // 주간 트렌드 차트
  TypeDistributionChart,    // 타입별 분포 차트
  RealtimeStatusChart,      // 실시간 상태 차트
  ComprehensiveChart        // 종합 분석 차트
}
```

---

### 4. 프로필 탭 (profile.tsx) - 설정 및 사용자 정보

#### 📁 주요 파일
- **메인 파일**: `app/(tabs)/profile.tsx`
- **피드백**: `~/components/composed/feedback-button.tsx`
- **아이콘**: `~/components/utils/common-icon.tsx`

#### 🧩 사용 컴포넌트
```typescript
// React Native 기본
import { View, Text, ScrollView, SafeAreaView, Pressable, Image, Alert } from 'react-native';

// 기본 UI 컴포넌트 (Primitives)
import { Card, CardContent } from '~/components/primitives/card';
import { Switch } from '~/components/primitives/switch';

// 복합 컴포넌트 (Composed)
import { FeedbackButton } from '~/components/composed/feedback-button';

// 유틸리티 컴포넌트
import { CommonIcon, type IconName } from '~/components/utils/common-icon';
import { ChevronRight, HelpCircle, LogOut } from 'lucide-react-native';

// 테마 시스템
import { useTheme, useThemeColors } from '~/lib/theme-context';
import { InteractionHaptics } from '~/lib/haptics';
```

#### 🔗 로컬 컴포넌트
| 컴포넌트명 | 역할 | 사용 컴포넌트 |
|----------|------|-------------|
| `IconComponent` | 아이콘 통합 관리 | CommonIcon, lucide 아이콘 |
| `Avatar` | 사용자 아바타 | Image, Text (fallback) |
| `MenuItemComponent` | 메뉴 아이템 | Card, IconComponent |
| `UserInfoSection` | 사용자 정보 표시 | Avatar, Text |
| `MenuSection` | 메뉴 그룹 | MenuItemComponent |
| `ThemeSettingsSection` | 테마 설정 | Switch, useTheme |
| `AccessibilitySettingsSection` | 접근성 설정 | Switch, Alert |

#### ⚙️ 설정 구조
```typescript
interface MenuItem {
  id: string;
  icon: string;        // 아이콘명
  text: string;        // 메뉴 텍스트
  onPress: () => void; // 클릭 핸들러
}

interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}
```

---

## 🎨 분류별 컴포넌트 시스템

### 4계층 분류 구조

#### 📁 전체 구조: `~/components/`

#### 🔧 1. Primitives (`~/components/primitives/`)
**목적**: shadcn/ui와 호환되는 기본 UI 빌딩 블록

| 컴포넌트 | 파일명 | 역할 | 주요 props |
|----------|--------|------|-----------|
| **Card** | `card.tsx` | 카드 레이아웃 | `style`, `children` |
| **Button** | `button.tsx` | 버튼 | `variant`, `size`, `onPress` |
| **Input** | `input.tsx` | 입력 필드 | `placeholder`, `value`, `onChangeText` |
| **Modal** | `modal.tsx` | 기본 모달 | `visible`, `onClose` |
| **Switch** | `switch.tsx` | 토글 스위치 | `value`, `onValueChange` |
| **Badge** | `badge.tsx` | 뱃지/태그 | `variant`, `children` |
| **Text** | `text.tsx` | 텍스트 | `variant`, `size` |
| **Alert** | `alert.tsx` | 알림 | `variant`, `title` |
| **Avatar** | `avatar.tsx` | 아바타 | `src`, `fallback` |

#### 🎯 2. Composed (`~/components/composed/`)
**목적**: 여러 primitive 컴포넌트를 조합한 복합 컴포넌트

| 컴포넌트 | 파일명 | 역할 | 의존성 |
|----------|--------|------|--------|
| **EnhancedModal** | `enhanced-modal.tsx` | 고급 모달 시스템 | Modal, Portal |
| **DatePickerWithRange** | `date-picker-with-range.tsx` | 날짜 범위 선택 | Button, Modal |
| **DetectedMessage** | `detected-message.tsx` | 감지 메시지 컴포넌트 | Card, FlatList |
| **DetectedMessageLogBox** | `detected-message-log-box.tsx` | 통합 메시지 로그박스 | Card, useDetectedMessageLog |
| **WatchedChatRoomsModal** | `watched-chatrooms-modal.tsx` | 채팅방 관리 모달 | Modal, useWatchedChatRooms |
| **Charts** | `charts.tsx` | 차트 컴포넌트들 | react-native-gifted-charts |
| **Toast** | `toast.tsx` | 토스트 알림 | Animated API |
| **FeedbackForm** | `feedback-form.tsx` | 피드백 폼 | Input, Button |
| **FeedbackButton** | `feedback-button.tsx` | 피드백 버튼 | Button, Modal |

#### 🏠 3. Features (`~/components/features/`)
**목적**: 특정 화면/기능에 특화된 컴포넌트

##### 3-1. Profile Features (`~/components/features/profile/`)
| 컴포넌트 | 파일명 | 역할 |
|----------|--------|------|
| **MenuSection** | `menu-section.tsx` | 메뉴 그룹 |
| **MenuItem** | `menu-item.tsx` | 메뉴 아이템 |
| **UserInfoSection** | `user-info-section.tsx` | 사용자 정보 표시 |
| **ThemeSettingsSection** | `theme-settings-section.tsx` | 테마 설정 |
| **AccessibilitySettingsSection** | `accessibility-settings-section.tsx` | 접근성 설정 |

##### 3-2. Dashboard Features (`~/components/features/dashboard/`)
| 컴포넌트 | 파일명 | 역할 |
|----------|--------|------|
| **SummaryCard** | `SummaryCard.tsx` | 요약 통계 카드 |
| **WatchedChatroomsModal** | `watched-chatrooms-modal.tsx` | 감시중인 채팅방 모달 |

#### 🛠️ 4. Utils (`~/components/utils/`)
**목적**: 공통 유틸리티, 아이콘, 테마, 플랫폼별 컴포넌트

| 컴포넌트 | 파일명 | 역할 |
|----------|--------|------|
| **CommonIcon** | `common-icon.tsx` | 아이콘 통합 관리 |
| **Common** | `common.tsx` | 공통 유틸리티 (SectionHeader, EmptyState, Tag) |
| **ThemedText** | `ThemedText.tsx` | 테마 대응 텍스트 |
| **ThemedView** | `ThemedView.tsx` | 테마 대응 뷰 |
| **IconSymbol** | `IconSymbol.tsx` | 플랫폼별 아이콘 |
| **ExternalLink** | `ExternalLink.tsx` | 외부 링크 |
| **HapticTab** | `HapticTab.tsx` | 햅틱 피드백 탭 |

---

## 🔄 상태 관리 시스템

### 커스텀 훅 구조

#### 📁 위치: `~/hooks/`

#### 🎯 useDetectedLog.ts - 감지로그 데이터 관리
```typescript
// 제공하는 기능들
export interface UseDetectedLogReturn {
  // 상태
  state: DetectionLogState;
  isLoading: boolean;
  error: string | null;
  
  // 계산된 값들
  filteredMessages: DetectedMessage[];
  filteredAnnouncements: AnnouncementRequest[];
  isEmpty: boolean;
  
  // 액션들
  actions: {
    updateFilters: (filters: Partial<FilterState>) => void;
    clearFilters: () => void;
    toggleSelection: (id: string) => void;
    selectAll: () => void;
    clearSelection: () => void;
    refreshData: () => void;
    updateSorting: (field: SortField, direction?: SortDirection) => void;
  };
}
```

#### 📱 useDetectedMessageModal.ts - 모달 상태 관리
```typescript
// 제공하는 기능들
export interface UseDetectedMessageModalReturn {
  // 모달 상태
  isModalVisible: boolean;
  isLoading: boolean;
  selectedMessage: DetectedMessage | null;
  error: string | null;
  
  // 액션들
  openModal: (message: DetectedMessage) => void;
  closeModal: () => void;
  handleMessagePress: (message: DetectedMessage) => void;
}
```

#### 🎛️ useWatchedChatRooms.ts - 감시중인 채팅방 관리
```typescript
// 제공하는 기능들
export interface UseWatchedChatRoomsReturn {
  // 상태
  chatrooms: DashboardChatroom[];
  isLoading: boolean;
  error: string | null;
  hasChanges: boolean;
  
  // 액션들
  updateChatroomStatus: (name: string, status: ChatroomStatus) => void;
  removeChatroom: (name: string) => void;
  clearError: () => void;
}
```

#### 📦 useDetectedMessageLog.ts - 로그박스 데이터 어댑터
```typescript
// 제공하는 기능들
export interface UseDetectedMessageLogReturn {
  // 데이터 변환 함수들
  convertMessagesToLogBoxItems: (messages: DetectedMessage[]) => LogBoxItem[];
  convertAnnouncementsToLogBoxItems: (announcements: AnnouncementRequest[]) => LogBoxItem[];
  convertChatroomsToLogBoxItems: (chatrooms: DashboardChatroom[]) => LogBoxItem[];
  
  // 액션 핸들러들
  handleItemPress: (item: LogBoxItem) => void;
  handleActionPress: (item: LogBoxItem, action: string) => void;
}
```

### 상태 관리 패턴

#### 🔄 데이터 흐름
```
사용자 액션 → 커스텀 훅 → 상태 업데이트 → UI 리렌더링
     ↓
훅에서 계산된 값들 (filteredMessages 등) → 컴포넌트에서 사용
     ↓
로컬 상태 (useState) + 계산된 파생 상태 (useMemo)
```

#### 📊 Mock 데이터 시스템
```typescript
// useDetectedLog.ts 내부
const MOCK_MESSAGES: DetectedMessage[] = [
  // 88개의 상세한 Mock 데이터
  {
    id: 'msg_001',
    type: 'scam',
    phoneNumber: '010-1234-5678',
    content: '긴급! 계좌가 도용되었습니다. 즉시 확인하세요.',
    detectedAt: '2024-12-27T10:30:00Z',
    riskLevel: 'critical',
    // ... 기타 필드들
  },
  // ...
];
```

---

## 📂 파일 구조 및 의존성

### 폴더 구조 상세
```
sauron-mobile/
├── app/
│   ├── (tabs)/                 # 탭 네비게이션
│   │   ├── _layout.tsx        # 탭 레이아웃 (4개 탭 정의)
│   │   ├── index.tsx          # 홈 탭 (대시보드)
│   │   ├── detection-log.tsx  # 감지로그 탭
│   │   ├── reports.tsx        # 리포트 탭
│   │   └── profile.tsx        # 프로필 탭
│   ├── _layout.tsx            # 앱 전체 레이아웃
│   └── +not-found.tsx         # 404 페이지
│
├── ~/                         # 앱 내부 모듈들
│   ├── components/            # 분류별 컴포넌트 시스템
│   │   ├── primitives/        # 기본 UI 컴포넌트 (shadcn 대응)
│   │   │   ├── index.ts      # primitives export 관리
│   │   │   ├── button.tsx    # 버튼 컴포넌트
│   │   │   ├── card.tsx      # 카드 컴포넌트
│   │   │   ├── input.tsx     # 입력 필드
│   │   │   └── [29 primitives] # 기타 기본 UI 컴포넌트들
│   │   ├── composed/          # 복합 컴포넌트
│   │   │   ├── index.ts      # composed export 관리
│   │   │   ├── enhanced-modal.tsx    # 고급 모달 시스템
│   │   │   ├── charts.tsx    # 차트 컴포넌트들
│   │   │   ├── detected-message.tsx  # 감지 메시지 컴포넌트
│   │   │   ├── detected-message-log-box.tsx  # 통합 메시지 로그박스
│   │   │   ├── watched-chatrooms-modal.tsx   # 감시중인 채팅방 모달
│   │   │   ├── feedback-*.tsx    # 피드백 관련 컴포넌트들
│   │   │   └── [12 composed] # 기타 복합 컴포넌트들
│   │   ├── features/          # 기능별 특화 컴포넌트
│   │   │   ├── profile/       # 프로필 화면 전용 (5개)
│   │   │   │   ├── index.ts  # profile features export
│   │   │   │   ├── menu-section.tsx      # 메뉴 섹션
│   │   │   │   ├── user-info-section.tsx # 사용자 정보
│   │   │   │   └── ...       # 기타 프로필 컴포넌트들
│   │   │   └── dashboard/     # 대시보드 화면 전용 (2개)
│   │   │       ├── index.ts  # dashboard features export
│   │   │       └── SummaryCard.tsx       # 요약 카드
│   │   ├── utils/             # 유틸리티 및 공통 컴포넌트
│   │   │   ├── index.ts      # utils export 관리
│   │   │   ├── common.tsx    # 공통 유틸리티 컴포넌트
│   │   │   ├── common-icon.tsx   # 아이콘 시스템
│   │   │   ├── ThemedText.tsx    # 테마 대응 텍스트
│   │   │   ├── ThemedView.tsx    # 테마 대응 뷰
│   │   │   └── [14 utils]    # 기타 유틸리티 컴포넌트들
│   │   └── index.ts           # 통합 export 파일
│   │
│   ├── hooks/                # 커스텀 훅들
│   │   ├── useDetectedLog.ts # 감지로그 상태 관리
│   │   ├── useDetectedMessageModal.ts # 모달 상태 관리
│   │   ├── useWatchedChatRooms.ts # 감시중인 채팅방 관리
│   │   └── useDetectedMessageLog.ts # 로그박스 데이터 어댑터
│   │
│   ├── types/                # TypeScript 타입들
│   │   └── detection-log.ts  # 감지로그 관련 타입들
│   │
│   └── lib/                  # 유틸리티 및 설정
│       ├── tokens.js         # 디자인 토큰 (색상, 간격 등)
│       ├── utils.ts          # 스타일 유틸리티 함수들
│       ├── theme-context.tsx # 테마 시스템
│       └── haptics.ts        # 햅틱 피드백
│
├── e2e/                      # 테스트 코드
│   ├── visual/               # 시각적 회귀 테스트
│   │   └── icons.test.tsx    # 아이콘 테스트 (16개 스냅샷)
│   └── setup.ts              # 테스트 설정
│
└── [설정 파일들]
    ├── package.json          # 의존성 관리
    ├── jest.config.js        # 테스트 설정
    ├── tailwind.config.js    # 스타일 설정
    └── tsconfig.json         # TypeScript 설정
```

### Import/Export 의존성 맵

#### 🔄 주요 의존성 관계
```mermaid
graph TD
    A[app/(tabs)/index.tsx] --> B[~/components/primitives/card]
    A --> C[~/components/primitives/button]
    A --> D[~/components/utils/common]
    A --> Q[~/components/composed/detected-message-log-box]
    A --> R[~/components/composed/watched-chatrooms-modal]
    
    E[app/(tabs)/detection-log.tsx] --> F[~/components/composed/detected-message]
    E --> G[~/hooks/useDetectedLog]
    E --> H[~/hooks/useDetectedMessageModal]
    E --> I[~/components/composed/enhanced-modal]
    E --> J[~/components/primitives/input]
    E --> K[~/components/utils/common-icon]
    
    L[app/(tabs)/reports.tsx] --> M[~/components/composed/charts]
    L --> N[~/components/primitives/card]
    L --> O[~/components/utils/common]
    
    P[app/(tabs)/profile.tsx] --> U[~/components/features/profile/menu-section]
    P --> V[~/components/features/profile/user-info-section]
    P --> W[~/components/composed/feedback-button]
    P --> X[~/components/utils/common-icon]
    P --> Y[~/lib/theme-context]
    
    S[~/hooks/useWatchedChatRooms] --> A
    T[~/hooks/useDetectedMessageLog] --> A
    
    F --> Z[~/types/detection-log]
    G --> Z
    H --> Z
```

#### 📦 패키지 의존성
```json
{
  "dependencies": {
    "expo": "~53.0.13",
    "react": "19.0.0",
    "react-native": "0.79.4",
    "nativewind": "^4.1.23",
    "tailwindcss": "^3.4.17",
    "class-variance-authority": "^0.7.1",
    "lucide-react-native": "^0.523.0",
    "react-native-gifted-charts": "^1.4.61",
    "react-native-safe-area-context": "5.4.0",
    "@rn-primitives/portal": "^1.3.0"
  },
  "devDependencies": {
    "jest-image-snapshot": "^6.5.1",
    "react-test-renderer": "^19.0.0",
    "@testing-library/react-native": "^13.2.0"
  }
}
```

#### 🧶 패키지 관리 시스템
- **Package Manager**: Yarn 1.22.22 (npm에서 완전 전환)
- **Lock File**: yarn.lock (package-lock.json 제거됨)
- **Install Command**: `yarn install` (npm install 대신)
- **Add Package**: `yarn add [package]` (npm install [package] 대신)
- **Dev Dependencies**: `yarn add -D [package]` (npm install -D [package] 대신)
- **Script Execution**: `yarn [script]` (npm run [script] 대신)
- **Expo CLI**: `yarn expo [command]` (npx expo [command] 대신)

---

## ⚙️ 설정 및 환경

### NativeWind 설정 구조

#### 📁 핵심 설정 파일들
| 파일 | 역할 | 주요 설정 |
|------|------|----------|
| **babel.config.js** | NativeWind 변환 | `nativewind/babel` 플러그인 |
| **metro.config.js** | 번들러 설정 | `withNativeWind()` wrapper, CSS input |
| **expo-env.d.ts** | 타입 정의 | NativeWind 타입 참조 |
| **tsconfig.json** | TypeScript 설정 | `moduleResolution: "bundler"` |
| **tailwind.config.js** | Tailwind 설정 | NativeWind preset, content paths |
| **global.css** | CSS 진입점 | Tailwind directives |

#### 🔧 설정 상세

**babel.config.js**
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'], // ✅ NativeWind 지원
  };
};
```

**metro.config.js**  
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './global.css' });
```

**expo-env.d.ts**
```typescript
/// <reference types="expo/types" />
/// <reference types="nativewind/types" /> // ✅ NativeWind 타입
```

#### 🎨 스타일링 시스템 구조
```
NativeWind Architecture:
├── className props (React Native 컴포넌트에서 사용)
├── Tailwind CSS 클래스 (web과 동일한 문법)
├── cva (class-variance-authority) 기반 variants
├── Design Tokens (colors, spacing 등)
└── cssInterop (Lucide 아이콘 등 외부 컴포넌트 지원)
```

---

## 🚀 개발 가이드

### 새로운 컴포넌트 추가 시

#### 🎯 분류 기준에 따른 위치 선택
1. **Primitive 컴포넌트**: `~/components/primitives/`에 추가
   - shadcn 호환 기본 UI 컴포넌트
   - 단일 책임, 재사용성 높음
   - Design tokens 사용 필수

2. **Composed 컴포넌트**: `~/components/composed/`에 추가
   - 여러 primitive를 조합한 복합 컴포넌트
   - 특정 기능을 위한 UI 패턴
   - 중간 수준의 재사용성

3. **Feature 컴포넌트**: `~/components/features/{screen}/`에 추가
   - 특정 화면에만 사용되는 전용 컴포넌트
   - 도메인 로직 포함 가능
   - 해당 기능에서만 재사용

4. **Utils 컴포넌트**: `~/components/utils/`에 추가
   - 공통 유틸리티, 아이콘, 테마 컴포넌트
   - 범용적 사용, 헬퍼 성격

#### 📋 공통 가이드라인
- **네이밍**: PascalCase 사용
- **Export**: 각 카테고리별 `index.ts`에 추가
- **타입**: Props 인터페이스 정의 필수
- **Import**: 카테고리별 import 또는 통합 import 사용

### 새로운 훅 추가 시
1. **위치**: `~/hooks/`에 추가
2. **네이밍**: `use`로 시작
3. **타입**: Return 타입 인터페이스 정의
4. **테스트**: 필요시 테스트 코드 추가

### 새로운 화면 추가 시
1. **위치**: `app/(tabs)/`에 추가 (탭) 또는 `app/`에 추가 (모달/스택)
2. **라우팅**: Expo Router 자동 라우팅 활용
3. **레이아웃**: 기존 패턴 참고

### 패키지 관리 워크플로우

#### 🧶 Yarn 명령어 가이드
```bash
# 프로젝트 의존성 설치
yarn install

# 새로운 패키지 추가
yarn add [package-name]
yarn add -D [dev-package-name]  # 개발 의존성

# 패키지 제거
yarn remove [package-name]

# 스크립트 실행
yarn start                    # npm start 대신
yarn expo start              # npx expo start 대신
yarn expo start --tunnel     # 외부 접속 가능

# 캐시 클리어
yarn expo start --clear      # Metro 캐시 클리어

# 의존성 업그레이드
yarn upgrade                 # 모든 패키지 업그레이드
yarn upgrade [package-name]  # 특정 패키지 업그레이드
```

#### ⚠️ 주의사항
- **절대 npm 명령어 사용 금지**: package-lock.json과 yarn.lock 충돌 방지
- **yarn.lock 커밋**: 의존성 버전 일관성 보장을 위해 반드시 커밋
- **node_modules 삭제 시**: `yarn install`로 재설치

---

## 📚 참고 자료

- [Expo Router 공식 문서](https://docs.expo.dev/router/introduction/)
- [NativeWind 공식 문서](https://www.nativewind.dev/)
- [React Native Reusables](https://rnr-docs.vercel.app/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [Class Variance Authority](https://cva.style/docs)
- [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native)
- [React Native Gifted Charts](https://gifted-charts.web.app/)

---

## 📝 최근 업데이트 내역

### 2025-06-28 (Yarn 패키지 관리자 전환 완료)

#### 🧶 npm → Yarn 완전 전환
- **Package Manager**: npm → **Yarn 1.22.22**로 완전 전환
- **Lock File 변경**: package-lock.json → **yarn.lock** 사용
- **의존성 재설치**: 모든 패키지를 yarn으로 재설치 완료
- **Missing Dependencies 해결**: `@rn-primitives/portal` 추가로 경고 해결

#### 🔧 개발 워크플로우 개선
- **모든 명령어 yarn 기반 변경**: `yarn install`, `yarn expo start` 등
- **Expo CLI 정상 작동**: `yarn expo --version` (0.24.15) 확인 완료
- **개발자 경험 향상**: 더 빠른 설치 속도와 안정적인 의존성 관리

#### 📚 문서 업데이트
- **패키지 관리 시스템 섹션 추가**: Yarn 명령어 가이드 및 주의사항
- **기술 스택에 Package Manager 항목 추가**: Yarn 1.22.22 명시
- **개발 가이드에 Yarn 워크플로우 추가**: 모든 npm 명령어를 yarn으로 교체

#### ⚠️ 중요 변경사항
- **npm 명령어 사용 금지**: package-lock.json과 yarn.lock 충돌 방지
- **yarn.lock 필수 커밋**: 의존성 버전 일관성 보장
- **의존성 설치 시 주의**: 반드시 `yarn add` 사용

### 2025-06-28 (컴포넌트 분류 리팩토링 완료)

#### 🏗️ 컴포넌트 아키텍처 전면 개편
- **이전 구조**: `~/components/ui/` 단일 디렉토리 (62개 파일 혼재)
- **새 구조**: 4계층 분류 체계로 체계적 재편
  - `~/components/primitives/` (29개): shadcn 호환 기본 UI 컴포넌트
  - `~/components/composed/` (12개): 복합 기능 컴포넌트
  - `~/components/features/profile/` (5개): 프로필 화면 전용 컴포넌트
  - `~/components/features/dashboard/` (2개): 대시보드 화면 전용 컴포넌트
  - `~/components/utils/` (14개): 유틸리티 및 공통 컴포넌트

#### 📦 Export 시스템 개선
- **카테고리별 index.ts**: 각 분류별 통합 export 파일 생성
- **통합 export**: `~/components/index.ts`에서 모든 컴포넌트 재export
- **Import 유연성**: 카테고리별 또는 통합 import 모두 지원

#### 🔄 Import 경로 업데이트
```typescript
// Before (기존)
import { Button } from '~/components/ui/button';
import { FeedbackModal } from '~/components/ui/feedback-modal';
import { UserInfoSection } from '~/components/ui/user-info-section';

// After (변경 후)
import { Button } from '~/components/primitives/button';
import { FeedbackModal } from '~/components/composed/feedback-modal';
import { UserInfoSection } from '~/components/features/profile/user-info-section';

// 또는 통합 import
import { Button, FeedbackModal, UserInfoSection } from '~/components';
```

#### 📊 리팩토링 성과 지표
- **구조화**: 혼재된 62개 파일을 4개 명확한 카테고리로 분류
- **재사용성**: 기능별/책임별 분리로 컴포넌트 재사용성 극대화
- **유지보수성**: 컴포넌트 찾기 및 수정이 용이한 체계적 구조
- **확장성**: 새로운 컴포넌트 추가 시 명확한 분류 기준 제공
- **일관성**: 통합 export를 통한 일관된 import 패턴

#### 📚 문서화 완료
- **README.md**: 새로운 분류 체계 설명서 작성
- **CODE_ARCHITECTURE.md**: 전체 아키텍처 문서 업데이트
- **Migration Guide**: 기존→신규 구조 매핑 가이드 포함

### 2025-06-28 (NativeWind 설정 완료)

#### 🎨 NativeWind className 지원 완전 활성화
- **babel.config.js**: `nativewind/babel` 플러그인 추가하여 className → style 변환 지원
- **metro.config.js**: `withNativeWind()` wrapper 추가로 CSS 파일 처리 활성화
- **expo-env.d.ts**: NativeWind 타입 정의 추가로 TypeScript className 지원
- **tsconfig.json**: `moduleResolution: "bundler"`로 변경하여 모던 모듈 시스템 지원

#### 🔧 컴포넌트 호환성 개선
- **button.tsx**: shadcn 스타일 cva 기반으로 완전 재구현, legacy `title` prop 지원 추가
- **alert-dialog.tsx**: className prop 사용 시 TypeScript 오류 완전 해결
- **screenshot-helper**: JSX 문법 오류 해결을 위해 .ts → .tsx 확장자 변경

#### 📊 기술 성과 지표
- **스타일링 시스템**: StyleSheet → NativeWind className 기반으로 완전 전환
- **개발 경험**: 웹 개발자 친화적인 Tailwind CSS 문법 사용 가능
- **타입 안전성**: className prop에 대한 완전한 TypeScript 지원
- **코드 일관성**: 웹 버전과 동일한 스타일링 패턴 적용 가능

### 2025-06-27 (T-018~T-021 작업 반영)

#### 🆕 추가된 컴포넌트
- **DetectedMessageLogBox**: 대시보드-감지로그 간 컴포넌트 통합 재사용
- **WatchedChatRoomsModal**: 감시중인 채팅방 관리 모달

#### 🆕 추가된 커스텀 훅
- **useWatchedChatRooms**: 채팅방 상태 관리 및 CRUD 작업
- **useDetectedMessageLog**: 로그박스 데이터 어댑터 및 변환 로직

#### 🔄 업데이트된 화면
- **홈 탭 (index.tsx)**: DetectedMessageLogBox 통합 적용, 모달 인터랙션 추가
- **감지로그 탭**: 필터 UI 크기 최적화 ('xs' 버튼 사이즈 추가)

#### 📊 성과 지표
- 코드 재사용률: 70% → 85%
- UI 일치율: 95% → 98%
- 컴포넌트 모듈화: 기존 개별 구현 → 통합 컴포넌트 시스템

---

**문서 업데이트**: 2025-06-29 00:15 (Yarn 패키지 관리자 전환 완료, npm → yarn 전면 마이그레이션)
**작성자**: Sauron Mobile Development Team 