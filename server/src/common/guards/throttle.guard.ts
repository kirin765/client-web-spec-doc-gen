// [수정 필요 - H2] WINDOWS Map에서 만료된 엔트리가 정리되지 않아 메모리 누수 발생
// - 장기 실행 서버에서 WINDOWS Map이 무한히 증가함
// - 윈도우 시간이 지난 엔트리를 주기적으로 삭제하는 정리 로직 추가 필요
// - 예: setInterval로 주기적 정리, 또는 canActivate 호출 시 일정 확률로 만료 엔트리 제거

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

interface Window { count: number; start: number }
const WINDOWS: Map<string, Window> = new Map();
const LIMIT = 100; // 기본 허용 요청 수
const WINDOW_MS = 60 * 1000; // 1분
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5분

@Injectable()
export class ThrottleGuard implements CanActivate {
  constructor() {
    // Periodic cleanup to avoid memory leak
    setInterval(() => {
      const now = Date.now();
      for (const [k, w] of WINDOWS) {
        if (now - w.start > WINDOW_MS * 2) {
          WINDOWS.delete(k);
        }
      }
    }, CLEANUP_INTERVAL_MS);
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const key = req.user?.id ? `user:${req.user.id}` : `ip:${req.ip || req.connection?.remoteAddress}`;
    const now = Date.now();

    // Occasional cleanup on request path to keep map size bounded
    if (Math.random() < 0.01) {
      for (const [k, w] of WINDOWS) {
        if (now - w.start > WINDOW_MS) WINDOWS.delete(k);
      }
    }

    const win = WINDOWS.get(key);
    if (!win) {
      WINDOWS.set(key, { count: 1, start: now });
      return true;
    }

    if (now - win.start > WINDOW_MS) {
      WINDOWS.set(key, { count: 1, start: now });
      return true;
    }

    win.count += 1;
    if (win.count > LIMIT) return false;
    return true;
  }
}

export default ThrottleGuard;

