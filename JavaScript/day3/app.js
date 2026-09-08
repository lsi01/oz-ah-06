// 실시간 암호화폐 가격 변동 추적기 (JavaScript 3일차 [필수] + 추가 기능)
//
// [필수]
//   - 매초 Binance API(GET)로 시세를 받아 목록을 실시간 갱신
//   - USDT 페어만 표시 / 심볼 검색 / LocalStorage 관심 종목 / 전체보기·관심목록 탭
//
// [추가]
//   1. 종목 클릭 -> 상세 패널 : 종가 라인차트 + 이동평균선(SMA 20/50) + RSI(14)
//   2. 시장 동향 : 상승/하락 비율, 평균 변동률, 급등·급락·거래대금 Top 5
//   3. 정렬 가능한 컬럼
//   + 로딩·에러 처리, 적응형 숫자 포맷, 탭 숨김 시 폴링 정지, 가격 변동 플래시

// ===== 설정 =========================================================
const API_BASES = [
  "https://api4.binance.com", // 과제 지정 엔드포인트
  "https://api.binance.com", //  실패 시 대체
];
const TICKER_MS = 1000; //  시세 폴링 주기 (필수 요건: 매초)
const KLINE_MS = 10000; //   상세 패널 차트 갱신 주기
const LS_KEY = "cryptoTracker";
const SORT_KEYS = [
  "symbol",
  "lastPrice",
  "priceChangePercent",
  "quoteVolume",
  "highPrice",
  "lowPrice",
];

let apiBase = API_BASES[0];

// ===== 상태 =========================================================
const state = {
  tickers: [], //          최신 USDT 티커 배열
  prevPrice: new Map(), //  직전 폴링 시점의 가격 (플래시 방향 판단용)
  favorites: new Set(sanitizeArray(load("favorites", []))),
  tab: ["all", "fav"].includes(load("tab", "all")) ? load("tab", "all") : "all",
  search: "",
  sort: sanitizeSort(load("sort", { key: "quoteVolume", dir: "desc" })),
  detail: null, //         { symbol, interval, timer } 상세 패널 열림 상태
};

let pollTimer = null; //   시세 폴링 setTimeout 핸들
let pollGen = 0; //        폴링 세대 번호 (탭 전환 중 중복 폴링 방지)
const rowEls = new Map(); // symbol -> <tr>  (행을 매번 새로 만들지 않고 재사용)

// ===== DOM ==========================================================
const $ = (sel) => document.querySelector(sel);
const el = {
  status: $("#status"),
  updated: $("#updated"),
  breadthUp: $("#breadthUp"),
  breadthDown: $("#breadthDown"),
  countUp: $("#countUp"),
  countDown: $("#countDown"),
  countFlat: $("#countFlat"),
  avgChange: $("#avgChange"),
  boardGainers: $("#boardGainers"),
  boardLosers: $("#boardLosers"),
  boardVolume: $("#boardVolume"),
  favCount: $("#favCount"),
  search: $("#search"),
  tbody: $("#tbody"),
  thead: $(".coin-table thead"),
  detail: $("#detail"),
  detailClose: $("#detailClose"),
  detailTitle: $("#detailTitle"),
  detailPrice: $("#detailPrice"),
  intervalButtons: $("#intervalButtons"),
  chart: $("#chart"),
  indicators: $("#indicators"),
  detailNote: $("#detailNote"),
};

