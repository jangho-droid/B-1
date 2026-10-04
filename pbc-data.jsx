const PBC_TODAY = '10-05';
const pbcDay = (s) => { const [m, d] = s.split('-').map(Number); return Date.UTC(2026, m - 1, d) / 864e5; };
const pbcDiff = (a, b) => pbcDay(a) - pbcDay(b);
const pbcAdd = (s, n) => { const t = new Date((pbcDay(s) + n) * 864e5); return String(t.getUTCMonth() + 1).padStart(2, '0') + '-' + String(t.getUTCDate()).padStart(2, '0'); };
const WD = ['일', '월', '화', '수', '목', '금', '토'];
const pbcMD = (s) => { const [m, d] = s.split('-').map(Number); return `${m}/${d}`; };
const pbcMDW = (s) => `${pbcMD(s)}(${WD[new Date(pbcDay(s) * 864e5).getUTCDay()]})`;

const PBC_ITEMS = [
  { id: 'loan', client: '가나전자', name: '차입금 명세서', owner: '이도윤', dept: '자금팀', email: 'doyun.lee@ganaelec.example', asOf: '2026-09-30', req: '09-24', due: '10-02', status: '보완 요청', reason: '기준일 상이', detail: '2026-09-30', nudges: 1, last: '10-02' },
  { id: 'bank', client: '가나전자', name: '은행 잔액증명서', owner: '이도윤', dept: '자금팀', email: 'doyun.lee@ganaelec.example', asOf: '2026-09-30', req: '09-30', due: '10-05', status: '미회신', nudges: 0 },
  { id: 'ar', client: '가나전자', name: '매출채권 연령분석표', owner: '박지원', dept: '회계팀', email: 'jiwon.park@ganaelec.example', asOf: '2026-09-30', req: '09-21', due: '10-07', status: '미회신', nudges: 1, last: '10-01' },
  { id: 'ppe', client: '가나전자', name: '유형자산 증감내역', owner: '박지원', dept: '회계팀', email: 'jiwon.park@ganaelec.example', asOf: '2026-09-30', req: '09-18', due: '10-09', status: '보완 요청', reason: '일부 항목 누락', detail: '건설중인자산 대체 내역', nudges: 0 },
  { id: 'pay', client: '다라식품', name: '급여대장', owner: '최서연', dept: '인사팀', email: 'seoyeon.choi@darafood.example', asOf: '2026-09-30', req: '09-28', due: '10-12', status: '미회신', nudges: 0 },
  { id: 'inv', client: '가나전자', name: '재고자산 수불부', owner: '박지원', dept: '회계팀', email: 'jiwon.park@ganaelec.example', asOf: '2026-09-30', req: '09-15', due: '10-20', status: '일부 수령', left: '9월분 원재료 수불', nudges: 0 },
  { id: 'tax', client: '가나전자', name: '법인세 신고서', owner: '박지원', dept: '회계팀', email: 'jiwon.park@ganaelec.example', asOf: '2025-12-31', req: '09-14', due: '09-30', status: '완료', nudges: 0 },
];
const PBC_TODOS = [
  { id: 't1', text: '유형자산 증감내역 보완 요청 메일 보내기', due: '10-05', link: 'ppe', src: '직접' },
  { id: 't2', text: '재고자산 수불부 수령분 검토', due: '10-06', link: 'inv', src: '메일 분석' },
  { id: 't3', text: '급여대장 회신 여부 확인', due: '10-07', link: 'pay', src: '발송 시점' },
];
const PBC_DONE = [{ id: 'd1', text: '차입금 명세서 보완 요청 메일 발송', date: '10-02', src: '독촉 기록' }];
const PBC_ME = { name: '김삼일', email: 'samil.kim@example.com', firm: '삼일회계법인', team: 'Assurance 1팀' };
const PBC_STATUSES = ['미회신', '일부 수령', '보완 요청', '완료'];
const PBC_REASONS = ['기준일 상이', '서명 누락', '일부 항목 누락', '파일 오류'];
const PBC_REASON_FIELD = { '기준일 상이': '필요한 자료 기준일', '일부 항목 누락': '누락 항목', '파일 오류': '오류 내용' };
const PBC_LEVELS = ['정중한 안내', '가벼운 리마인드', '일정 확인 요청', '일정 영향 안내'];

