import { diff, md, mdw } from './date.js';

export const STATUSES = ['미회신', '일부 수령', '보완 요청', '완료'];
export const REASONS = ['기준일 상이', '서명 누락', '일부 항목 누락', '파일 오류'];
export const REASON_FIELD = { '기준일 상이': '필요한 자료 기준일', '일부 항목 누락': '누락 항목', '파일 오류': '오류 내용' };
export const LEVELS = ['정중한 안내', '가벼운 리마인드', '일정 확인 요청', '일정 영향 안내'];

export const MATERIALS = [
  { id: 'ar', name: '매출채권 연령분석표', hint: '거래처별 · 엑셀 원본' },
  { id: 'inv', name: '재고자산 수불부', hint: '품목별 월별 입출고 · 엑셀 원본' },
  { id: 'ppe', name: '유형자산 증감내역', hint: '계정별 기초·증가·감소·기말' },
  { id: 'loan', name: '차입금 명세서', hint: '차입처별 이자율·만기 포함' },
  { id: 'bank', name: '은행 잔액증명서', hint: '은행 발급 원본 스캔본' },
  { id: 'pay', name: '급여대장', hint: '월별 · 부서별 합계 포함' },
  { id: 'tax', name: '법인세 신고서', hint: '세무조정계산서 포함 PDF' },
  { id: 'ap', name: '매입채무 명세서', hint: '거래처별 · 엑셀 원본' },
  { id: 'ret', name: '퇴직급여 명세서', hint: '인원별 · 퇴직금 추계액 포함' },
  { id: 'sh', name: '주주명부', hint: '대표이사 날인본' },
];

export const isOpen = (it) => it.status !== '완료';
export const remain = (it, today) => diff(it.due, today);
export const elapsed = (it, today) => diff(today, it.req);
export const urg = (r) => (r < 0 ? 'over' : r === 0 ? 'today' : r <= 3 ? 'soon' : 'ok');
export const levelFor = (r) => (r < 0 ? 4 : r <= 3 ? 3 : r <= 7 ? 2 : 1);
export const URG_TEXT = { over: '기한 지남', today: '오늘 기한', soon: '3일 이내' };

export function sortItems(items, mode, today) {
  const open = items.filter(isOpen), closed = items.filter((i) => !isOpen(i));
  const s = [...open].sort(mode === 'due'
    ? (a, b) => remain(a, today) - remain(b, today) || elapsed(b, today) - elapsed(a, today)
    : (a, b) => elapsed(b, today) - elapsed(a, today) || remain(a, today) - remain(b, today));
  return [...s, ...closed];
}
export function ranks(items, today) {
  const e = sortItems(items, 'elapsed', today), d = sortItems(items, 'due', today), r = {};
  items.forEach((i) => { if (isOpen(i)) r[i.id] = { e: e.indexOf(i) + 1, d: d.indexOf(i) + 1 }; });
  return r;
}
export function counts(items, today) {
  const c = { today: 0, over: 0, soon: 0 };
  items.filter(isOpen).forEach((i) => { const k = urg(remain(i, today)); if (k in c) c[k]++; });
  return c;
}

export function fixLine(it) {
  const d = it.detail;
  switch (it.reason) {
    case '기준일 상이': return `보내주신 자료의 기준일이 요청드린 기준일과 달라, ${d || it.asOf} 기준 자료로 다시 부탁드립니다.`;
    case '서명 누락': return '대표이사 날인(또는 서명)이 누락되어 있어, 날인본으로 다시 부탁드립니다.';
    case '일부 항목 누락': return `일부 항목(${d || '누락 항목'})이 빠져 있어, 해당 항목을 포함해 다시 부탁드립니다.`;
    case '파일 오류': return `파일에 오류(${d || '오류 내용'})가 있어, 다시 송부 부탁드립니다.`;
    default: return '';
  }
}
export function itemLine(it) {
  if (it.status === '일부 수령') return `남은 항목: ${it.left || '미수령 항목'}`;
  if (it.status === '보완 요청') return `보완 사유: ${fixLine(it)}`;
  return `요청 자료: ${it.name} (자료 기준일 ${it.asOf})`;
}
export function levelLine(level, names, due) {
  const t = mdw(due);
  return [
    `바쁘신 중에 죄송하지만, 지난번 요청드린 ${names} 한 번 더 안내드립니다. 회신 기한은 ${t}입니다.`,
    `지난번 요청드린 ${names} 관련하여, 혹시 준비 상황 공유 가능하실까요? 회신 기한은 ${t}입니다.`,
    `${t}까지 ${names} 회신 부탁드립니다. 해당 일정에 감사 절차를 진행할 예정입니다.`,
    `${names}의 회신 기한(${t})이 지나 현재 절차가 진행되지 못하고 있어, 가능한 날짜를 알려주시면 일정을 맞추겠습니다.`,
  ][level - 1];
}
export const sign = (me) => `감사합니다.\n\n${me.name} 드림\n${me.firm} ${me.team}\n${me.email}`;
const hello = (name, me) => `${name}님, 안녕하세요.\n${me.firm} ${me.name}입니다.`;
const toLine = (name, dept, email) => `${name}${dept ? ` (${dept})` : ''}${email ? ` <${email}>` : ''}`;

export function mailSingle(it, level, me) {
  const fix = it.status === '보완 요청';
  const subject = `[기말감사] ${it.name} ${fix ? '보완 요청' : '회신 요청'} (${md(it.due)}까지)`;
  const lead = fix ? `지난 ${md(it.req)} 보내주신 ${it.name} 잘 받았습니다. ${fixLine(it)}` : levelLine(level, it.name, it.due);
  const extra = fix ? levelLine(level, '보완본', it.due) : itemLine(it);
  return { to: toLine(it.owner, it.dept, it.email), subject, body: `${hello(it.owner, me)}\n\n${lead}\n${extra}\n\n${sign(me)}` };
}
export function mailBundle(list, level, me) {
  const f = list[0];
  const lines = list.map((it, i) => `${i + 1}. ${it.name} · 회신 기한 ${mdw(it.due)}\n   ${itemLine(it)}`).join('\n');
  return {
    to: toLine(f.owner, f.dept, f.email),
    subject: `[기말감사] 자료 회신 요청 ${list.length}건 (${md(f.due)}부터)`,
    body: `${hello(f.owner, me)}\n\n${levelLine(level, `요청 자료 ${list.length}건`, f.due)}\n회신 기한이 빠른 순으로 정리했습니다.\n\n${lines}\n\n${sign(me)}`,
  };
}
export function mailRequest(c, picked, me) {
  const lines = picked.map((m, i) => `${i + 1}. ${m.name} (자료 기준일 ${c.asOf})${m.hint ? ` — ${m.hint}` : ''}`).join('\n');
  const body = c.tone === 0
    ? `${hello(c.toName, me)}\n\n기말감사 진행을 위해 아래 자료를 요청드립니다. 바쁘시겠지만 ${mdw(c.due)}까지 회신 부탁드립니다.\n\n${lines}\n\n준비 중 궁금하신 점은 편하게 말씀해 주세요.\n\n${sign(me)}`
    : `${c.toName}님, 안녕하세요. ${me.firm} ${me.name}입니다.\n\n기말감사 자료 ${picked.length}건 요청드립니다. 회신 기한: ${mdw(c.due)}\n\n${lines}\n\n${sign(me)}`;
  return { to: toLine(c.toName, c.toDept, c.toEmail), subject: `[기말감사] 자료 요청 ${picked.length}건 (${md(c.due)}까지)`, body };
}

export const uid = (p = '') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
