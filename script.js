/**************************************************
 * 1) 옵션(선택지): 누구랑/언제/분위기
 **************************************************/
const OPTIONS = {
  withWho: ["친구", "데이트", "단체", "가족"],
  when: ["1차", "2차", "늦은 밤", "주말", "비 오는 날", "시험 후"],
  mood: ["조용함", "시끌벅적", "감성있는", "분위기 좋은", "신나는", "안주가 맛있는"],
};

/**************************************************
 * 2) 카테고리(주종)
 **************************************************/
const CATEGORIES = [
  { key: "소주",   image: "images/categoriess/soju.jpg",   desc: "술은 소주지" },
  { key: "맥주",   image: "images/categoriess/beer.jpg",   desc: "수제맥주·펍" },
  { key: "와인",   image: "images/categoriess/wine.jpg",   desc: "느좋 와인바" },
  { key: "위스키", image: "images/categoriess/whisky.jpg", desc: "칵테일 바" },
];

/**************************************************
 * 3) 가게 데이터 (여기만 채우면 됨)
 * - tags.withWho / tags.when / tags.mood : 배열
 * - naverUrl : 네이버지도 링크(플레이스)
 **************************************************/
const SHOPS_BY_CATEGORY = {
  "소주": [
    {
  id: "soju-001",
  name: "생선구이",
  oneLine: "오전 7시까지 영업하는 생선구이, 참계란탕 맛집",
  priceRange: "1인 20,000~35,000원",
  image: "images/shops/fish.jpg",
  curationNote: "아침까지 달리고 싶을 때. 든든한 안주가 먹고 싶을 때.",
  pros: ["사장님 친화력이 좋으심", "안주 든든", "모임에 적합"],
  cons: ["화장실이 불편함", "시끌벅적할 수 있음"],
  tags: {
    withWho: ["친구"],
    when: [ "2차", "늦은 밤"],
    mood: ["시끌벅적"],
  },
  naverUrl: "https://naver.me/5MVzupQP" // 네이버지도 링크
}
],
  "맥주": [{
  id: "beer-001",
  name: "호맥",
  oneLine: "호떡과 맥주의 조합, 다양한 수제 맥주",
  priceRange: "1인 20,000~35,000원",
  image: "images/shops/homac.jpg",
  curationNote: "다양한 수제 맥주를 먹고 싶을 때. 달달한 호떡과 아이스크림이 땡길 때.",
  pros: ["수제 맥주가 맛있음", "분위기 좋음", "호떡 종류가 많음"],
  cons: ["맥주는 배부름", "시끌벅적할 수 있음"],
  tags: {
    withWho: ["친구"],
    when: [ "1차"],
    mood: ["분위기 좋은"],
  },
  naverUrl: "https://naver.me/5qDfKq2U" // 네이버지도 링크
}],
  "와인": [],
  "위스키": [],
};

/**************************************************
 * 4) 상태
 **************************************************/
let currentCategory = null;

const selected = {
  withWho: new Set(),
  when: new Set(),
  mood: new Set(),
};

/**************************************************
 * 5) DOM
 **************************************************/
const screenCategory = document.getElementById("screen-category");
const screenFilters = document.getElementById("screen-filters");
const screenResults = document.getElementById("screen-results");

const categoryGrid = document.getElementById("category-grid");

const filtersTitle = document.getElementById("filters-title");
const chipsWithWho = document.getElementById("chips-withwho");
const chipsWhen = document.getElementById("chips-when");
const chipsMood = document.getElementById("chips-mood");

const btnBackToCategory = document.getElementById("btn-back-to-category");
const btnReset = document.getElementById("btn-reset");
const btnRecommend = document.getElementById("btn-recommend");

const resultsTitle = document.getElementById("results-title");
const resultsSub = document.getElementById("results-sub");
const btnBackToFilters = document.getElementById("btn-back-to-filters");
const resultsEmpty = document.getElementById("results-empty");
const shopList = document.getElementById("shop-list");

