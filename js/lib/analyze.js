// 메일 분석 (PRD A4 · 규칙 기반). 외부 API 없이 키워드로 후보만 찾는다.
import { addDays, diff, isISO, md, weekday, ymd } from './date.js';
import { MATERIALS, isOpen } from './pbc.js';

const H_FROM = /^\s*(?:보낸\s*사람|발신자|보낸이|from)\s*[:：]\s*(.+)$/i;
const H_DATE = /^\s*(?:날짜|보낸\s*날짜|일시|date|sent)\s*[:：]\s*(.+)$/i;
const H_SUBJ = /^\s*(?:제목|subject)\s*[:：]\s*(.*)$/i;
const H_SKIP = /^\s*(?:받는\s*사람|수신자?|참조|숨은\s*참조|to|cc|bcc)\s*[:：]/i;
const SEP = /^\s*(?:-{2,}\s*(?:original message|원본 메시지|forwarded message|전달된 메시지)\s*-{2,}|-{5,}|_{5,})\s*$/i;
const WROTE = /^\s*(?:on .+wrote:|.+(?:님이|에) 작성:?)\s*$/i;

const RECV = /(첨부|송부|보내\s*드|전달\s*드|공유\s*드|업로드|올려\s*드)/;
const FUTURE = /(겠|예정|할게|드릴게|드릴\s*수)/;
const PARTIAL = /(일부|1차|먼저|우선|일단)/;
const DELAY = /(확인\s*중|검토\s*중|준비\s*중|작성\s*중|진행\s*중|취합\s*중|다음\s*주|차주|추후|늦어|지연|드리겠|드릴\s*예정|예정입니다|회신\s*예정)/;
const ASK = /(\?|까요|주실\s*수|주시겠|문의|알려\s*주|요청드립니다|필요하신가요|맞나요|될까요|(?<!잘\s?)부탁드립니다)/;
const NOISE = /(안녕하세요|감사합니다|수고하세요|드림$|^[\w.+-]+@|^(tel|phone|mobile|t\.|m\.)\b)/i;