// ===== LocalStorage 헬퍼 ===========================================
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(`${LS_KEY}.${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try {
    localStorage.setItem(`${LS_KEY}.${key}`, JSON.stringify(value));
  } catch {
    /* 사생활 모드 등 저장 실패 - 무시 */
  }
}
function sanitizeArray(v) {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}
function sanitizeSort(v) {
  const ok = v && SORT_KEYS.includes(v.key) && ["asc", "desc"].includes(v.dir);
  return ok ? v : { key: "quoteVolume", dir: "desc" };
}

// ===== 숫자 포맷 ====================================================
// 가격대가 BTC(수만) ~ SHIB(0.0000x) 까지 넓어 자리수를 자동 조절
function fmtPrice(n) {
  n = Number(n);
  if (!isFinite(n)) return "-";
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.01) return n.toFixed(4);
  if (n > 0) {
    const s = n.toPrecision(4);
    return s.includes("e") ? n.toFixed(10) : s; // 초저가 지수표기 방지
  }
  return "0";
}
function fmtVolume(n) {
  n = Number(n);
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toFixed(0);
}
function fmtPct(n) {
  n = Number(n);
  return (n > 0 ? "+" : "") + n.toFixed(2) + "%";
}
function dirClass(n) {
  return n > 0 ? "up" : n < 0 ? "down" : "flat";
}
// "BTCUSDT" -> "BTC/USDT"
function label(symbol) {
  return symbol.replace(/USDT$/, "/USDT");
}

// ===== API =========================================================
async function fetchJSON(path) {
  // 기본 베이스가 실패하면 대체 베이스로 한 번 더 시도
  let lastErr;
  for (const base of [apiBase, ...API_BASES.filter((b) => b !== apiBase)]) {
    try {
      const res = await fetch(base + path);
      if (res.status === 418 || res.status === 429) {
        throw new Error("rate-limit " + res.status); // 재시도해도 같은 결과 -> 바로 중단
      }
      if (!res.ok) throw new Error("HTTP " + res.status);
      apiBase = base;
      return await res.json();
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

// 매초 실행 : 전체 티커 -> USDT 페어만 추려 저장 후 렌더
async function pollTickers() {
  try {
    const all = await fetchJSON("/api/v3/ticker/24hr");
    // 새 데이터로 교체하기 전에 직전 가격을 스냅샷 (플래시 방향 계산용)
    state.prevPrice = new Map(
      state.tickers.map((t) => [t.symbol, Number(t.lastPrice)])
    );
    state.tickers = all.filter(
      (t) => t.symbol.endsWith("USDT") && Number(t.quoteVolume) > 0
    );
    setStatus("live");
    el.updated.textContent =
      "마지막 업데이트 " + new Date().toLocaleTimeString("ko-KR");
    renderMarket(); // 시장 동향은 새 데이터가 왔을 때만
    render(true); //   fresh=true : 새 시세이므로 가격 변동 플래시 허용
  } catch (err) {
    console.error("[ticker]", err);
    const rl = String(err.message).includes("rate-limit");
    setStatus(rl ? "ratelimit" : "error");
    if (!state.tickers.length) {
      el.tbody.innerHTML =
        '<tr class="empty-row"><td colspan="8">데이터를 불러오지 못했습니다. 재시도 중…</td></tr>';
    }
  }
}

function setStatus(kind) {
  const map = {
    live: ["live", "🟢 실시간"],
    error: ["error", "🔴 연결 오류 · 재시도 중"],
    ratelimit: ["error", "🟠 요청 제한 · 잠시 후 재시도"],
    loading: ["", "연결 중…"],
  };
  const [cls, text] = map[kind] || map.loading;
  el.status.className = "status " + cls;
  el.status.textContent = text;
}

// 폴링 시작/중지 : setTimeout 체인 (요청이 밀려도 중첩되지 않게)
// 세대 번호로 이전 체인을 무효화 -> 탭을 빠르게 전환해도 폴링이 두 갈래로 갈라지지 않음
function startPolling() {
  const gen = ++pollGen;
  const tick = async () => {
    if (gen !== pollGen) return;
    await pollTickers();
    if (gen === pollGen) pollTimer = setTimeout(tick, TICKER_MS);
  };
  tick();
}
function stopPolling() {
  pollGen++; // 진행 중이던 tick 무효화
  clearTimeout(pollTimer);
}

// ===== 렌더 : 시장 동향 ============================================
function renderMarket() {
  const list = state.tickers;
  if (!list.length) return;

  let up = 0,
    down = 0,
    flat = 0,
    sum = 0;
  for (const t of list) {
    const p = Number(t.priceChangePercent);
    sum += p;
    if (p > 0) up++;
    else if (p < 0) down++;
    else flat++;
  }
  const total = list.length;
  el.breadthUp.style.width = (up / total) * 100 + "%";
  el.breadthDown.style.width = (down / total) * 100 + "%";
  el.countUp.textContent = up;
  el.countDown.textContent = down;
  el.countFlat.textContent = flat;
  const avg = sum / total;
  el.avgChange.textContent = fmtPct(avg);
  el.avgChange.className = dirClass(avg);

  const byChange = [...list].sort(
    (a, b) => Number(b.priceChangePercent) - Number(a.priceChangePercent)
  );
  const byVolume = [...list].sort(
    (a, b) => Number(b.quoteVolume) - Number(a.quoteVolume)
  );
  fillBoard(el.boardGainers, byChange.slice(0, 5), "pct");
  fillBoard(el.boardLosers, byChange.slice(-5).reverse(), "pct");
  fillBoard(el.boardVolume, byVolume.slice(0, 5), "vol");
}

function fillBoard(ul, rows, mode) {
  ul.innerHTML = rows
    .map((t) => {
      const p = Number(t.priceChangePercent);
      const right =
        mode === "vol"
          ? `<span class="val">${fmtVolume(t.quoteVolume)}</span>`
          : `<span class="val ${dirClass(p)}">${fmtPct(p)}</span>`;
      return `<li data-symbol="${t.symbol}"><span class="sym">${label(
        t.symbol
      )}</span>${right}</li>`;
    })
    .join("");
}

// ===== 렌더 : 코인 테이블 =========================================
function visibleRows() {
  let rows = state.tickers;
  if (state.tab === "fav") rows = rows.filter((t) => state.favorites.has(t.symbol));
  const q = state.search.trim().toUpperCase().replace(/\//g, ""); // "BTC/USDT" 도 허용
  if (q) rows = rows.filter((t) => t.symbol.includes(q));

  const { key, dir } = state.sort;
  const mul = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (key === "symbol") return a.symbol.localeCompare(b.symbol) * mul;
    return (Number(a[key]) - Number(b[key])) * mul;
  });
}

// 코인 테이블만 다시 그린다 (검색/정렬/탭/별표 등 잦은 갱신)
//   fresh : 폴링으로 새 시세가 왔을 때만 true -> 가격 변동 플래시 재생
function render(fresh = false) {
  el.favCount.textContent = state.favorites.size;

  const rows = visibleRows();

  if (!rows.length) {
    el.tbody.innerHTML = `<tr class="empty-row"><td colspan="8">${
      state.tab === "fav"
        ? "관심목록이 비어 있습니다. ☆ 를 눌러 추가하세요."
        : "일치하는 종목이 없습니다."
    }</td></tr>`;
    rowEls.clear();
  } else {
    const placeholder = el.tbody.querySelector(".empty-row");
    if (placeholder) placeholder.remove();

    // 행을 새로 만들지 않고 재사용 + 필요한 셀만 갱신 (스크롤/클릭 대상 안정)
    const seen = new Set();
    let prev = null;
    for (const t of rows) {
      seen.add(t.symbol);
      let tr = rowEls.get(t.symbol);
      if (!tr) {
        tr = buildRow(t); // 새 행은 플래시 없음
        rowEls.set(t.symbol, tr);
      } else {
        updateRow(tr, t, fresh);
      }
      const ref = prev ? prev.nextElementSibling : el.tbody.firstElementChild;
      if (ref !== tr) el.tbody.insertBefore(tr, ref);
      prev = tr;
    }
    for (const [sym, tr] of rowEls) {
      if (!seen.has(sym)) {
        tr.remove();
        rowEls.delete(sym);
      }
    }
  }

  if (state.detail) {
    const t = state.tickers.find((x) => x.symbol === state.detail.symbol);
    if (t) updateDetailPrice(t);
  }
  updateSortIndicator();
}

function buildRow(t) {
  const tr = document.createElement("tr");
  tr.dataset.symbol = t.symbol;
  tr.innerHTML =
    `<td class="col-fav"><button type="button" class="star" aria-pressed="false" aria-label="관심 등록">☆</button></td>` +
    `<td class="col-symbol">${label(t.symbol)}</td>` +
    `<td class="num c-price"></td>` +
    `<td class="num chg c-chg"></td>` +
    `<td class="num c-vol"></td>` +
    `<td class="num c-high"></td>` +
    `<td class="num c-low"></td>` +
    // [추가] 24h 저가~고가 중 현재가 위치 게이지
    `<td class="c-range"><span class="range-track"><span class="range-dot"></span></span></td>`;
  updateRow(tr, t);
  return tr;
}

function updateRow(tr, t, fresh = false) {
  const price = Number(t.lastPrice);
  const prev = state.prevPrice.get(t.symbol);
  const priceCell = tr.querySelector(".c-price");
  const text = fmtPrice(price);
  if (priceCell.textContent !== text) priceCell.textContent = text;
  // 가격 변동 플래시 : 새 시세(fresh)일 때만, Web Animations API 로 재생
  if (fresh && prev !== undefined && prev !== price) {
    const color =
      price > prev ? "rgba(225,45,57,.28)" : "rgba(29,78,216,.28)";
    priceCell.animate(
      [{ backgroundColor: color }, { backgroundColor: "transparent" }],
      { duration: 700, easing: "ease-out" }
    );
  }

  const p = Number(t.priceChangePercent);
  const chgCell = tr.querySelector(".c-chg");
  chgCell.textContent = fmtPct(p);
  chgCell.className = "num chg c-chg " + dirClass(p);

  tr.querySelector(".c-vol").textContent = fmtVolume(t.quoteVolume);
  tr.querySelector(".c-high").textContent = fmtPrice(t.highPrice);
  tr.querySelector(".c-low").textContent = fmtPrice(t.lowPrice);

  // 24h 위치 게이지 : (현재가 - 저가) / (고가 - 저가)
  const hi = Number(t.highPrice);
  const lo = Number(t.lowPrice);
  const pos = hi > lo ? Math.min(1, Math.max(0, (price - lo) / (hi - lo))) : 0.5;
  const rangeCell = tr.querySelector(".c-range");
  rangeCell.querySelector(".range-dot").style.left = (pos * 100).toFixed(1) + "%";
  rangeCell.title = `24h 저가 대비 ${Math.round(pos * 100)}% 지점`;

  const on = state.favorites.has(t.symbol);
  const star = tr.querySelector(".star");
  star.textContent = on ? "★" : "☆";
  star.classList.toggle("on", on);
  star.setAttribute("aria-pressed", on ? "true" : "false");
  star.setAttribute("aria-label", on ? "관심 해제" : "관심 등록");
}

function updateSortIndicator() {
  el.thead.querySelectorAll(".sortable").forEach((th) => {
    th.classList.remove("sorted-asc", "sorted-desc");
    if (th.dataset.sort === state.sort.key) {
      th.classList.add(state.sort.dir === "asc" ? "sorted-asc" : "sorted-desc");
    }
  });
}

// ===== 기술적 지표 계산 ===========================================
// 단순이동평균 : values 와 같은 길이, 데이터 부족 구간은 null
function sma(values, period) {
  const out = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}

// 볼린저 밴드 : 중심선 = SMA(period), 상/하단 = 중심선 ± mult * 표준편차
// mid / upper / lower 를 values 와 같은 길이로 (데이터 부족 구간은 null)
function bollinger(values, period = 20, mult = 2) {
  const mid = sma(values, period);
  const upper = [];
  const lower = [];
  for (let i = 0; i < values.length; i++) {
    if (mid[i] == null) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    let sq = 0;
    for (let j = i - period + 1; j <= i; j++) sq += (values[j] - mid[i]) ** 2;
    const sd = Math.sqrt(sq / period);
    upper.push(mid[i] + mult * sd);
    lower.push(mid[i] - mult * sd);
  }
  return { mid, upper, lower };
}

// RSI (Wilder 방식) : 마지막 값 하나만 반환
function rsi(closes, period = 14) {
  if (closes.length < period + 1) return null;
  let gain = 0,
    loss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gain += diff;
    else if (diff < 0) loss -= diff;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const g = diff > 0 ? diff : 0;
    const l = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

// ===== 상세 패널 ==================================================
function openDetail(symbol) {
  if (state.detail) clearInterval(state.detail.timer);
  state.detail = { symbol, interval: "1h", timer: null };
  el.detail.hidden = false;
  el.detailTitle.textContent = label(symbol);
  el.indicators.innerHTML = "";
  el.chart.innerHTML = "";
  el.detailNote.textContent = "차트를 불러오는 중…";

  const t = state.tickers.find((x) => x.symbol === symbol);
  if (t) updateDetailPrice(t);

  setActiveInterval("1h");
  loadChart();
  state.detail.timer = setInterval(loadChart, KLINE_MS);
}

function closeDetail() {
  if (state.detail) clearInterval(state.detail.timer);
  state.detail = null;
  el.detail.hidden = true;
}

function updateDetailPrice(t) {
  const p = Number(t.priceChangePercent);
  el.detailPrice.innerHTML = `${fmtPrice(t.lastPrice)} <span class="chg ${dirClass(
    p
  )}">${fmtPct(p)} (24h)</span>`;
}