// modal
const modal = document.getElementById("modal");
const modalBackdrop = document.getElementById("modal-backdrop");
const mClose = document.getElementById("m-close");
const mTitle = document.getElementById("m-title");
const mOneLine = document.getElementById("m-oneLine");
const mImage = document.getElementById("m-image");
const mPrice = document.getElementById("m-price");
const mTags = document.getElementById("m-tags");
const mNote = document.getElementById("m-note");
const mPros = document.getElementById("m-pros");
const mCons = document.getElementById("m-cons");
const mNaver = document.getElementById("m-naver");

/**************************************************
 * 6) 유틸
 **************************************************/
function show(el){ el.classList.remove("hidden"); }
function hide(el){ el.classList.add("hidden"); }

function setScreen(name){
  // name: "category" | "filters" | "results"
  if (name === "category"){
    show(screenCategory); hide(screenFilters); hide(screenResults);
  } else if (name === "filters"){
    hide(screenCategory); show(screenFilters); hide(screenResults);
  } else {
    hide(screenCategory); hide(screenFilters); show(screenResults);
  }
}

function createChip(label, group){
  const btn = document.createElement("button");
  btn.className = "chip";
  btn.type = "button";
  btn.textContent = label;

  btn.addEventListener("click", () => {
    const set = selected[group];
    if (set.has(label)) set.delete(label);
    else set.add(label);

    btn.classList.toggle("on", set.has(label));
  });

  return btn;
}

function clearSelected(){
  selected.withWho.clear();
  selected.when.clear();
  selected.mood.clear();

  // UI 반영: 모든 chip에서 on 제거
  document.querySelectorAll(".chip").forEach(ch => ch.classList.remove("on"));
}

function tagsToBadges(arr){
  return arr.map(t => `<span class="mtag">${escapeHtml(t)}</span>`).join("");
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/**************************************************
 * 7) 렌더: 카테고리
 **************************************************/
function renderCategories(){
  categoryGrid.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const div = document.createElement("div");
    div.className = "cat";
    div.innerHTML = `
      <img src="${cat.image}" alt="${escapeHtml(cat.key)} 이미지" />
      <div class="name">${escapeHtml(cat.key)}</div>
      <div class="sub">${escapeHtml(cat.desc || "")}</div>
    `;
    div.addEventListener("click", () => {
      currentCategory = cat.key;
      enterFilters();
    });
    categoryGrid.appendChild(div);
  });
}

/**************************************************
 * 8) 렌더: 필터
 **************************************************/
function renderFilterChips(){
  chipsWithWho.innerHTML = "";
  chipsWhen.innerHTML = "";
  chipsMood.innerHTML = "";

  OPTIONS.withWho.forEach(v => chipsWithWho.appendChild(createChip(v, "withWho")));
  OPTIONS.when.forEach(v => chipsWhen.appendChild(createChip(v, "when")));
  OPTIONS.mood.forEach(v => chipsMood.appendChild(createChip(v, "mood")));
}

function enterFilters(){
  clearSelected();
  filtersTitle.textContent = `2) 필터 선택 · ${currentCategory}`;
  setScreen("filters");
}

/**************************************************
 * 9) 추천 로직: AND(모두 포함)
 * - 선택된 키워드가 각 배열에 전부 포함되어야 통과
 **************************************************/
function matchesAll(shop){
  const t = shop.tags || { withWho:[], when:[], mood:[] };

  for (const v of selected.withWho){
    if (!t.withWho?.includes(v)) return false;
  }
  for (const v of selected.when){
    if (!t.when?.includes(v)) return false;
  }
  for (const v of selected.mood){
    if (!t.mood?.includes(v)) return false;
  }
  return true;
}

function recommend(){
  const all = SHOPS_BY_CATEGORY[currentCategory] || [];
  const filtered = all.filter(matchesAll);
  return filtered;
}

/**************************************************
 * 10) 렌더: 결과 리스트
 **************************************************/
