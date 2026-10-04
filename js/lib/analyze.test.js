import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeThread, parseDue, splitMessages } from './analyze.js';
import { counts, levelFor, ranks, remain, sortItems } from './pbc.js';
import { addDays, isISO, mdw } from './date.js';
import { DEMO_THREAD, DEMO_TODAY, SEED_DONE, SEED_ITEMS, SEED_ME, SEED_TODOS } from './seed.js';

const ctx = { items: SEED_ITEMS, me: SEED_ME, today: DEMO_TODAY, todos: SEED_TODOS, done: SEED_DONE };

test('date helpers', () => {
  assert.equal(addDays('2026-12-30', 3), '2027-01-02');
  assert.equal(mdw('2026-10-05'), '10/5(월)');
  assert.ok(isISO('2026-02-28'));
  assert.ok(!isISO('2026-02-30'));
});

test('PRD 시연 데이터: 요약 칸과 순위', () => {
  assert.deepEqual(counts(SEED_ITEMS, DEMO_TODAY), { today: 1, over: 1, soon: 1 });
  const due = sortItems(SEED_ITEMS, 'due', DEMO_TODAY).map((i) => i.id);
  assert.deepEqual(due, ['loan', 'bank', 'ar', 'ppe', 'pay', 'inv', 'tax']);
  const r = ranks(SEED_ITEMS, DEMO_TODAY);
  assert.deepEqual(r.bank, { e: 6, d: 2 });
  assert.equal(levelFor(remain(SEED_ITEMS[1], DEMO_TODAY)), 3);
});

test('상대 날짜 환산', () => {
  const base = '2026-10-05'; // 월요일
  assert.equal(parseDue('10월 8일까지 회신드리겠습니다', base), '2026-10-08');
  assert.equal(parseDue('10/7까지', base), '2026-10-07');
  assert.equal(parseDue('다음 주 월요일에 드리겠습니다', base), '2026-10-12');
  assert.equal(parseDue('이번 주 금요일까지', base), '2026-10-09');
  assert.equal(parseDue('내일 보내드릴게요', base), '2026-10-06');
  assert.equal(parseDue('1/5까지', '2026-12-20'), '2027-01-05');
  assert.equal(parseDue('확인 중입니다', base), '');
});

test('메일 나누기', () => {
  const { msgs, split } = splitMessages(DEMO_THREAD);
  assert.ok(split);
  assert.equal(msgs.length, 2);
  assert.equal(msgs[1].from.email, 'jiwon.park@ganaelec.example');
  assert.equal(msgs[1].date, '2026-10-05');
});

test('시연 스레드: 할 일 2 · 한 일 1 · 상태 1', () => {
  const R = analyzeThread(DEMO_THREAD, ctx);
  assert.deepEqual(R.todos.map((t) => [t.text, t.due, t.link]), [
    ['매출채권 연령분석표 회신 재확인', '2026-10-08', 'ar'],
    ['유형자산 증감내역 양식 안내 회신', '', 'ppe'],
  ]);
  assert.deepEqual(R.todos[0].memo, { item: 'ar', text: '회신 예정 10/8' });
  assert.deepEqual(R.done.map((d) => [d.text, d.date]), [['매출채권 연령분석표 요청', '2026-10-02']]);
  assert.deepEqual(R.status.map((s) => [s.item, s.from, s.to]), [['inv', '일부 수령', '완료']]);
  assert.equal(R.summary, '박지원(회계팀) · 메일 2통 · 수령 1건 · 회신 예정 1건 · 새 요청 1건');
  assert.equal(R.warn, '');
});

test('From: 영문 머리글, 부분 수령 + 다음 주 예정', () => {
  const t = `From: Lee Doyun <doyun.lee@ganaelec.example>
Sent: Tuesday, October 6, 2026 9:12 AM
Subject: RE: 은행 잔액증명서

은행 잔액증명서 1차분 먼저 첨부드립니다. 나머지는 다음 주 화요일에 보내드리겠습니다.`;
  const R = analyzeThread(t, ctx);
  assert.deepEqual(R.status.map((s) => [s.item, s.to]), [['bank', '일부 수령']]);
  assert.equal(R.todos[0].text, '은행 잔액증명서 회신 재확인');
  assert.equal(R.todos[0].due, '2026-10-13');
});

test('머리글 없는 메일은 한 통으로 읽고 안내', () => {
  const R = analyzeThread('급여대장 송부드립니다.', ctx);
  assert.ok(R.warn);
  assert.deepEqual(R.status.map((s) => [s.item, s.to]), [['pay', '완료']]);
});

test('이미 있는 할 일은 중복 표시', () => {
  const R = analyzeThread(DEMO_THREAD, { ...ctx, todos: [...SEED_TODOS, { id: 'x', text: '유형자산 증감내역 양식 안내 회신' }] });
  assert.equal(R.todos.find((t) => t.text === '유형자산 증감내역 양식 안내 회신').dup, true);
});