function setActiveInterval(interval) {
  el.intervalButtons.querySelectorAll("button").forEach((b) => {
    b.classList.toggle("active", b.dataset.interval === interval);
  });
}

async function loadChart() {
  if (!state.detail) return;
  const { symbol, interval } = state.detail;
  try {
    const raw = await fetchJSON(
      `/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=150`
    );
    // 응답이 오는 사이 심볼/간격이 바뀌었으면 버린다
    if (
      !state.detail ||
      state.detail.symbol !== symbol ||
      state.detail.interval !== interval
    )
      return;

    // klines: [openTime, open, high, low, close, volume, closeTime, quoteVolume, ...]
    const candles = raw.map((k) => ({
      open: Number(k[1]),
      close: Number(k[4]),
      vol: Number(k[7]), // 거래대금(USDT)
    }));
    const closes = candles.map((c) => c.close);
    if (closes.length < 2) {
      el.chart.innerHTML = "";
      el.indicators.innerHTML = "";
      el.detailNote.textContent = "차트를 그릴 데이터가 부족합니다.";
      return;
    }
    const bb = bollinger(closes, 20, 2); // bb.mid = SMA20
    const s50 = sma(closes, 50);
    drawChart(candles, closes, bb, s50);
    renderIndicators(closes, candles, bb, s50);
    el.detailNote.textContent = `${interval} 봉 ${closes.length}개 · ${
      KLINE_MS / 1000
    }초마다 갱신 · SMA/RSI/볼린저(20,2)·거래량은 클라이언트 계산`;
  } catch (err) {
    console.error("[klines]", err);
    el.detailNote.textContent = "차트 데이터를 불러오지 못했습니다.";
  }
}

