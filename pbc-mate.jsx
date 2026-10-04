const MW = window.WantedDesignSystem_794458;
const { Button: MButton, TextButton: MTextButton, IconButton: MIconButton, Chip: MChip, TextField: MTextField, Checkbox: MCheck, Toast: MToast, Icon: MIcon } = MW;

const M_RISK = {
  over: { label: '기한 지남', fg: '#B42318', bg: '#FDECEA', line: '#B42318' },
  today: { label: '오늘 기한', fg: '#B83700', bg: '#FFE8D4', line: '#FD5108' },
  soon: { label: '3일 이내', fg: '#7D2D00', bg: '#FFF5ED', line: '#FFAA72' },
  ok: { label: '4일 이상', fg: '#0E5A49', bg: '#E3F1EC', line: '#CBD1D6' },
};
const M_STATUS = { '미회신': ['#4B5058', '#EEEFF1'], '일부 수령': ['#0E5A49', '#E3F1EC'], '보완 요청': ['#B83700', '#FFE8D4'], '완료': ['#6A727C', '#EEEFF1'] };
const mLeftTxt = (r) => (r < 0 ? `${-r}일 지남` : r === 0 ? '오늘' : `${r}일 남음`);

function MPill({ fg, bg, children, round }) { return <span className="m-pill" style={{ color: fg, background: bg, borderRadius: round ? 999 : 6 }}>{children}</span>; }
function MRisk({ r }) { const k = M_RISK[pbcUrg(r)]; return <MPill fg={k.fg} bg={k.bg} round>{k.label}</MPill>; }
function MStatus({ st }) { const [fg, bg] = M_STATUS[st]; return <MPill fg={fg} bg={bg}>{st}</MPill>; }

function MateShell({ s, set, children }) {
  const tabs = [['dash', '대시보드'], ['compose', '요청 작성'], ['analyze', '메일 분석']];
  return (
    <div className="pbc-app theme-mate m-app">
      <header className="m-top">
        <img src={(window.__resources && window.__resources.logo) || 'assets/samil-logo.png'} alt="PwC 삼일회계법인" className="m-logo" />
        <div className="m-appname">살살재촉</div>
        <span className="m-client">가나전자 · 2026 기말감사</span>
        <nav className="m-nav">{tabs.map(([k, l]) => <button key={k} className={'m-navb' + (s.tab === k ? ' on' : '')} onClick={() => set({ tab: k, panel: null })}>{l}</button>)}</nav>
        <div className="m-topr"><span className="m-date">오늘 날짜 {pbcMDW(s.today)}</span><MIconButton icon="setting" label="내 정보" onClick={() => set({ meOpen: !s.meOpen })} /></div>
        {s.meOpen && <div className="pbc-pop" style={{ top: 60 }}><div className="pbc-pop-h"><span className="t-headline2">내 정보</span><MIconButton icon="close" size="small" onClick={() => set({ meOpen: false })} /></div><div className="pbc-banner">내 정보를 바꾸면 메일 서명에 반영됩니다.</div><MTextField label="이름" value={s.me.name} onChange={(e) => set({ me: { ...s.me, name: e.target.value } })} clearable={false} /></div>}
      </header>
      <main className="m-main">{children}</main>
      <footer className="pbc-foot m-foot"><span>{s.me.name} · {s.me.firm} · {s.me.team}</span><span>데이터는 이 브라우저에만 저장됩니다</span></footer>
      {s.toast && <div className="pbc-toast"><MToast message={s.toast} variant="positive" width="auto" /></div>}
    </div>
  );
}

