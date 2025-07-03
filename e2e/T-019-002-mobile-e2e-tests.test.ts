/**
 * Sauron Mobile E2E Test Suite
 *
 * T-019-002 완료 - Mobile App E2E 테스트 구현
 *
 * 테스트 범위:
 * - UI 네비게이션 및 사용자 플로우
 * - Backend API 통신 및 응답 처리
 * - 오프라인/에러 시나리오 처리
 * - 시뮬레이션 모드 UI 테스트
 * - 성능 및 메모리 사용량 테스트
 */

import { by, device, element, expect, waitFor } from "detox";

describe("Sauron Mobile E2E Test Suite", () => {
  beforeAll(async () => {
    console.log("🚀 Starting Sauron Mobile E2E Tests");
    await device.launchApp({
      permissions: { notifications: "YES" },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  // ========== Phase 1: 기본 네비게이션 및 UI 테스트 ==========

  describe("기본 네비게이션 및 UI", () => {
    it("앱이 성공적으로 시작되고 홈 화면이 표시되어야 함", async () => {
      await expect(element(by.id("home-screen"))).toBeVisible();
      await expect(element(by.text("Sauron"))).toBeVisible();

      // 기본 탭들이 표시되는지 확인
      await expect(element(by.id("tab-home"))).toBeVisible();
      await expect(element(by.id("tab-detection-log"))).toBeVisible();
      await expect(element(by.id("tab-reports"))).toBeVisible();
      await expect(element(by.id("tab-profile"))).toBeVisible();
    });

    it("모든 탭 간 네비게이션이 정상 동작해야 함", async () => {
      // Detection Log 탭
      await element(by.id("tab-detection-log")).tap();
      await expect(element(by.id("detection-log-screen"))).toBeVisible();

      // Reports 탭
      await element(by.id("tab-reports")).tap();
      await expect(element(by.id("reports-screen"))).toBeVisible();

      // Profile 탭
      await element(by.id("tab-profile")).tap();
      await expect(element(by.id("profile-screen"))).toBeVisible();

      // 홈으로 돌아가기
      await element(by.id("tab-home")).tap();
      await expect(element(by.id("home-screen"))).toBeVisible();
    });

    it("Detection Log 화면에 메시지 리스트가 표시되어야 함", async () => {
      await element(by.id("tab-detection-log")).tap();

      // 메시지 로그 컨테이너 확인
      await expect(element(by.id("detected-message-list"))).toBeVisible();

      // 필터 옵션들 확인
      await expect(element(by.id("filter-all"))).toBeVisible();
      await expect(element(by.id("filter-spam"))).toBeVisible();
      await expect(element(by.id("filter-advertisement"))).toBeVisible();
      await expect(element(by.id("filter-normal"))).toBeVisible();
    });
  });

  // ========== Phase 2: 시뮬레이션 모드 테스트 ==========

  describe("시뮬레이션 모드", () => {
    beforeEach(async () => {
      // 시뮬레이션 모드 활성화
      await element(by.id("tab-profile")).tap();
      await element(by.id("settings-simulation-mode")).tap();
      await element(by.id("toggle-simulation-mode")).tap();
      await element(by.text("확인")).tap();
    });

    it("시뮬레이션 메시지가 생성되고 표시되어야 함", async () => {
      await element(by.id("tab-home")).tap();

      // 시뮬레이션 메시지 생성 버튼
      await expect(element(by.id("generate-simulation-message"))).toBeVisible();
      await element(by.id("generate-simulation-message")).tap();

      // 메시지 타입 선택
      await element(by.id("simulation-type-spam")).tap();
      await element(by.id("confirm-generate")).tap();

      // Detection Log에서 확인
      await element(by.id("tab-detection-log")).tap();
      await waitFor(element(by.id("message-item-0")))
        .toBeVisible()
        .withTimeout(5000);

      // 스팸 메시지로 분류되었는지 확인
      await expect(
        element(by.id("message-type-spam")).atIndex(0)
      ).toBeVisible();
    });

    it("다양한 메시지 타입의 시뮬레이션이 정상 동작해야 함", async () => {
      const messageTypes = ["normal", "spam", "advertisement", "announcement"];

      for (const type of messageTypes) {
        await element(by.id("tab-home")).tap();
        await element(by.id("generate-simulation-message")).tap();
        await element(by.id(`simulation-type-${type}`)).tap();
        await element(by.id("confirm-generate")).tap();

        // 짧은 대기 후 다음 메시지 생성
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Detection Log에서 모든 타입 확인
      await element(by.id("tab-detection-log")).tap();
      await expect(
        element(by.id("message-type-normal")).atIndex(0)
      ).toBeVisible();
      await expect(
        element(by.id("message-type-spam")).atIndex(0)
      ).toBeVisible();
      await expect(
        element(by.id("message-type-advertisement")).atIndex(0)
      ).toBeVisible();
      await expect(
        element(by.id("message-type-announcement")).atIndex(0)
      ).toBeVisible();
    });

    it("시뮬레이션 통계가 올바르게 표시되어야 함", async () => {
      await element(by.id("tab-reports")).tap();

      // 시뮬레이션 모드 배너 확인
      await expect(element(by.id("simulation-mode-banner"))).toBeVisible();
      await expect(element(by.text("시뮬레이션 모드"))).toBeVisible();

      // 통계 카드들 확인
      await expect(element(by.id("total-messages-card"))).toBeVisible();
      await expect(element(by.id("spam-detected-card"))).toBeVisible();
      await expect(element(by.id("ads-detected-card"))).toBeVisible();
      await expect(element(by.id("announcements-card"))).toBeVisible();
    });
  });

  // ========== Phase 3: API 통신 테스트 ==========

  describe("API 통신 및 데이터 처리", () => {
    beforeEach(async () => {
      // 시뮬레이션 모드 비활성화
      await element(by.id("tab-profile")).tap();
      await element(by.id("settings-simulation-mode")).tap();
      await element(by.id("toggle-simulation-mode")).tap();
    });

    it("서버 연결 상태가 올바르게 표시되어야 함", async () => {
      await element(by.id("tab-home")).tap();

      // 연결 상태 표시 확인
      await expect(element(by.id("connection-status"))).toBeVisible();

      // 연결 테스트 버튼
      await element(by.id("test-connection")).tap();
      await waitFor(element(by.id("connection-success")))
        .toBeVisible()
        .withTimeout(10000);
    });

    it("메시지 전송 기능이 정상 동작해야 함", async () => {
      await element(by.id("tab-home")).tap();

      // 테스트 메시지 전송
      await element(by.id("test-message-input")).typeText(
        "테스트 메시지입니다"
      );
      await element(by.id("send-test-message")).tap();

      // 전송 성공 확인
      await waitFor(element(by.id("message-sent-success")))
        .toBeVisible()
        .withTimeout(5000);

      // Detection Log에서 확인
      await element(by.id("tab-detection-log")).tap();
      await waitFor(element(by.id("message-item-0")))
        .toBeVisible()
        .withTimeout(10000);
    });

    it("오프라인 상태에서 적절한 에러 메시지가 표시되어야 함", async () => {
      // 오프라인 모드 시뮬레이션
      await device.setURLBlacklist(["**/v1/messages**"]);

      await element(by.id("tab-home")).tap();
      await element(by.id("test-connection")).tap();

      // 오프라인 에러 메시지 확인
      await waitFor(element(by.id("connection-error")))
        .toBeVisible()
        .withTimeout(10000);
      await expect(element(by.text("서버에 연결할 수 없습니다"))).toBeVisible();

      // 블랙리스트 해제
      await device.setURLBlacklist([]);
    });
  });

  // ========== Phase 4: 사용자 인터랙션 테스트 ==========

  describe("사용자 인터랙션 및 설정", () => {
    it("프로필 설정이 정상 동작해야 함", async () => {
      await element(by.id("tab-profile")).tap();

      // 사용자 정보 섹션
      await expect(element(by.id("user-info-section"))).toBeVisible();

      // 설정 메뉴들
      await expect(element(by.id("settings-notifications"))).toBeVisible();
      await expect(element(by.id("settings-api-endpoint"))).toBeVisible();
      await expect(element(by.id("settings-debug-mode"))).toBeVisible();
    });

    it("알림 설정을 변경할 수 있어야 함", async () => {
      await element(by.id("tab-profile")).tap();
      await element(by.id("settings-notifications")).tap();

      // 알림 설정 화면 확인
      await expect(
        element(by.id("notification-settings-screen"))
      ).toBeVisible();

      // 설정 옵션들
      await expect(element(by.id("enable-spam-notifications"))).toBeVisible();
      await expect(element(by.id("enable-ad-notifications"))).toBeVisible();
      await expect(
        element(by.id("enable-announcement-notifications"))
      ).toBeVisible();

      // 설정 변경 테스트
      await element(by.id("enable-spam-notifications")).tap();
      await element(by.id("save-settings")).tap();

      // 성공 메시지 확인
      await expect(element(by.text("설정이 저장되었습니다"))).toBeVisible();
    });

    it("API 엔드포인트 설정을 변경할 수 있어야 함", async () => {
      await element(by.id("tab-profile")).tap();
      await element(by.id("settings-api-endpoint")).tap();

      // API 설정 화면
      await expect(element(by.id("api-settings-screen"))).toBeVisible();

      // 현재 엔드포인트 표시
      await expect(element(by.id("current-endpoint"))).toBeVisible();

      // 엔드포인트 변경
      await element(by.id("endpoint-input")).clearText();
      await element(by.id("endpoint-input")).typeText(
        "https://test-api.sauron.dev"
      );
      await element(by.id("save-endpoint")).tap();

      // 연결 테스트
      await element(by.id("test-new-endpoint")).tap();
      await waitFor(element(by.id("endpoint-test-result")))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  // ========== Phase 5: 필터링 및 검색 테스트 ==========

  describe("필터링 및 검색", () => {
    beforeEach(async () => {
      // 테스트 데이터 준비 (시뮬레이션 모드)
      await element(by.id("tab-profile")).tap();
      await element(by.id("settings-simulation-mode")).tap();
      await element(by.id("toggle-simulation-mode")).tap();

      // 다양한 타입의 메시지 생성
      const types = ["normal", "spam", "advertisement", "announcement"];
      for (const type of types) {
        await element(by.id("tab-home")).tap();
        await element(by.id("generate-simulation-message")).tap();
        await element(by.id(`simulation-type-${type}`)).tap();
        await element(by.id("confirm-generate")).tap();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    });

    it("메시지 타입별 필터링이 정상 동작해야 함", async () => {
      await element(by.id("tab-detection-log")).tap();

      // 전체 메시지 확인
      await element(by.id("filter-all")).tap();
      await expect(element(by.id("message-item-0"))).toBeVisible();

      // 스팸 필터
      await element(by.id("filter-spam")).tap();
      await expect(
        element(by.id("message-type-spam")).atIndex(0)
      ).toBeVisible();

      // 광고 필터
      await element(by.id("filter-advertisement")).tap();
      await expect(
        element(by.id("message-type-advertisement")).atIndex(0)
      ).toBeVisible();

      // 공고 필터
      await element(by.id("filter-announcement")).tap();
      await expect(
        element(by.id("message-type-announcement")).atIndex(0)
      ).toBeVisible();

      // 일반 메시지 필터
      await element(by.id("filter-normal")).tap();
      await expect(
        element(by.id("message-type-normal")).atIndex(0)
      ).toBeVisible();
    });

    it("검색 기능이 정상 동작해야 함", async () => {
      await element(by.id("tab-detection-log")).tap();

      // 검색 버튼 활성화
      await element(by.id("search-toggle")).tap();
      await expect(element(by.id("search-input"))).toBeVisible();

      // 검색어 입력
      await element(by.id("search-input")).typeText("테스트");
      await element(by.id("search-submit")).tap();

      // 검색 결과 확인
      await waitFor(element(by.id("search-results")))
        .toBeVisible()
        .withTimeout(5000);
    });

    it("날짜 범위 필터가 정상 동작해야 함", async () => {
      await element(by.id("tab-detection-log")).tap();

      // 날짜 필터 열기
      await element(by.id("date-filter-toggle")).tap();
      await expect(element(by.id("date-picker-from"))).toBeVisible();
      await expect(element(by.id("date-picker-to"))).toBeVisible();

      // 오늘 날짜로 필터 설정
      await element(by.id("date-quick-today")).tap();
      await element(by.id("apply-date-filter")).tap();

      // 필터 적용 확인
      await expect(element(by.id("date-filter-active"))).toBeVisible();
    });
  });

  // ========== Phase 6: 성능 및 안정성 테스트 ==========

  describe("성능 및 안정성", () => {
    it("대량 메시지 로딩 시 앱이 안정적이어야 함", async () => {
      // 시뮬레이션 모드에서 대량 메시지 생성
      await element(by.id("tab-profile")).tap();
      await element(by.id("settings-simulation-mode")).tap();
      await element(by.id("toggle-simulation-mode")).tap();

      // 50개 메시지 생성
      for (let i = 0; i < 50; i++) {
        await element(by.id("tab-home")).tap();
        await element(by.id("generate-simulation-message")).tap();
        await element(by.id("simulation-type-normal")).tap();
        await element(by.id("confirm-generate")).tap();

        // 10개마다 잠시 대기
        if (i % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Detection Log에서 스크롤 테스트
      await element(by.id("tab-detection-log")).tap();
      await expect(element(by.id("detected-message-list"))).toBeVisible();

      // 스크롤 성능 테스트
      for (let i = 0; i < 10; i++) {
        await element(by.id("detected-message-list")).scroll(300, "down");
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // 앱이 여전히 반응하는지 확인
      await element(by.id("tab-home")).tap();
      await expect(element(by.id("home-screen"))).toBeVisible();
    });

    it("메모리 사용량이 과도하지 않아야 함", async () => {
      // 메모리 사용량 모니터링 시작
      const initialMemory = await device.getMemoryUsage();
      console.log("Initial memory usage:", initialMemory);

      // 여러 화면 간 네비게이션
      for (let i = 0; i < 20; i++) {
        await element(by.id("tab-home")).tap();
        await element(by.id("tab-detection-log")).tap();
        await element(by.id("tab-reports")).tap();
        await element(by.id("tab-profile")).tap();
      }

      // 최종 메모리 사용량 확인
      const finalMemory = await device.getMemoryUsage();
      console.log("Final memory usage:", finalMemory);

      // 메모리 증가량이 합리적인 범위 내에 있는지 확인
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB 이하
    });

    it("앱 백그라운드/포그라운드 전환이 정상 동작해야 함", async () => {
      await element(by.id("tab-home")).tap();
      await expect(element(by.id("home-screen"))).toBeVisible();

      // 백그라운드로 전환
      await device.sendToHome();
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 포그라운드로 복귀
      await device.launchApp({ newInstance: false });

      // 상태가 유지되는지 확인
      await expect(element(by.id("home-screen"))).toBeVisible();
    });
  });

  // ========== Test Cleanup ==========

  afterAll(async () => {
    console.log("✅ Sauron Mobile E2E Tests completed");

    // 시뮬레이션 모드 비활성화
    try {
      await element(by.id("tab-profile")).tap();
      await element(by.id("settings-simulation-mode")).tap();
      await element(by.id("toggle-simulation-mode")).tap();
    } catch (error) {
      console.log("Cleanup error (non-critical):", error);
    }
  });
});
