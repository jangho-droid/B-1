const V3 = window.WantedDesignSystem_794458;
const { Button: VButton, IconButton: VIconButton, Checkbox: VCheck, SegmentedControl: VSeg, Toast: VToast, Icon: VIcon } = V3;

const V3_STATUS = { '미회신': 'wait', '일부 수령': 'ok', '보완 요청': 'fix', '완료': 'done' };

function V3Shell({ s, set, children }) {
  const tabs = [['dash', '대시보드'], ['compose', '자료 요청 작성'], ['analyze', '메일 분석']];
  return (
    <div className="pbc-app theme-3 v3-app">
      <header className="v3-top">
        <img src={(window.__resources && window.__resources.logo) || 'assets/samil-logo.png'} alt="PwC 삼일회계법인" className="v3-logo" />
        <span className="v3-vr"></span>
        <b className="v3-name">살살재촉</b>
        <nav className="v3-tabs">{tabs.map(([k, l]) => <button key={k} className={'v3-tab' + (s.tab === k ? ' on' : '')} onClick={() => set({ tab: k, panel: null })}>{l}</button>)}</nav>
        <span className="v3-sample">오늘 날짜 {pbcMDW(s.today)}</span>
        <VIconButton icon="setting" label="내 정보" onClick={() => set({ meOpen: !s.meOpen })} />
        {s.meOpen && <MePopover s={s} set={set} />}
      </header>
      <V3Hero s={s} set={set} />
      <main className="v3-main">{children}</main>
      <footer className="v3-foot"><b>{s.me.name}</b><span>{s.me.firm} · {s.me.team}</span><span>데이터는 이 브라우저에만 저장됩니다</span></footer>
      {s.toast && <div className="pbc-toast"><VToast message={s.toast} variant="positive" width="auto" /></div>}
    </div>
  );
}

function V3Hero({ s, set }) {
  const open = s.items.filter((i) => i.status !== '완료');
  const urgent = open.filter((i) => pbcRemain(i, s.today) <= 0).length + s.todos.filter((t) => t.due && pbcDiff(t.due, s.today) <= 0).length;
  const H = {
    compose: ['자료 요청 작성', '요청할 자료를 고르면 메일 문구를 써 드려요.'],
    analyze: ['메일 분석', '주고받은 메일에서 한 일과 해야 할 일을 찾아요.'],
  };
  return (
    <div className="v3-hero">
      <div className="v3-hero-in">
        {s.tab === 'dash' ? (
          <>
            <div className="pbc-stack4"><span className="v3-eye">{pbcMDW(s.today)} · {s.me.team}</span><h1>{s.me.name} 님, 오늘 챙길 일이 <em>{urgent}</em>건 있어요.</h1></div>
            <div className="v3-hero-a">
              <button className="v3-btn" onClick={() => set({ tab: 'compose' })}>요청 문구 작성</button>
              <button className="v3-btn primary" onClick={() => set({ tab: 'analyze' })}>메일 붙여넣고 분석</button>
            </div>
          </>
        ) : (
          <div className="pbc-stack4"><span className="v3-eye">{H[s.tab][0]}</span><h1>{H[s.tab][1]}</h1></div>
        )}
      </div>
    </div>
  );
}

function V3Tag({ d, today }) {
  if (!d) return <span className="v3-tag">기한 없음</span>;
  const r = pbcDiff(d, today);
  return <span className={'v3-tag' + (r <= 0 ? ' late' : '')}>{r < 0 ? `${pbcMD(d)} · 지남` : r === 0 ? '오늘' : pbcMDW(d)}</span>;
}
function V3Urg({ r }) {
  const k = pbcUrg(r);
  const t = k === 'over' ? `${-r}일 지남` : k === 'today' ? '오늘 기한' : `D-${r}`;
  return <span className={'v3-pill u-' + k}>{t}</span>;
}

