// 시연 데이터 (PRD 8절 · 오늘 날짜 2026-10-05). 가상의 회사·인물만 사용.
export const DEMO_TODAY = '2026-10-05';

export const SEED_ITEMS = [
  { id: 'loan', client: '가나전자', name: '차입금 명세서', owner: '이도윤', dept: '자금팀', email: 'doyun.lee@ganaelec.example', asOf: '2026-09-30', req: '2026-09-24', due: '2026-10-02', status: '보완 요청', reason: '기준일 상이', detail: '2026-09-30', nudges: 1, last: '2026-10-02' },
  { id: 'bank', client: '가나전자', name: '은행 잔액증명서', owner: '이도윤', dept: '자금팀', email: 'doyun.lee@ganaelec.example', asOf: '2026-09-30', req: '2026-09-30', due: '2026-10-05', status: '미회신', nudges: 0 },
  { id: 'ar', client: '가나전자', name: '매출채권 연령분석표', owner: '박지원', dept: '회계팀', email: 'jiwon.park@ganaelec.example', asOf: '2026-09-30', req: '2026-09-21', due: '2026-10-07', status: '미회신', nudges: 1, last: '2026-10-01' },
  { id: 'ppe', client: '가나전자', name: '유형자산 증감내역', owner: '박지원', dept: '회계팀', email: 'jiwon.park@ganaelec.example', asOf: '2026-09-30', req: '2026-09-18', due: '2026-10-09', status: '보완 요청', reason: '일부 항목 누락', detail: '건설중인자산 대체 내역', nudges: 0 },
  { id: 'pay', client: '다라식품', name: '급여대장', owner: '최서연', dept: '인사팀', email: 'seoyeon.choi@darafood.example', asOf: '2026-09-30', req: '2026-09-28', due: '2026-10-12', status: '미회신', nudges: 0 },
  { id: 'inv', client: '가나전자', name: '재고자산 수불부', owner: '박지원', dept: '회계팀', email: 'jiwon.park@ganaelec.example', asOf: '2026-09-30', req: '2026-09-15', due: '2026-10-20', status: '일부 수령', left: '9월분 원재료 수불', nudges: 0 },
  { id: 'tax', client: '가나전자', name: '법인세 신고서', owner: '박지원', dept: '회계팀', email: 'jiwon.park@ganaelec.example', asOf: '2025-12-31', req: '2026-09-14', due: '2026-09-30', status: '완료', nudges: 0 },
];
export const SEED_TODOS = [
  { id: 't1', text: '유형자산 증감내역 보완 요청 메일 보내기', due: '2026-10-05', link: 'ppe', src: '직접' },
  { id: 't2', text: '재고자산 수불부 수령분 검토', due: '2026-10-06', link: 'inv', src: '메일 분석' },
  { id: 't3', text: '급여대장 회신 여부 확인', due: '2026-10-07', link: 'pay', src: '발송 시점' },
];
export const SEED_DONE = [{ id: 'd1', text: '차입금 명세서 보완 요청 메일 발송', date: '2026-10-02', src: '독촉 기록' }];
export const SEED_ME = { name: '김삼일', email: 'samil.kim@example.com', firm: '삼일회계법인', team: 'Assurance 1팀' };

export const DEMO_THREAD = `보낸 사람: 김삼일 <samil.kim@example.com>
날짜: 2026-10-02 (금)
제목: [기말감사] 매출채권 연령분석표 요청

박지원님, 안녕하세요. 삼일회계법인 김삼일입니다.
매출채권 연령분석표를 거래처별 엑셀 원본으로 10/7까지 부탁드립니다.

-----Original Message-----
보낸 사람: 박지원 <jiwon.park@ganaelec.example>
날짜: 2026-10-05 (월)
제목: RE: [기말감사] 매출채권 연령분석표 요청

김삼일님, 안녕하세요.
재고자산 수불부 나머지분 첨부드립니다.
매출채권 연령분석표는 확인 중이며, 10월 8일까지 회신드리겠습니다.
혹시 유형자산 증감내역은 어떤 양식으로 드리면 될까요?`;

export const seedData = () => ({
  items: SEED_ITEMS.map((i) => ({ ...i })),
  todos: SEED_TODOS.map((t) => ({ ...t })),
  done: SEED_DONE.map((t) => ({ ...t })),
  me: { ...SEED_ME },
  todayOverride: DEMO_TODAY,
});