const KDAY = { 일: 0, 월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6 };
const hasJong = (s) => { const c = s.charCodeAt(s.length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0; };
const eunNeun = (s) => (hasJong(s) ? '은' : '는');
const eulReul = (s) => (hasJong(s) ? '을' : '를');
const squash = (s) => s.replace(/\s+/g, '');

export function parseAddr(s) {
  const m = s.match(/^\s*"?([^"<]*?)"?\s*<\s*([^>\s]+)\s*>/);
  if (m) return { name: m[1].trim(), email: m[2].toLowerCase() };
  const e = s.match(/[\w.+-]+@[\w.-]+/);
  return e ? { name: s.replace(e[0], '').replace(/[<>"]/g, '').trim(), email: e[0].toLowerCase() } : { name: s.trim(), email: '' };
}

export function parseHeaderDate(raw) {
  const m = raw.match(/(\d{4})\s*[-./년]\s*(\d{1,2})\s*[-./월]\s*(\d{1,2})/);
  if (m) { const d = ymd(+m[1], +m[2], +m[3]); return isISO(d) ? d : null; }
  const t = Date.parse(raw.replace(/\(.*?\)/g, ''));
  if (!isNaN(t)) { const x = new Date(t); return ymd(x.getFullYear(), x.getMonth() + 1, x.getDate()); }
  return null;
}

// 문장 속 날짜를 메일 날짜(base) 기준으로 환산. 못 찾으면 ''.
export function parseDue(s, base) {
  let m = s.match(/(\d{4})[-.](\d{1,2})[-.](\d{1,2})/);
  if (m) { const d = ymd(+m[1], +m[2], +m[3]); return isISO(d) ? d : ''; }
  const near = (mo, da) => {
    const y = +base.slice(0, 4);
    let d = ymd(y, mo, da);
    if (!isISO(d)) return '';
    if (diff(d, base) < -180) d = ymd(y + 1, mo, da);
    return isISO(d) ? d : '';
  };
  m = s.match(/(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (m) return near(+m[1], +m[2]);
  m = s.match(/(?<![\d./])(\d{1,2})\/(\d{1,2})(?![\d/])/);
  if (m) return near(+m[1], +m[2]);
  if (/모레/.test(s)) return addDays(base, 2);
  if (/내일/.test(s)) return addDays(base, 1);
  if (/오늘\s*(중|까지|안)/.test(s)) return base;
  const monday = addDays(base, -((weekday(base) + 6) % 7));
  m = s.match(/(이번\s*주|금주|다음\s*주|차주)\s*([월화수목금토일])요일/);
  if (m) return addDays(monday, (/이번|금주/.test(m[1]) ? 0 : 7) + ((KDAY[m[2]] + 6) % 7));
  if (/(다음\s*주|차주)/.test(s)) return addDays(monday, 7);
  m = s.match(/([월화수목금])요일/);
  if (m) { const k = (KDAY[m[1]] - weekday(base) + 7) % 7 || 7; return addDays(base, k); }
  return '';
}

export function splitMessages(text) {
  const lines = text.replace(/\r/g, '').split('\n').map((l) => l.replace(/^\s*(>\s?)+/, ''));
  const msgs = [];
  let cur = null, head = false;
  const pre = [];
  for (const line of lines) {
    if (SEP.test(line) || WROTE.test(line)) { head = false; continue; }
    const f = line.match(H_FROM);
    if (f) { cur = { from: parseAddr(f[1]), date: null, subject: '', body: [] }; msgs.push(cur); head = true; continue; }
    if (cur && head) {
      const d = line.match(H_DATE); if (d) { cur.date = parseHeaderDate(d[1]); continue; }
      const sj = line.match(H_SUBJ); if (sj) { cur.subject = sj[1].trim(); continue; }
      if (H_SKIP.test(line)) continue;
      head = false;
      if (!line.trim()) continue;
    }
    (cur ? cur.body : pre).push(line);
  }
  if (!msgs.length) return { msgs: [{ from: null, date: null, subject: '', body: pre }], split: false };
  if (pre.some((l) => l.trim())) msgs.unshift({ from: null, date: null, subject: '', body: pre });
  return { msgs, split: true };
}

const sentences = (body) => body
  .flatMap((l) => l.split(/(?<=[.?!])\s+/))
  .map((s) => s.trim())
  .filter((s) => s.length >= 4 && !NOISE.test(s) && !/^.{0,20}입니다\.?$/.test(s));

export function analyzeThread(text, { items, me, today, todos = [], done = [] }) {
  const { msgs, split } = splitMessages(text);
  const myEmail = (me.email || '').toLowerCase();
  const isMine = (m) => !!m.from && ((myEmail && m.from.email === myEmail) || (!!me.name && m.from.name.includes(me.name)));

  const names = [...new Set([...items.map((i) => i.name), ...MATERIALS.map((m) => m.name)])].sort((a, b) => b.length - a.length);
  const findNames = (s) => { const q = squash(s); const out = []; names.forEach((n) => { if (q.includes(squash(n)) && !out.some((o) => squash(o).includes(squash(n)))) out.push(n); }); return out; };
  const pickItem = (name, email) => {
    const l = items.filter((i) => i.name === name);
    return l.find((i) => isOpen(i) && email && i.email === email) || l.find(isOpen) || l[0] || null;
  };

  const R = { todos: [], done: [], status: [], parts: [], summary: '', warn: '', mails: msgs.length };
  const seenTodo = new Set(todos.map((t) => t.text)), seenDone = new Set(done.map((d) => d.text + d.date));
  const recvBy = {}, delayBy = {};
  let n = 0;
  const id = () => 'a' + ++n;
  let cp = null, asks = 0;

  msgs.forEach((m) => {
    const date = m.date || today;
    const mine = isMine(m);
    const ss = sentences(m.body);
    if (mine) {
      const reqNames = [...new Set(ss.filter((s) => /(요청|부탁|회신|송부)/.test(s)).flatMap(findNames))];
      const subj = m.subject.replace(/^((re|fw|fwd|회신|전달)\s*:\s*)+/i, '').replace(/\[[^\]]*\]\s*/g, '').trim();
      const kind = /보완/.test(m.subject + ss.join(' ')) ? '보완 요청' : /(독촉|한 번 더|다시 안내|리마인드)/.test(ss.join(' ')) ? '독촉' : '요청';
      const text = reqNames.length ? `${reqNames[0]}${reqNames.length > 1 ? ` 외 ${reqNames.length - 1}건` : ''} ${kind}` : subj ? `${subj} 메일 발송` : '메일 발송';
      R.done.push({ id: id(), text, date, dup: seenDone.has(text + date) });
      return;
    }
    if (m.from && !cp) cp = m.from;
    const who = (m.from && m.from.name) || '담당자';
    const email = m.from ? m.from.email : '';
    let last = null;
    ss.forEach((s) => {
      const found = findNames(s);
      const nm = found[0] || last;
      if (found[0]) last = found[0];
      const it = nm ? pickItem(nm, email) : null;
      if (nm && RECV.test(s) && !FUTURE.test(s) && !/\?/.test(s)) {
        if (!it) { R.todos.push({ id: id(), text: `${nm} 수령분 검토`, due: '', quote: s, link: null }); return; }
        if (it.status === '완료' || recvBy[it.id]) return;
        recvBy[it.id] = { id: id(), item: it.id, name: it.name, from: it.status, options: ['일부 수령', '완료'], to: PARTIAL.test(s) ? '일부 수령' : '완료', quote: s };
        R.status.push(recvBy[it.id]);
        return;
      }
      if (nm && DELAY.test(s)) {
        if (it && delayBy[it.id]) return;
        const due = parseDue(s, date);
        const t = { id: id(), text: `${nm} 회신 재확인`, due, quote: s, link: it ? it.id : null, kind: 'delay' };
        if (it) { t.memo = { item: it.id, text: due ? `회신 예정 ${md(due)}` : `회신 확인 중 (${md(date)} 메일)` }; delayBy[it.id] = t; }
        R.todos.push(t);
        return;
      }
      if (ASK.test(s)) {
        const k = /(양식|서식|템플릿|포맷)/.test(s) ? '양식' : /기준일/.test(s) ? '기준일' : '';
        const [text, topic] = !found[0] ? [`${who}님 문의 회신`, '문의 사항']
          : k ? [`${found[0]} ${k} 안내 회신`, `${found[0]} ${k}`] : [`${found[0]} 관련 문의 회신`, `${found[0]} 관련 사항`];
        R.todos.push({ id: id(), text, due: parseDue(s, date), quote: s, link: it ? it.id : null, kind: 'ask', topic, who });
        asks++;
      }
    });
  });

  // 같은 메일에서 "첨부"와 "나머지는 다음 주"가 함께 나오면 일부 수령
  R.status.forEach((st) => { if (delayBy[st.item]) st.to = '일부 수령'; });
  R.status = R.status.filter((st) => !(st.from === st.to));
  R.todos.forEach((t) => { t.dup = seenTodo.has(t.text); });

  const dept = cp && (items.find((i) => i.email === cp.email) || {}).dept;
  const delays = R.todos.filter((t) => t.kind === 'delay');
  R.summary = `${cp ? `${cp.name || cp.email}${dept ? `(${dept})` : ''} · ` : ''}메일 ${msgs.length}통 · 수령 ${R.status.length}건 · 회신 예정 ${delays.length}건 · 새 요청 ${asks}건`;
  R.status.forEach((st) => R.parts.push([`${st.name}${eunNeun(st.name)} `], [st.to === '완료' ? '받았어요' : '일부 받았어요', 'ok'], ['. ']));
  delays.forEach((t) => { const nm = t.text.replace(/ 회신 재확인$/, ''); R.parts.push([`${nm}${eunNeun(nm)} `], [t.due ? `${md(t.due)} 회신 예정` : '확인 중', 'late'], ['이에요. ']); });
  R.todos.filter((t) => t.kind === 'ask').forEach((t) => R.parts.push([`${t.who}님이 `], [t.topic, 'hl'], [`${eulReul(t.topic)} 물어봤어요. `]));
  if (!R.parts.length) R.parts.push(['키워드로 찾은 수령·회신 예정·문의가 없어요. 메일 내용을 직접 확인해 주세요.']);
  if (!split) R.warn = '‘보낸 사람:’ 또는 ‘From:’ 머리글을 찾지 못해 한 통으로 읽었어요. 잘 나뉘지 않으면 메일을 1통씩 붙여넣어 주세요.';
  return R;
}