function drawChart(candles, closes, bb, s50) {
  const W = 640,
    H = 240,
    padX = 6;
  const priceTop = 12,
    priceBot = 176; //  가격/이평/볼린저 영역
  const volTop = 190,
    volBot = 234; //     거래량 막대 영역

  // 가격 y 스케일 : 종가 + 볼린저 상/하단 + SMA50 을 모두 포함
  let min = Infinity,
    max = -Infinity;
  for (const arr of [closes, bb.upper, bb.lower, s50]) {
    for (const v of arr) {
      if (v == null) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  const n = closes.length;
  const span = max - min;
  const x = (i) => padX + (i / (n - 1)) * (W - padX * 2);
  const y = (v) =>
    span
      ? priceTop + (1 - (v - min) / span) * (priceBot - priceTop)
      : (priceTop + priceBot) / 2; // 평탄하면 가운데

  const pathOf = (arr) => {
    let d = "";
    let pen = false;
    arr.forEach((v, i) => {
      if (v == null) {
        pen = false;
        return;
      }
      d += (pen ? " L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1);
      pen = true;
    });
    return d;
  };

  // 볼린저 밴드 : 상단(정방향) -> 하단(역방향) 으로 이어 붙여 채운 영역
  let band = "";
  const idx = bb.upper.map((v, i) => (v == null ? -1 : i)).filter((i) => i >= 0);
  if (idx.length >= 2) {
    band = "M";
    idx.forEach((i, k) => {
      band += (k ? " L" : "") + x(i).toFixed(1) + " " + y(bb.upper[i]).toFixed(1);
    });
    for (let k = idx.length - 1; k >= 0; k--) {
      const i = idx[k];
      band += " L" + x(i).toFixed(1) + " " + y(bb.lower[i]).toFixed(1);
    }
    band += " Z";
  }

  // 거래량 막대 : 봉이 오르면 빨강, 내리면 파랑 (옅게)
  const maxVol = Math.max(
    ...candles.map((c) => (Number.isFinite(c.vol) ? c.vol : 0)),
    1
  );
  const barW = Math.max(1, ((W - padX * 2) / n) * 0.6);
  const bars = candles
    .map((c, i) => {
      const vol = Number.isFinite(c.vol) ? c.vol : 0;
      const h = (vol / maxVol) * (volBot - volTop);
      const cls = c.close >= c.open ? "c-vol-up" : "c-vol-down";
      return `<rect class="${cls}" x="${(x(i) - barW / 2).toFixed(1)}" y="${(
        volBot - h
      ).toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}"/>`;
    })
    .join("");

  el.chart.innerHTML =
    bars +
    (band ? `<path class="c-band" d="${band}"/>` : "") +
    `<path class="c-sma50" d="${pathOf(s50)}"/>` +
    `<path class="c-sma20" d="${pathOf(bb.mid)}"/>` +
    `<path class="c-price" d="${pathOf(closes)}"/>`;
}

function renderIndicators(closes, candles, bb, s50arr) {
  const last = closes[closes.length - 1];
  const s20 = bb.mid[bb.mid.length - 1]; // 볼린저 중심선 = SMA20
  const s50 = s50arr[s50arr.length - 1];
  const r = rsi(closes, 14);
  const bUp = bb.upper[bb.upper.length - 1];
  const bLo = bb.lower[bb.lower.length - 1];

  const maCard = (name, value) => {
    if (value == null)
      return `<div class="ind"><div class="ind-label">${name}</div><div class="ind-value">데이터 부족</div></div>`;
    const above = last >= value;
    return `<div class="ind">
      <div class="ind-label">${name}</div>
      <div class="ind-value">${fmtPrice(value)}</div>
      <span class="tag ${above ? "bull" : "bear"}">현재가 ${
      above ? "상회 ▲" : "하회 ▼"
    }</span>
    </div>`;
  };

  let trend = `<div class="ind"><div class="ind-label">추세 (SMA20 vs SMA50)</div><div class="ind-value">데이터 부족</div></div>`;
  if (s20 != null && s50 != null) {
    const golden = s20 >= s50;
    trend = `<div class="ind">
      <div class="ind-label">추세 (SMA20 vs SMA50)</div>
      <div class="ind-value">${golden ? "정배열" : "역배열"}</div>
      <span class="tag ${golden ? "bull" : "bear"}">${
      golden ? "단기 > 장기 (상승 우위)" : "단기 < 장기 (하락 우위)"
    }</span>
    </div>`;
  }

  let rsiCard = `<div class="ind"><div class="ind-label">RSI (14)</div><div class="ind-value">데이터 부족</div></div>`;
  if (r != null) {
    const zone =
      r >= 70 ? ["bull", "과매수"] : r <= 30 ? ["bear", "과매도"] : ["neutral", "중립"];
    rsiCard = `<div class="ind">
      <div class="ind-label">RSI (14)</div>
      <div class="ind-value">${r.toFixed(1)}</div>
      <span class="tag ${zone[0]}">${zone[1]}</span>
      <div class="rsi-gauge"><span class="marker" style="left:${r}%"></span></div>
    </div>`;
  }

  // 볼린저 밴드 %b : (현재가 - 하단) / (상단 - 하단). >1 상단 돌파(과열), <0 하단 이탈
  let bbCard = `<div class="ind"><div class="ind-label">볼린저 %b (20, 2σ)</div><div class="ind-value">데이터 부족</div></div>`;
  if (bUp != null && bLo != null && bUp > bLo) {
    const pb = (last - bLo) / (bUp - bLo);
    const z =
      pb > 1 ? ["bull", "상단 돌파"] : pb < 0 ? ["bear", "하단 이탈"] : ["neutral", "밴드 내"];
    bbCard = `<div class="ind">
      <div class="ind-label">볼린저 %b (20, 2σ)</div>
      <div class="ind-value">${(pb * 100).toFixed(0)}%</div>
      <span class="tag ${z[0]}">${z[1]}</span>
      <div class="rsi-gauge"><span class="marker" style="left:${Math.min(
        100,
        Math.max(0, pb * 100)
      )}%"></span></div>
    </div>`;
  }

  // 거래량 : 마지막 '완성된' 봉 vs 그 직전 20봉 평균
  //   (klines 의 맨 끝 봉은 아직 진행 중이라 제외)
  let volCard = `<div class="ind"><div class="ind-label">거래량 (직전 봉/20봉 평균)</div><div class="ind-value">데이터 부족</div></div>`;
  if (candles.length >= 22) {
    const recent = candles[candles.length - 2].vol;
    let s = 0;
    for (let i = candles.length - 22; i < candles.length - 2; i++) s += candles[i].vol;
    const avg = s / 20;
    const ratio = avg ? recent / avg : 0;
    const z =
      ratio >= 2 ? ["bull", "급증 🔥"] : ratio <= 0.5 ? ["neutral", "위축"] : ["neutral", "평이"];
    volCard = `<div class="ind">
      <div class="ind-label">거래량 (직전 봉/20봉 평균)</div>
      <div class="ind-value">${ratio.toFixed(2)}x</div>
      <span class="tag ${z[0]}">${z[1]}</span>
    </div>`;
  }

  el.indicators.innerHTML =
    maCard("SMA 20", s20) +
    maCard("SMA 50", s50) +
    trend +
    rsiCard +
    bbCard +
    volCard;
}

// ===== 이벤트 =====================================================
document.querySelector(".tabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  state.tab = btn.dataset.tab;
  save("tab", state.tab);
  document
    .querySelectorAll(".tab")
    .forEach((b) => b.classList.toggle("active", b === btn));
  render();
});

el.search.addEventListener("input", (e) => {
  state.search = e.target.value;
  render();
});

el.thead.addEventListener("click", (e) => {
  const th = e.target.closest(".sortable");
  if (!th) return;
  const key = th.dataset.sort;
  if (state.sort.key === key) {
    state.sort.dir = state.sort.dir === "asc" ? "desc" : "asc";
  } else {
    state.sort.key = key;
    state.sort.dir = key === "symbol" ? "asc" : "desc";
  }
  save("sort", state.sort);
  render();
});

// 테이블 : 관심 셀 클릭 -> 별표 토글 / 그 외 행 클릭 -> 상세
el.tbody.addEventListener("click", (e) => {
  const favCell = e.target.closest(".col-fav");
  if (favCell) {
    const sym = favCell.closest("tr[data-symbol]").dataset.symbol;
    if (state.favorites.has(sym)) state.favorites.delete(sym);
    else state.favorites.add(sym);
    save("favorites", [...state.favorites]);
    render();
    return;
  }
  const tr = e.target.closest("tr[data-symbol]");
  if (tr) openDetail(tr.dataset.symbol);
});

document.querySelector(".boards").addEventListener("click", (e) => {
  const li = e.target.closest("li[data-symbol]");
  if (li) openDetail(li.dataset.symbol);
});

el.detailClose.addEventListener("click", closeDetail);
el.detail.addEventListener("click", (e) => {
  if (e.target === el.detail) closeDetail();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state.detail) closeDetail();
});
el.intervalButtons.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn || !state.detail) return;
  state.detail.interval = btn.dataset.interval;
  setActiveInterval(btn.dataset.interval);
  clearInterval(state.detail.timer); // 갱신 타이머 리셋
  loadChart();
  state.detail.timer = setInterval(loadChart, KLINE_MS);
});

// 탭이 백그라운드면 폴링 정지 (API 부하 절약), 복귀하면 재개
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopPolling();
    if (state.detail) clearInterval(state.detail.timer);
  } else {
    startPolling();
    if (state.detail) {
      clearInterval(state.detail.timer);
      loadChart();
      state.detail.timer = setInterval(loadChart, KLINE_MS);
    }
  }
});

// ===== 시작 =======================================================
setStatus("loading");
updateSortIndicator();
startPolling();