function MTimeline({ s, open }) {
  const start = pbcAdd(s.today, -4), span = 20, W = 1150;
  const x = (d) => Math.max(0, Math.min(W, (pbcDiff(d, start) / span) * W));
  const seg = [['over', -4, 0], ['today', 0, 1], ['soon', 1, 4], ['ok', 4, 16]];
  const ticks = [-4, 0, 3, 7, 14].map((n) => pbcAdd(s.today, n));
  return (
    <section className="m-tl">
      <div className="m-tl-h"><b>회신 기한 타임라인</b><span className="pbc-cap">오늘부터 각 자료의 회신 기한까지</span><span className="m-sp"></span>
        {['over', 'today', 'soon', 'ok'].map((k) => <span key={k} className="m-leg"><i style={{ background: M_RISK[k].line }}></i>{M_RISK[k].label}</span>)}
      </div>
      <div className="m-tl-c" style={{ width: W }}>
        {seg.map(([k, a, b]) => <div key={k} className="m-tl-seg" style={{ left: x(pbcAdd(s.today, a)), width: x(pbcAdd(s.today, Math.round(b))) - x(pbcAdd(s.today, a)), background: M_RISK[k].line }}></div>)}
        <div className="m-tl-now" style={{ left: x(s.today) - 7 }}></div>
        {ticks.map((t) => <div key={t} className={'m-tl-t' + (t === s.today ? ' now' : '')} style={{ left: x(t) }}>{t === s.today ? `오늘 ${pbcMD(t)}` : pbcMD(t)}</div>)}
        {open.map((it, i) => {
          const r = pbcRemain(it, s.today), k = M_RISK[pbcUrg(r)], up = i % 2 === 0, left = x(it.due);
          return (
            <React.Fragment key={it.id}>
              <div className="m-tl-dot" style={{ left: left - 6, background: k.fg }}></div>
              <div className="m-tl-stem" style={{ left: left - 1, top: up ? 40 : 62, background: k.fg }}></div>
              <div className={'m-tl-lab' + (s.highlight.includes(it.id) ? ' hl' : '')} style={{ left: Math.min(left - 10, W - 170), top: up ? 0 : 74, borderColor: i === 0 ? '#FFAA72' : '#DFE3E6' }}>
                <b>{it.name}</b><span style={{ color: k.fg }}>{pbcMD(it.due)} · {mLeftTxt(r)}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}

function MateDashboard({ s, set, A }) {
  const due = s.sort === 'due';
  const list = pbcSort(s.items, s.sort, s.today).filter((i) => i.status !== '완료');
  const top = list[0];
  const kp = (k) => list.filter((i) => pbcUrg(pbcRemain(i, s.today)) === k).length;
  const order = [], map = {};
  list.forEach((it) => { if (!map[it.owner]) { map[it.owner] = []; order.push(it.owner); } map[it.owner].push(it); });
  const openSingle = (it) => set({ panel: { type: 'single', ids: [it.id], level: pbcLevelFor(pbcRemain(it, s.today)), excluded: [] } });
  const openBundle = (o) => set({ panel: { type: 'bundle', owner: o, ids: map[o].slice().sort((a, b) => pbcRemain(a, s.today) - pbcRemain(b, s.today)).map((i) => i.id), level: pbcLevelFor(Math.min(...map[o].map((i) => pbcRemain(i, s.today)))), excluded: [] } });
  const tr = pbcRemain(top, s.today);
  return (
    <>
      <section className="m-insight">
        <div className="pbc-stack4">
          <span className="m-eyebrow">{due ? '회신 기한 기준 1순위' : '요청 경과 기준 1순위'}</span>
          <h1>{due ? <>{tr < 0 ? `기한이 ${-tr}일 지난` : tr === 0 ? '오늘 회신 기한인' : `${tr}일 남은`} ‘{top.name}’이 가장 급해요.</> : <>요청 후 {pbcElapsed(top, s.today)}일 지난 ‘{top.name}’이 가장 오래됐어요.</>}</h1>
          <span className="m-sub">회신 기한 {pbcMDW(top.due)} · {top.owner} {top.dept} · {top.status}{top.reason ? ` · ${top.reason}` : ''}</span>
        </div>
        <dl className="m-kpi">
          {[['over', '기한 지남', kp('over'), true], ['today', '오늘 기한', kp('today'), true], ['soon', '3일 이내', kp('soon')], ['todo', '남은 할 일', s.todos.length]].map(([k, l, v, hot], i) => (
            <React.Fragment key={k}>{i > 0 && <div className="m-kpi-sep"></div>}<div className="m-kpi-c"><dt>{l}</dt><dd style={hot && v ? { color: k === 'over' ? '#B42318' : '#D64000' } : null}>{v}<small style={{ fontFamily: 'var(--font-family-base)', fontSize: 13, color: '#6A727C', marginLeft: 3 }}>건</small></dd></div></React.Fragment>
          ))}
        </dl>
      </section>
      <section className="m-prio">
        <b>우선순위 기준</b>
        <div className="m-tog">
          {[['due', '감사 일정 기준', '회신 기한순'], ['elapsed', '요청 경과 기준', '경과일순']].map(([k, a, b]) => (
            <button key={k} className={s.sort === k ? 'on' : ''} onClick={() => set({ sort: k })}><span>{a}</span><b>{b}</b></button>
          ))}
        </div>
        <span className="m-hint">{due ? '감사 일정에 영향이 큰 자료부터 보여드려요.' : '요청한 지 오래된 자료부터 보여드려요.'}</span>
        {due && list.some((i) => i.id === 'bank') && <span className="m-jump"><MIcon name="arrowUp" size={12} />은행 잔액증명서 경과일순 6위 → 2위</span>}
      </section>
      <MTimeline s={s} open={pbcSort(s.items, 'due', s.today).filter((i) => i.status !== '완료')} />
      {!(window.__skip||{}).groups && <section className="m-groups-w">
        <div className="m-sec-h"><h2>담당자별로 묶어 독촉하기</h2><span className="pbc-cap">같은 담당자에게는 메일 한 통으로 · 가장 급한 자료가 있는 담당자부터</span></div>
        <div className="m-groups">
          {order.map((o, gi) => {
            const its = map[o], f = its[0], last = its.map((i) => i.last).filter(Boolean).sort().pop();
            return (
              <div key={o} className={'m-group' + (s.highlight.includes(o) ? ' hl' : '')}>
                <div className="m-group-h">
                  <span className="m-rank">{gi + 1}</span>
                  <div className="pbc-stack0" style={{ flex: 1 }}><span className="m-gname">{o} <small>{f.dept}</small></span><span className="pbc-cap">{last ? `마지막 독촉 ${pbcMD(last)}` : '독촉 기록 없음'} · 독촉 {its.reduce((n, i) => n + i.nudges, 0)}회</span></div>
                  <div className="m-gcount"><span>미완료</span><b>{its.length}건</b></div>
                </div>
                {its.map((it) => {
                  const r = pbcRemain(it, s.today), isTop = it.id === top.id;
                  return (
                    <div key={it.id} className={'m-irow' + (isTop ? ' top' : '') + (s.highlight.includes(it.id) ? ' hl' : '')} onClick={() => openSingle(it)}>
                      <div className="pbc-stack4" style={{ flex: 1, minWidth: 0 }}>
                        <span className="m-iname">{it.name}{isTop && <span className="m-topb">{due ? '가장 급함' : '가장 오래됨'}</span>}</span>
                        <span className="m-imeta"><MStatus st={it.status} /><span>{it.status === '보완 요청' ? it.reason : `요청 ${pbcMD(it.req)} · D+${pbcElapsed(it, s.today)}`}</span></span>
                      </div>
                      <div className="m-ileft"><b>{Math.abs(r)}<small>{r < 0 ? '일 지남' : r === 0 ? '오늘' : '일 남음'}</small></b><MRisk r={r} /></div>
                    </div>
                  );
                })}
                {its.length > 1
                  ? <button className="m-cta" onClick={() => openBundle(o)}>{its.length}건 묶어서 독촉 <span>· 메일 1통</span></button>
                  : <button className="m-cta sub" onClick={() => openSingle(f)}>{f.status === '보완 요청' ? '보완 요청 메일 쓰기' : `${f.name} 독촉하기`}</button>}
              </div>
            );
          })}
        </div>
      </section>}
      {!(window.__skip||{}).todo && <section className="m-todo">
        <b>해야 할 일 <span>{s.todos.length}</span></b>
        <div className="m-todo-l">
          {s.todos.map((t) => (
            <label key={t.id} className={'m-todo-i' + (s.highlight.includes(t.id) ? ' hl' : '')}>
              <MCheck size="small" checked={false} onChange={() => set({ todos: s.todos.filter((x) => x.id !== t.id), done: [{ ...t, date: s.today }, ...s.done] })} />
              <span>{t.text}</span><small>{t.due ? pbcMD(t.due) : '기한 없음'} · {t.src}</small>
            </label>
          ))}
        </div>
        <span className="m-done">내가 한 일 {s.done.length} <small>· {s.done[0] ? s.done[0].text : ''}</small></span>
      </section>}
      {s.panel && <MateDrawer s={s} set={set} A={A} />}
    </>
  );
}

function MTone({ level, rec, onPick }) {
  return (
    <div className="m-tone">
      <div className="m-tone-track"></div>
      <div className="m-tone-fill" style={{ width: `${((level - 1) / 3) * 75}%` }}></div>
      <div className="m-tone-g">
        {PBC_LEVELS.map((l, i) => (
          <button key={l} onClick={() => onPick(i + 1)} aria-pressed={level === i + 1}>
            {level === i + 1 ? <span className="m-dot on"></span> : <span className="m-dot-w"><span className="m-dot"></span></span>}
            <span className={'m-tone-l' + (level === i + 1 ? ' on' : '')}>{i + 1} {l}</span>
            {rec === i + 1 && <span className="m-tone-r">추천</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function MateDrawer({ s, set, A }) {
  const p = s.panel;
  const all = p.ids.map((id) => s.items.find((i) => i.id === id));
  const list = all.filter((i) => !p.excluded.includes(i.id));
  const first = all[0], fix = p.type === 'single' && first.status === '보완 요청';
  const r0 = pbcRemain(list[0] || first, s.today), rec = pbcLevelFor(r0);
  const mail = !list.length ? null : p.type === 'bundle' ? pbcMailBundle(list, p.level, s.me, s.today) : pbcMailSingle(first, p.level, s.me, s.today);
  const setP = (o) => set({ panel: { ...p, ...o } });
  const setItem = (o) => set({ items: s.items.map((i) => (i.id === first.id ? { ...i, ...o } : i)) });
  const next = pbcAdd(s.today, r0 <= 3 ? 1 : 2);
  const copy = () => { try { navigator.clipboard.writeText(`${mail.subject}\n\n${mail.body}`); } catch (e) {} setP({ copied: true }); };
  const k = M_RISK[pbcUrg(r0)];
  return (
    <>
      <div className="m-dim" onClick={() => set({ panel: null })}></div>
      <aside className="m-drawer">
        <div className="m-dr-h">
          <div className="pbc-stack4" style={{ flex: 1 }}>
            <span className="m-eyebrow">{p.type === 'bundle' ? '묶음 독촉' : fix ? '보완 요청' : '단건 독촉'}</span>
            <h2>{p.type === 'bundle' ? <>{first.owner} <small>{first.dept}</small></> : first.name}</h2>
            <span className="m-sub">{p.type === 'bundle' ? `미완료 ${all.length}건 · 독촉 ${all.reduce((n, i) => n + i.nudges, 0)}회` : `${first.owner} · ${first.dept} · ${first.client}`}</span>
          </div>
          {p.type === 'bundle' && <div className="m-merge"><b>요청 {list.length}건 → 메일 1통</b><span>개별 메일 {list.length}통 대신 한 통으로 정리</span></div>}
          <button className="m-close" onClick={() => set({ panel: null })} aria-label="닫기"><MIcon name="close" size={20} /></button>
        </div>
        <div className="m-dr-b">
          {p.type === 'single' && (
            <div className="m-tiles">
              <div><span>회신 기한</span><b>{pbcMDW(first.due)}</b><small>감사 절차 시작</small></div>
              <div style={{ background: k.bg }}><span style={{ color: k.fg }}>남은 날</span><b style={{ color: k.fg }}>{mLeftTxt(r0)}</b><small style={{ color: k.fg }}>{k.label}</small></div>
              <div><span>요청 후</span><b>D+{pbcElapsed(first, s.today)}</b><small>{pbcMD(first.req)} 요청 · {first.status}</small></div>
              <div><span>독촉 이력</span><b>{first.nudges}회</b><small>{first.last ? `마지막 ${pbcMD(first.last)}` : '기록 없음'}</small></div>
            </div>
          )}
          {p.type === 'bundle' && (
            <div className="m-brows">
              {all.map((it, i) => (
                <label key={it.id} className={p.excluded.includes(it.id) ? 'off' : ''}>
                  <MCheck size="small" checked={!p.excluded.includes(it.id)} onChange={() => setP({ excluded: p.excluded.includes(it.id) ? p.excluded.filter((x) => x !== it.id) : [...p.excluded, it.id], copied: false })} />
                  <span className="m-bno">{i + 1}</span>
                  <span className="pbc-stack0" style={{ flex: 1 }}><b>{it.name}</b><small>{it.status} · 요청 {pbcMD(it.req)} · D+{pbcElapsed(it, s.today)}</small></span>
                  <MRisk r={pbcRemain(it, s.today)} />
                  <span className="m-bleft">{Math.abs(pbcRemain(it, s.today))}<small>일</small></span>
                </label>
              ))}
              <div className="m-bnote"><span>순서</span><span>회신 기한이 가까운 자료부터 메일에 넣었어요.</span><span>말투</span><span>가장 급한 <b>{(list[0] || first).name}</b>에 맞춰 <b>{rec}단계 · {PBC_LEVELS[rec - 1]}</b></span></div>
            </div>
          )}
          {fix && (
            <div className="pbc-stack8">
              <div className="m-lbl">보완 사유</div>
              <div className="pbc-chips">{PBC_REASONS.map((rz) => <MChip key={rz} size="small" variant="outlined" active={first.reason === rz} label={rz} onClick={() => setItem({ reason: rz, detail: rz === '기준일 상이' ? first.asOf : '' })} />)}</div>
              {PBC_REASON_FIELD[first.reason] && <MTextField label={PBC_REASON_FIELD[first.reason]} value={first.detail || ''} onChange={(e) => setItem({ detail: e.target.value })} clearable={false} />}
            </div>
          )}
          <div className="pbc-stack4">
            <div className="m-lbl">공손함 <span className="pbc-cap">· 지금 추천: {rec}단계 ({mLeftTxt(r0)} 기준)</span></div>
            <MTone level={p.level} rec={rec} onPick={(l) => setP({ level: l, copied: false })} />
          </div>
          {mail && (
            <div className="m-mail">
              <div className="m-mail-h"><span>제목</span><b>{mail.subject}</b><span>받는 사람</span><span><em>{first.owner}</em> {first.dept}</span></div>
              <div className="m-mail-b">{mail.body}</div>
            </div>
          )}
          <div className="m-timing"><MIcon name="clock" size={16} /><span>오늘 오전 발송 권장 · 회신이 없으면 {pbcMD(next)} 오전에 다시 확인</span>{p.todoAdded ? <b>할 일에 추가됨</b> : <MTextButton size="small" variant="assistive" label="할 일에 추가" onClick={() => set(A.addTiming)} />}</div>
        </div>
        <div className="m-dr-f">
          <span className="pbc-cap">{p.copied ? '복사됨 · 메일 프로그램에 붙여넣어 보내세요.' : '복사 후 직접 보내고, 보냈으면 발송함으로 표시해 주세요.'}</span>
          <button className="m-btn sub" disabled={!mail} onClick={() => set(A.markSent)}>발송함으로 표시</button>
          <button className="m-btn" disabled={!mail} onClick={copy}>{p.copied ? '복사됨' : p.type === 'bundle' ? `${list.length}건 한 통으로 복사` : '복사'}</button>
        </div>
      </aside>
    </>
  );
}

function MateApp({ setup }) {
  const [s, set] = usePbcState(setup);
  return (
    <MateShell s={s} set={set}>
      {s.tab === 'dash' && <MateDashboard s={s} set={set} A={PBC_ACTIONS} />}
      {s.tab === 'compose' && <Compose s={s} set={set} A={PBC_ACTIONS} />}
      {s.tab === 'analyze' && <Analyze s={s} set={set} A={PBC_ACTIONS} />}
    </MateShell>
  );
}

Object.assign(window, { MateApp, MateShell, MateDashboard, MTimeline });
