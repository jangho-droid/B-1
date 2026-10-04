// 모든 날짜는 'YYYY-MM-DD' 문자열. 계산은 UTC 자정 기준 달력일.
const DAY = 864e5;
export const WD = ['일', '월', '화', '수', '목', '금', '토'];

export const toDay = (iso) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) / DAY; };
export const fromDay = (n) => new Date(n * DAY).toISOString().slice(0, 10);
export const diff = (a, b) => toDay(a) - toDay(b);
export const addDays = (iso, n) => fromDay(toDay(iso) + n);
export const weekday = (iso) => new Date(toDay(iso) * DAY).getUTCDay();
export const ymd = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export const isISO = (s) => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  return fromDay(Date.UTC(y, m - 1, d) / DAY) === s;
};

export const md = (iso) => { const [, m, d] = iso.split('-').map(Number); return `${m}/${d}`; };
export const mdw = (iso) => `${md(iso)}(${WD[weekday(iso)]})`;

export const localToday = () => { const t = new Date(); return ymd(t.getFullYear(), t.getMonth() + 1, t.getDate()); };