const PBC_MATERIALS = [
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

const pbcRemain = (it, today) => pbcDiff(it.due, today);
const pbcElapsed = (it, today) => pbcDiff(today, it.req);
const pbcUrg = (r) => (r < 0 ? 'over' : r === 0 ? 'today' : r <= 3 ? 'soon' : 'ok');
const pbcLevelFor = (r) => (r < 0 ? 4 : r <= 3 ? 3 : r <= 7 ? 2 : 1);

function pbcSort(items, mode, today) {
  const open = items.filter((i) => i.status !== '완료'), closed = items.filter((i) => i.status === '완료');
  const s = [...open].sort(mode === 'due'
    ? (a, b) => pbcRemain(a, today) - pbcRemain(b, today) || pbcElapsed(b, today) - pbcElapsed(a, today)
    : (a, b) => pbcElapsed(b, today) - pbcElapsed(a, today));
  return [...s, ...closed];
}
function pbcRanks(items, today) {
  const e = pbcSort(items, 'elapsed', today), d = pbcSort(items, 'due', today), r = {};
  items.forEach((i) => { if (i.status !== '완료') r[i.id] = { e: e.indexOf(i) + 1, d: d.indexOf(i) + 1 }; });
  return r;
}

function pbcFixLine(it) {
  const d = it.detail;
  switch (it.reason) {
    case '기준일 상이': return `보내주신 자료의 기준일이 요청드린 기준일과 달라, ${d || it.asOf} 기준 자료로 다시 부탁드립니다.`;
    case '서명 누락': return '대표이사 날인(또는 서명)이 누락되어 있어, 날인본으로 다시 부탁드립니다.';
    case '일부 항목 누락': return `일부 항목(${d || '누락 항목'})이 빠져 있어, 해당 항목을 포함해 다시 부탁드립니다.`;
    case '파일 오류': return `파일에 오류(${d || '오류 내용'})가 있어, 다시 송부 부탁드립니다.`;
    default: return '';
  }
}
function pbcItemLine(it) {
  if (it.status === '일부 수령') return `남은 항목: ${it.left || '미수령 항목'}`;
  if (it.status === '보완 요청') return `보완 사유: ${pbcFixLine(it)}`;
  return `요청 자료: ${it.name} (자료 기준일 ${it.asOf})`;
}
function pbcLevelLine(level, names, due, today) {
  const dueTxt = pbcMDW(due);
  return [
    `바쁘신 중에 죄송하지만, 지난번 요청드린 ${names} 한 번 더 안내드립니다. 회신 기한은 ${dueTxt}입니다.`,
    `지난번 요청드린 ${names} 관련하여, 혹시 준비 상황 공유 가능하실까요? 회신 기한은 ${dueTxt}입니다.`,
    `${dueTxt}까지 ${names} 회신 부탁드립니다. 해당 일정에 감사 절차를 진행할 예정입니다.`,
    `${names}의 회신 기한(${dueTxt})이 지나 현재 절차가 진행되지 못하고 있어, 가능한 날짜를 알려주시면 일정을 맞추겠습니다.`,
  ][level - 1];
}
const pbcSign = (me) => `감사합니다.\n\n${me.name} 드림\n${me.firm} ${me.team}\n${me.email}`;

function pbcMailSingle(it, level, me, today) {
  const fix = it.status === '보완 요청';
  const subject = fix ? `[기말감사] ${it.name} 보완 요청 (${pbcMD(it.due)}까지)` : `[기말감사] ${it.name} 회신 요청 (${pbcMD(it.due)}까지)`;
  const lead = fix
    ? `지난 ${pbcMD(it.req)} 보내주신 ${it.name} 잘 받았습니다. ${pbcFixLine(it)}`
    : pbcLevelLine(level, it.name, it.due, today);
  const extra = fix ? pbcLevelLine(level, '보완본', it.due, today) : pbcItemLine(it);
  return { to: `${it.owner} (${it.dept}) <${it.email}>`, subject, body: `${it.owner}님, 안녕하세요.\n${me.firm} ${me.name}입니다.\n\n${lead}\n${extra}\n\n${pbcSign(me)}` };
}
function pbcMailBundle(list, level, me, today) {
  const f = list[0];
  const due = list[0].due;
  const lines = list.map((it, i) => `${i + 1}. ${it.name} · 회신 기한 ${pbcMDW(it.due)}\n   ${pbcItemLine(it)}`).join('\n');
  return {
    to: `${f.owner} (${f.dept}) <${f.email}>`,
    subject: `[기말감사] 자료 회신 요청 ${list.length}건 (${pbcMD(due)}부터)`,
    body: `${f.owner}님, 안녕하세요.\n${me.firm} ${me.name}입니다.\n\n${pbcLevelLine(level, `요청 자료 ${list.length}건`, due, today)}\n회신 기한이 빠른 순으로 정리했습니다.\n\n${lines}\n\n${pbcSign(me)}`,
  };
}
function pbcMailRequest(c, me) {
  const picked = PBC_MATERIALS.filter((m) => c.picked.includes(m.id));
  const polite = c.tone === 0;
  const lines = picked.map((m, i) => `${i + 1}. ${m.name} (자료 기준일 ${c.asOf}) — ${m.hint}`).join('\n');
  const body = polite
    ? `${c.toName}님, 안녕하세요.\n${me.firm} ${me.name}입니다.\n\n기말감사 진행을 위해 아래 자료를 요청드립니다. 바쁘시겠지만 ${pbcMDW(c.due)}까지 회신 부탁드립니다.\n\n${lines}\n\n준비 중 궁금하신 점은 편하게 말씀해 주세요.\n\n${pbcSign(me)}`
    : `${c.toName}님, 안녕하세요. ${me.firm} ${me.name}입니다.\n\n기말감사 자료 ${picked.length}건 요청드립니다. 회신 기한: ${pbcMDW(c.due)}\n\n${lines}\n\n${pbcSign(me)}`;
  return { to: `${c.toName} (${c.toDept}) <${c.toEmail}>`, subject: `[기말감사] 자료 요청 ${picked.length}건 (${pbcMD(c.due)}까지)`, body };
}

const PBC_THREAD = `보낸 사람: 김삼일 <samil.kim@example.com>
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

const PBC_ANALYSIS = {
  summary: '박지원(회계팀) · 메일 2통 · 수령 1건 · 회신 예정 1건 · 새 요청 1건',
  todos: [
    { id: 'a1', text: '유형자산 증감내역 양식 안내 회신', due: '', quote: '혹시 유형자산 증감내역은 어떤 양식으로 드리면 될까요?', link: 'ppe' },
    { id: 'a2', text: '매출채권 연령분석표 회신 재확인', due: '10-08', quote: '매출채권 연령분석표는 확인 중이며, 10월 8일까지 회신드리겠습니다.', link: 'ar' },
  ],
  done: [{ id: 'a3', text: '매출채권 연령분석표 요청', date: '10-02' }],
  status: [{ id: 'a4', item: 'inv', from: '일부 수령', options: ['일부 수령', '완료'], to: '완료', quote: '재고자산 수불부 나머지분 첨부드립니다.' }],
  memo: { item: 'ar', text: '회신 예정 10/8' },
};

Object.assign(window, { PBC_TODAY, pbcDay, pbcDiff, pbcAdd, pbcMD, pbcMDW, PBC_ITEMS, PBC_TODOS, PBC_DONE, PBC_ME, PBC_STATUSES, PBC_REASONS, PBC_REASON_FIELD, PBC_LEVELS, PBC_MATERIALS, pbcRemain, pbcElapsed, pbcUrg, pbcLevelFor, pbcSort, pbcRanks, pbcFixLine, pbcMailSingle, pbcMailBundle, pbcMailRequest, PBC_THREAD, PBC_ANALYSIS });