function V3Dashboard({ s, set, A }) {
  const open = s.items.filter((i) => i.status !== '완료');
  const n = (k) => open.filter((i) => pbcUrg(pbcRemain(i, s.today)) === k).length;
  const rows = pbcSort(s.items, s.sort, s.today);
  const ranks = pbcRanks(s.items, s.today);
  const byOwner = {};
  open.forEach((i) => { (byOwner[i.owner] = byOwner[i.owner] || []).push(i); });
  const bundles = Object.entries(byOwner).filter(([, l]) => l.length >= 2);
  const openSingle = (it) => set({ panel: { type: 'single', ids: [it.id], level: pbcLevelFor(pbcRemain(it, s.today)), excluded: [] } });
  const openBundle = (o) => { const l = pbcSort(byOwner[o], 'due', s.today); set({ panel: { type: 'bundle', owner: o, ids: l.map((i) => i.id), level: pbcLevelFor(pbcRemain(l[0], s.today)), excluded: [] } }); };
  const todos = [...s.todos].sort((a, b) => (a.due || '99').localeCompare(b.due || '99'));
  const nm = (id) => (s.items.find((i) => i.id === id) || {});
  return (
    <>
      <div className="v3-kpis">
        {[['오늘 기한', n('today'), true], ['기한 지남', n('over'), true], ['3일 이내', n('soon')], ['남은 할 일', s.todos.length]].map(([l, v, hot]) => (
          <div key={l} className="v3-kpi"><span>{l}</span><b className={hot && v ? 'hot' : ''}>{v}</b></div>
        ))}
      </div>
      <div className="v3-cols">
        <section className="v3-card wide">
          <div className="v3-card-h"><h2>해야 할 일</h2><span className="v3-hint">회신 기한·메일 분석·발송 시점에서 모아요 · 체크하면 완료</span></div>
          {todos.map((t) => {
            const it = nm(t.link);
            return (
              <div key={t.id} className={'v3-row' + (s.highlight.includes(t.id) ? ' hl' : '')}>
                <VCheck size="small" checked={false} onChange={() => set({ todos: s.todos.filter((x) => x.id !== t.id), done: [{ ...t, date: s.today }, ...s.done] })} />
                <div className="v3-row-b"><b>{t.text}</b><span className="v3-meta"><V3Tag d={t.due} today={s.today} />{it.client && <span>{it.client}</span>}<span>출처 · {t.src}</span>{t.quote && <span>근거 · “{t.quote}”</span>}</span></div>
                {it.id && it.status !== '완료' && <button className="v3-btn sm" onClick={() => openSingle(it)}>문구 작성</button>}
              </div>
            );
          })}
        </section>
        <section className="v3-card narrow">
          <div className="v3-card-h"><h2>내가 한 일</h2><span className="v3-hint">보낸 메일 기준</span></div>
          {s.done.map((t) => (
            <div key={t.id} className={'v3-row' + (s.highlight.includes(t.id) ? ' hl' : '')}><span className="v3-date">{pbcMD(t.date)}</span><div className="v3-row-b"><span>{t.text}</span><span className="v3-meta"><span>{t.src}</span></span></div></div>
          ))}
        </section>
      </div>
      <section className="v3-card">
        <div className="v3-card-h">
          <h2>요청 자료 현황</h2>
          <div className="v3-card-r"><span className="v3-hint">미회신 → 일부 수령 → 보완 요청 → 완료</span><VSeg size="small" width={196} items={['회신 기한순', '경과일순']} value={s.sort === 'due' ? 0 : 1} onChange={(i) => set({ sort: i ? 'elapsed' : 'due' })} /></div>
        </div>
        {bundles.map(([o, l]) => (
          <div key={o} className={'v3-bundle' + (s.highlight.includes(o) ? ' hl' : '')}><span className="v3-sq">{l.length}</span><span><b>{o}님</b>({l[0].dept})의 미완료 {l.length}건을 메일 한 통으로 보낼 수 있어요.</span><button className="v3-btn sm primary" onClick={() => openBundle(o)}>묶어서 독촉</button></div>
        ))}
        <table className="v3-table">
          <thead><tr><th>#</th><th>클라이언트</th><th>요청 자료</th><th>담당자</th><th>요청일</th><th>회신 기한</th><th>상태</th><th></th></tr></thead>
          <tbody>
            {rows.map((it, i) => {
              const r = pbcRemain(it, s.today), done = it.status === '완료', rk = ranks[it.id];
              const jump = s.sort === 'due' && rk && rk.e - rk.d >= 2;
              return (
                <tr key={it.id} className={(s.highlight.includes(it.id) ? 'hl ' : '') + (done ? 'done' : '')}>
                  <td className="v3-num">{done ? '–' : i + 1}</td>
                  <td>{it.client}</td>
                  <td><b>{it.name}</b>{it.isNew && <span className="v3-new">새로 등록</span>}{jump && <div className="v3-jump">경과일순 {rk.e}위 → {rk.d}위</div>}{it.memo && <div className="v3-memo">{it.memo}</div>}</td>
                  <td>{it.owner}<div className="v3-sub">{it.dept}</div></td>
                  <td className="v3-num">{pbcMD(it.req)}{s.sort === 'elapsed' && <div className="v3-sub">{pbcElapsed(it, s.today)}일 경과</div>}</td>
                  <td className="v3-num">{pbcMDW(it.due)}{!done && <div><V3Urg r={r} /></div>}</td>
                  <td><span className={'v3-pill s-' + V3_STATUS[it.status]}>{it.status}</span>{it.reason && it.status === '보완 요청' && <div className="v3-sub">{it.reason}</div>}</td>
                  <td>{!done && <button className={'v3-btn sm' + (r <= 0 ? ' primary' : '')} onClick={() => openSingle(it)}>{it.status === '보완 요청' ? '보완 요청' : '독촉 메일'}</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      {s.panel && <MailPanel s={s} set={set} A={A} />}
    </>
  );
}

function V3App({ setup }) {
  const [s, set] = usePbcState(setup);
  return (
    <V3Shell s={s} set={set}>
      {s.tab === 'dash' && <V3Dashboard s={s} set={set} A={PBC_ACTIONS} />}
      {s.tab === 'compose' && <Compose s={s} set={set} A={PBC_ACTIONS} />}
      {s.tab === 'analyze' && <Analyze s={s} set={set} A={PBC_ACTIONS} />}
    </V3Shell>
  );
}

Object.assign(window, { V3App });