function enterResults(){
  const chosen = [
    ...selected.withWho, ...selected.when, ...selected.mood
  ];
  resultsTitle.textContent = `3) 추천 결과 · ${currentCategory}`;
  resultsSub.textContent = chosen.length === 0
    ? "선택한 필터가 없어서, 전체 가게를 보여줘."
    : `선택 키워드(${chosen.join(", ")})를 모두 포함한 가게만 보여줘.`;

  const items = recommend();
  renderShopList(items);
  setScreen("results");
}

function renderShopList(items){
  shopList.innerHTML = "";

  if (!items || items.length === 0){
    show(resultsEmpty);
    return;
  }
  hide(resultsEmpty);

  items.forEach(s => {
    const li = document.createElement("li");
    li.className = "shop";

    const img = s.image ? s.image : "images/placeholder.jpg";
    const mini = [
      ...(s.tags?.withWho || []).slice(0,1),
      ...(s.tags?.when || []).slice(0,1),
      ...(s.tags?.mood || []).slice(0,1),
    ].filter(Boolean);

    li.innerHTML = `
      <img class="thumb" src="${img}" alt="${escapeHtml(s.name)} 사진" />
      <div class="info">
        <p class="title">${escapeHtml(s.name || "")}</p>
        <p class="line">${escapeHtml(s.oneLine || "")}</p>
        <div class="mini-tags">
          ${mini.map(x => `<span class="mtag">${escapeHtml(x)}</span>`).join("")}
        </div>
      </div>
    `;

    li.addEventListener("click", () => openModal(s));
    shopList.appendChild(li);
  });
}

/**************************************************
 * 11) 모달: 상세
 **************************************************/
function openModal(shop){
  mTitle.textContent = shop.name || "";
  mOneLine.textContent = shop.oneLine || "";
  mPrice.textContent = shop.priceRange || "-";

  const img = shop.image ? shop.image : "images/placeholder.jpg";
  mImage.src = img;
  mImage.alt = `${shop.name || "가게"} 사진`;

  // 키워드 뱃지
  const tags = [
    ...(shop.tags?.withWho || []),
    ...(shop.tags?.when || []),
    ...(shop.tags?.mood || []),
  ];
  mTags.innerHTML = tagsToBadges(tags);

  // 큐레이션 메모
  mNote.textContent = shop.curationNote || "";

  // pros/cons
  mPros.innerHTML = "";
  (shop.pros || []).forEach(p => {
    const li = document.createElement("li");
    li.textContent = p;
    mPros.appendChild(li);
  });
  if ((shop.pros || []).length === 0){
    const li = document.createElement("li");
    li.textContent = "추가 예정";
    mPros.appendChild(li);
  }

  mCons.innerHTML = "";
  (shop.cons || []).forEach(c => {
    const li = document.createElement("li");
    li.textContent = c;
    mCons.appendChild(li);
  });
  if ((shop.cons || []).length === 0){
    const li = document.createElement("li");
    li.textContent = "추가 예정";
    mCons.appendChild(li);
  }

  // 네이버 지도 링크
  const url = shop.naverUrl || "#";
  mNaver.href = url;
  mNaver.style.pointerEvents = url === "#" ? "none" : "auto";
  mNaver.style.opacity = url === "#" ? "0.5" : "1";

  show(modal);
}

function closeModal(){
  hide(modal);
}

modalBackdrop.addEventListener("click", closeModal);
mClose.addEventListener("click", closeModal);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/**************************************************
 * 12) 이벤트
 **************************************************/
btnBackToCategory.addEventListener("click", () => {
  currentCategory = null;
  clearSelected();
  setScreen("category");
});

btnReset.addEventListener("click", () => {
  clearSelected();
});

btnRecommend.addEventListener("click", () => {
  enterResults();
});

btnBackToFilters.addEventListener("click", () => {
  setScreen("filters");
});

/**************************************************
 * 13) 시작
 **************************************************/
renderCategories();
renderFilterChips();
setScreen("category");


