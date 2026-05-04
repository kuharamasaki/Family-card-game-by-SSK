const expectedFormat = "lumina-battle-export-v1";
const maxDeckSize = 5;
const statKeys = ["hp", "attack", "defense"];
const cardImageVersion = "20260504-2";

const rarityBaselines = {
  normal: 150,
  rare: 200,
  super_rare: 300,
  ultra_rare: 500,
  normalEvolution: 200,
  rareEvolution: 250,
  superRareEvolution: 350,
  ultraRareEvolution: 550,
};

const elementAdvantage = {
  fire: "plant",
  plant: "water",
  water: "fire",
  electric: "water",
  star: "electric",
  "star-electric": "fire",
};

const fallbackElementLabels = {
  fire: "炎",
  plant: "草",
  water: "みず",
  electric: "電気",
  star: "星",
  "star-electric": "星・電気",
};

const elementColors = {
  fire: "#cf4f2c",
  plant: "#3c8f52",
  water: "#2b6fba",
  electric: "#a57b13",
  star: "#6f55b8",
  "star-electric": "#7d5ac7",
};

const moveTable = {
  fire: {
    normal: ["ひのこ", "火"],
    rare: ["ファイヤーボール", "炎"],
    super_rare: ["ウルトラファイヤー"],
    ultra_rare: ["ボルケーノ・オーバードライブ"],
  },
  water: {
    normal: ["水鉄砲", "水をかける"],
    rare: ["バブルビーム", "うずまき"],
    super_rare: ["ハイプレッシャーウォーター"],
    ultra_rare: ["ハイドロ・インフィニティ"],
  },
  plant: {
    normal: ["このは", "サイコリーフ"],
    rare: ["フュージョンリーフ", "エナジーボール"],
    super_rare: ["リーフストーム"],
    ultra_rare: ["グリーン・オーバーフロー"],
  },
  electric: {
    normal: ["ビリビリ", "静電気"],
    rare: ["カミナリ", "感電ショッカー"],
    super_rare: ["サンダーハリケーン"],
    ultra_rare: ["ライトニング・エクスキューション"],
  },
  star: {
    normal: ["星のかけら", "スターがん"],
    rare: ["ビッグスター", "流れ星"],
    super_rare: ["スターラッシュ"],
    ultra_rare: ["ギャラクシー・リベレーション"],
  },
  "star-electric": {
    normal: ["星のかけら", "ビリビリ"],
    rare: ["ビッグスター", "カミナリ"],
    super_rare: ["スターラッシュ"],
    ultra_rare: ["ギャラクシー・リベレーション"],
  },
};

const actionLabels = {
  attack: "攻撃",
  defense: "防御",
  charge: "溜め",
  counter: "カウンター",
  strongAttack: "強攻撃",
  piercingAttack: "貫通攻撃",
};

const accounts = [
  { id: "sousuke", name: "ソウスケ" },
  { id: "emma", name: "エマ" },
];

const shortBattleCards = [
  {
    id: "short-card-002",
    number: "002",
    name: "ミズラビ",
    nameEn: "Mizurabi",
    attribute: "water",
    attributeLabel: "水",
    rarity: "Normal",
    rarityLabel: "ノーマル",
    image: "/cards/002_mizurabi_water_normal.png",
    copies: 1,
    stats: { power: 39, speed: 54, defense: 44, hp: 66 },
    evolvesFrom: null,
  },
  {
    id: "short-card-003",
    number: "003",
    name: "モリネ",
    nameEn: "Morine",
    attribute: "plant",
    attributeLabel: "草",
    rarity: "Normal",
    rarityLabel: "ノーマル",
    image: "/cards/003_morine_plant_normal.png",
    copies: 1,
    stats: { power: 36, speed: 49, defense: 48, hp: 68 },
    evolvesFrom: null,
  },
  {
    id: "short-card-025",
    number: "025",
    name: "ファイケル",
    nameEn: "Faikel",
    attribute: "fire",
    attributeLabel: "炎",
    rarity: "Normal",
    rarityLabel: "ノーマル",
    image: "/cards/25_faikel_fire_normal.png",
    copies: 1,
    stats: { power: 43, speed: 55, defense: 34, hp: 60 },
    evolvesFrom: null,
  },
];
const activeAccountStorageKey = "luminaBattleActiveAccount";
const deckStorageKeyPrefix = "luminaBattleDecks";

let ownedCards = [];
let ownerName = "";
let activeAccountId = localStorage.getItem(activeAccountStorageKey) ?? "sousuke";
let teams = [];
let activeTeamId = "";
let playerDeck = [];
let playerTwoDeck = [];
let battleMode = "cpu";
let playerBattleDeck = [];
let opponentBattleDeck = [];
let playerActiveIndex = 0;
let opponentActiveIndex = 0;
let player = null;
let cpu = null;
let turn = 1;
let battleOver = false;

const jsonInput = document.querySelector("#jsonInput");
const shortBattleButton = document.querySelector("#shortBattleButton");
const accountButtons = document.querySelectorAll("[data-account-id]");
const accountSummary = document.querySelector("#accountSummary");
const tabButtons = document.querySelectorAll("[data-tab]");
const appTabs = document.querySelectorAll(".app-tab");
const battleModeInputs = document.querySelectorAll("[name='battleMode']");
const poolSummary = document.querySelector("#poolSummary");
const teamSummary = document.querySelector("#teamSummary");
const selectTitle = document.querySelector("#selectTitle");
const selectScreen = document.querySelector("#selectScreen");
const teamScreen = document.querySelector("#teamScreen");
const trainingScreen = document.querySelector("#trainingScreen");
const trainingCards = document.querySelector("#trainingCards");
const trainingSummary = document.querySelector("#trainingSummary");
const battleScreen = document.querySelector("#battleScreen");
const cardChoices = document.querySelector("#cardChoices");
const teamSelect = document.querySelector("#teamSelect");
const newTeamButton = document.querySelector("#newTeamButton");
const deleteTeamButton = document.querySelector("#deleteTeamButton");
const playerDeckList = document.querySelector("#playerDeckList");
const playerTwoDeckPanel = document.querySelector("#playerTwoDeckPanel");
const playerTwoDeckList = document.querySelector("#playerTwoDeckList");
const clearDeckButton = document.querySelector("#clearDeckButton");
const startBattleButton = document.querySelector("#startBattleButton");
const playerCard = document.querySelector("#playerCard");
const cpuCard = document.querySelector("#cpuCard");
const actionButtons = document.querySelector("#actionButtons");
const battleLog = document.querySelector("#battleLog");
const turnLabel = document.querySelector("#turnLabel");
const statusText = document.querySelector("#statusText");
const resetButton = document.querySelector("#resetButton");

function rarityKey(rarity) {
  const value = String(rarity ?? "").toLowerCase();

  if (value === "god") {
    return "god";
  }

  if (value === "ultra_rare" || value === "ultrarare" || value === "ultra rare") {
    return "ultra_rare";
  }

  if (value === "superrare" || value === "super rare") {
    return "super_rare";
  }

  if (value === "rare" || value === "super_rare") {
    return value;
  }

  return "normal";
}

function isGodCard(card) {
  const rarity = String(card.rarity ?? "").toLowerCase();
  const rarityLabel = String(card.rarityLabel ?? "").toLowerCase();
  return rarity === "god" || rarityLabel === "god" || rarityLabel.includes("ゴッド");
}

function normalizeCard(card) {
  const stats = card.stats ?? {};
  const hp = Number(stats.hp ?? 100);
  const attack = Number(stats.power ?? 30);
  const defense = Number(stats.defense ?? 30);
  const speed = Number(stats.speed ?? 30);
  const copies = Number(card.copies ?? 1);

  return {
    id: String(card.id),
    number: card.number ?? "",
    name: card.name ?? "名前なし",
    nameEn: card.nameEn ?? "",
    attribute: card.attribute ?? "unknown",
    attributeLabel:
      card.attributeLabel ?? fallbackElementLabels[card.attribute] ?? card.attribute ?? "属性なし",
    rarity: rarityKey(card.rarity),
    rarityLabel: card.rarityLabel ?? card.rarity ?? "レア度なし",
    image: normalizeImagePath(card.image),
    copies,
    stats: {
      power: attack,
      speed,
      defense,
      hp,
    },
    hp,
    attack,
    defense,
    speed,
    evolvesFrom: card.evolvesFrom ?? null,
  };
}

function activeAccount() {
  return accounts.find((account) => account.id === activeAccountId) ?? accounts[0];
}

function deckStorageKey() {
  return `${deckStorageKeyPrefix}:${activeAccount().id}:${ownerName || "no-card-file"}`;
}

function renderAccount() {
  const account = activeAccount();
  accountSummary.textContent = `${account.name}のアカウントを使用中`;

  for (const button of accountButtons) {
    button.classList.toggle("is-active", button.dataset.accountId === account.id);
  }
}

function normalizeImagePath(image) {
  if (!image) {
    return "";
  }

  const value = String(image).trim();

  if (value.startsWith("data:") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/cards/")) {
    return value;
  }

  if (value.startsWith("cards/")) {
    return `/${value}`;
  }

  const fileName = value.split(/[\\/]/).pop();
  return `/cards/${fileName}`;
}

function imageSrc(image) {
  if (!image) {
    return "";
  }

  let src = image;

  if (image.startsWith("/cards/")) {
    src = image.slice(1);
  }

  if (src.startsWith("cards/")) {
    return `${src}?v=${cardImageVersion}`;
  }

  return src;
}

function parseBattleExport(rawText) {
  const data = JSON.parse(rawText);

  if (data.format !== expectedFormat) {
    throw new Error(`対応していないカードファイルです: ${data.format ?? "formatなし"}`);
  }

  if (!Array.isArray(data.cards)) {
    throw new Error("cards配列がありません。");
  }

  const cards = data.cards
    .filter((card) => !isGodCard(card))
    .map(normalizeCard)
    .filter((card) => card.copies > 0 && card.rarity !== "god");

  return {
    owner: data.owner ?? {},
    totalCards: Number(data.totalCards ?? 0),
    uniqueCards: Number(data.uniqueCards ?? cards.length),
    cards,
  };
}

function getMoves(card) {
  const moves = moveTable[card.attribute]?.[card.rarity] ?? moveTable[card.attribute]?.super_rare;
  return moves?.length ? moves : ["たいあたり"];
}

function cardById(id) {
  return ownedCards.find((card) => card.id === id);
}

function deckCount(deck, cardId) {
  return deck.filter((entry) => entry.card.id === cardId).length;
}

function createTeam(name = `チーム${teams.length + 1}`) {
  return {
    id: crypto.randomUUID(),
    name,
    deck: [],
  };
}

function activeTeam() {
  let team = teams.find((item) => item.id === activeTeamId);

  if (!team) {
    team = teams[0] ?? createTeam("チーム1");
    teams = teams.length ? teams : [team];
    activeTeamId = team.id;
  }

  return team;
}

function syncPlayerDeck() {
  playerDeck = activeTeam().deck;
}

function canAddToDeck(card, targetDeck) {
  if (targetDeck.length >= maxDeckSize) {
    return false;
  }

  return deckCount(targetDeck, card.id) < card.copies;
}

function addToDeck(cardId, move, target = "player") {
  const card = cardById(cardId);
  const deck = target === "playerTwo" ? playerTwoDeck : playerDeck;

  if (!card || !canAddToDeck(card, deck)) {
    return;
  }

  deck.push({
    uid: crypto.randomUUID(),
    card,
    move,
  });

  saveDecks();
  renderAll();
}

function removeFromDeck(uid, target = "player") {
  const deck = target === "playerTwo" ? playerTwoDeck : playerDeck;
  const index = deck.findIndex((entry) => entry.uid === uid);

  if (index >= 0) {
    deck.splice(index, 1);
    saveDecks();
    renderAll();
  }
}

function saveDecks() {
  const payload = {
    accountId: activeAccount().id,
    accountName: activeAccount().name,
    ownerName,
    activeTeamId,
    teams: teams.map((team) => ({
      id: team.id,
      name: team.name,
      deck: team.deck.map((entry) => ({ cardId: entry.card.id, move: entry.move })),
    })),
    playerTwoDeck: playerTwoDeck.map((entry) => ({ cardId: entry.card.id, move: entry.move })),
  };
  localStorage.setItem(deckStorageKey(), JSON.stringify(payload));
}

function restoreDecks() {
  try {
    const saved = JSON.parse(localStorage.getItem(deckStorageKey()) ?? "{}");

    if (saved.ownerName !== ownerName || saved.accountId !== activeAccount().id) {
      playerDeck = [];
      playerTwoDeck = [];
      return;
    }

    if (Array.isArray(saved.teams) && saved.teams.length > 0) {
      teams = saved.teams.map((team, index) => ({
        id: team.id ?? crypto.randomUUID(),
        name: team.name ?? `チーム${index + 1}`,
        deck: restoreDeck(team.deck),
      }));
      activeTeamId = saved.activeTeamId ?? teams[0].id;
      syncPlayerDeck();
    } else {
      teams = [createTeam("チーム1")];
      activeTeamId = teams[0].id;
      playerDeck = teams[0].deck;
    }

    playerTwoDeck = restoreDeck(saved.playerTwoDeck);
  } catch {
    teams = [createTeam("チーム1")];
    activeTeamId = teams[0].id;
    playerDeck = teams[0].deck;
    playerTwoDeck = [];
  }
}

function restoreDeck(savedDeck = []) {
  const restored = [];

  for (const item of savedDeck) {
    const card = cardById(item.cardId);
    const move = getMoves(card ?? {})[0];

    if (card && restored.filter((entry) => entry.card.id === card.id).length < card.copies) {
      restored.push({
        uid: crypto.randomUUID(),
        card,
        move: item.move ?? move,
      });
    }
  }

  return restored.slice(0, maxDeckSize);
}

function makeBattleCard(entry) {
  return {
    ...entry.card,
    move: entry.move,
    maxHp: entry.card.hp,
    currentHp: entry.card.hp,
    charged: false,
  };
}

function baseAttackDamage(card) {
  return 10 + Math.floor(card.attack / 10);
}

function baseDefensePower(card) {
  return 10 + Math.floor(card.defense / 10);
}

function hasElementAdvantage(attacker, defender) {
  return elementAdvantage[attacker.attribute] === defender.attribute;
}

function actionDamage(attacker, defender, action) {
  let damage = baseAttackDamage(attacker);

  if (hasElementAdvantage(attacker, defender)) {
    damage += 10;
  }

  if (action === "strongAttack") {
    damage += 30;
  }

  return damage;
}

function defenseReduction(defender, defenderAction, incomingAction) {
  if (incomingAction === "piercingAttack" && defenderAction !== "charge") {
    return 0;
  }

  let reduction = 0;

  if (defenderAction === "defense") {
    reduction += baseDefensePower(defender);
  }

  if (defenderAction === "charge") {
    reduction += 30;
  }

  return reduction;
}

function attackHits(action) {
  return ["attack", "strongAttack", "piercingAttack"].includes(action);
}

function availableActions(card) {
  const actions = ["attack", "defense", "charge", "counter"];

  if (card.charged) {
    actions.push("strongAttack", "piercingAttack");
  }

  return actions;
}

function chooseCpuAction() {
  const actions = availableActions(cpu);
  return actions[Math.floor(Math.random() * actions.length)];
}

function resolveAttack(attacker, defender, attackerAction, defenderAction) {
  const damage = actionDamage(attacker, defender, attackerAction);
  const moveName = attacker.move ?? actionLabels[attackerAction];

  if (defenderAction === "counter") {
    attacker.currentHp -= damage;
    defender.currentHp -= 1;
    return `${defender.name}のカウンター！ ${attacker.name}に${damage}ダメージ。${defender.name}は1ダメージ受けた。`;
  }

  const reduction = defenseReduction(defender, defenderAction, attackerAction);
  const finalDamage = Math.max(1, damage - reduction);
  defender.currentHp -= finalDamage;
  return `${attacker.name}の${moveName}！ ${defender.name}に${finalDamage}ダメージ。`;
}

function currentPlayerName() {
  return battleMode === "twoPlayer" ? "1P" : "あなた";
}

function currentOpponentName() {
  return battleMode === "twoPlayer" ? "2P" : "CPU";
}

function resolveTurn(playerAction) {
  if (battleOver) {
    return;
  }

  const cpuAction = chooseCpuAction();
  const messages = [
    `${currentPlayerName()}: ${actionLabels[playerAction]} / ${currentOpponentName()}: ${actionLabels[cpuAction]}`,
  ];

  player.charged = false;
  cpu.charged = false;

  if (playerAction === "charge") {
    player.charged = true;
    messages.push(`${player.name}は力を溜めた。`);
  }

  if (cpuAction === "charge") {
    cpu.charged = true;
    messages.push(`${cpu.name}は力を溜めた。`);
  }

  if (attackHits(playerAction)) {
    messages.push(resolveAttack(player, cpu, playerAction, cpuAction));
  }

  if (cpu.currentHp > 0 && attackHits(cpuAction)) {
    messages.push(resolveAttack(cpu, player, cpuAction, playerAction));
  }

  player.currentHp = Math.max(0, player.currentHp);
  cpu.currentHp = Math.max(0, cpu.currentHp);

  if (player.currentHp <= 0) {
    messages.push(advancePlayerCard());
  }

  if (cpu.currentHp <= 0) {
    messages.push(advanceOpponentCard());
  }

  addLog(messages.filter(Boolean));
  turn += 1;
  checkWinner();
  renderBattle();
}

function advancePlayerCard() {
  playerActiveIndex += 1;

  if (playerActiveIndex >= playerBattleDeck.length) {
    return "";
  }

  player = makeBattleCard(playerBattleDeck[playerActiveIndex]);
  return `${currentPlayerName()}は次のカード、${player.name}を出した！`;
}

function advanceOpponentCard() {
  opponentActiveIndex += 1;

  if (opponentActiveIndex >= opponentBattleDeck.length) {
    return "";
  }

  cpu = makeBattleCard(opponentBattleDeck[opponentActiveIndex]);
  return `${currentOpponentName()}は次のカード、${cpu.name}を出した！`;
}

function checkWinner() {
  const playerLost = playerActiveIndex >= playerBattleDeck.length;
  const opponentLost = opponentActiveIndex >= opponentBattleDeck.length;

  if (!playerLost && !opponentLost) {
    return;
  }

  battleOver = true;

  if (playerLost && opponentLost) {
    statusText.textContent = "引き分け！";
    addLog(["引き分け！"]);
  } else if (opponentLost) {
    statusText.textContent = `${currentPlayerName()}の勝ち！`;
    addLog([`${currentPlayerName()}の勝ち！`]);
  } else {
    statusText.textContent = `${currentOpponentName()}の勝ち！`;
    addLog([`${currentOpponentName()}の勝ち！`]);
  }
}

function addLog(messages) {
  for (const message of messages) {
    const item = document.createElement("li");
    item.textContent = message;
    battleLog.prepend(item);
  }
}

function hpPercent(card) {
  return `${Math.max(0, (card.currentHp / card.maxHp) * 100)}%`;
}

function imageHtml(card, extraClass = "") {
  if (!card.image) {
    return `<div class="card-art missing-art ${extraClass}">画像なし</div>`;
  }

  return `<img class="card-art ${extraClass}" src="${imageSrc(card.image)}" alt="${card.name}のカード画像">`;
}

function rarityBaselineKey(card) {
  if (card.evolvesFrom) {
    if (card.rarity === "ultra_rare") {
      return "ultraRareEvolution";
    }

    if (card.rarity === "super_rare") {
      return "superRareEvolution";
    }

    if (card.rarity === "rare") {
      return "rareEvolution";
    }

    return "normalEvolution";
  }

  return card.rarity;
}

function statTotal(card) {
  return statKeys.reduce((sum, key) => sum + Number(card[key] ?? 0), 0);
}

function baselineFor(card) {
  return rarityBaselines[rarityBaselineKey(card)] ?? rarityBaselines.normal;
}

function trainingMessage(card) {
  const total = statTotal(card);
  const baseline = baselineFor(card);

  if (total === baseline) {
    return {
      className: "training-ok",
      text: `OK: 合計${total} / 基準${baseline}`,
    };
  }

  return {
    className: "training-warning",
    text: `合計${total} / 基準${baseline}。設定を変えてください。`,
  };
}

function evolutionHtml(card) {
  if (!card.evolvesFrom) {
    return "";
  }

  return `<span class="meta-pill">進化元: ${card.evolvesFrom.name}</span>`;
}

function renderCard(target, card) {
  target.style.setProperty("--element-color", elementColors[card.attribute] ?? "#24745a");
  target.style.setProperty("--hp-percent", hpPercent(card));
  target.innerHTML = `
    ${imageHtml(card)}
    <h2 class="card-name">${card.name}</h2>
    <span class="element-tag">${card.attributeLabel}</span>
    <div class="meta-row">
      <span class="meta-pill">${card.rarityLabel}</span>
      <span class="meta-pill">技: ${card.move ?? "なし"}</span>
      ${evolutionHtml(card)}
    </div>
    <div class="stats">
      <div class="stat"><span>HP</span><strong>${card.currentHp}/${card.maxHp}</strong></div>
      <div class="stat"><span>攻撃</span><strong>${card.attack}</strong></div>
      <div class="stat"><span>防御</span><strong>${card.defense}</strong></div>
      <div class="stat"><span>すばやさ</span><strong>${card.speed}</strong></div>
    </div>
    <div class="hp-wrap">
      <div class="hp-row"><span>HP</span><span>${card.currentHp}/${card.maxHp}</span></div>
      <div class="hp-bar"><div class="hp-fill"></div></div>
    </div>
    <p class="state-text">${card.charged ? "溜め中：次に強攻撃か貫通攻撃が使える" : ""}</p>
  `;
}

function renderActions() {
  actionButtons.innerHTML = "";

  for (const action of availableActions(player)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "skill-button";
    button.textContent = actionLabels[action];

    if (action === "defense" || action === "counter") {
      button.classList.add("secondary");
    }

    if (action === "strongAttack" || action === "piercingAttack") {
      button.classList.add("special");
    }

    button.disabled = battleOver;
    button.addEventListener("click", () => resolveTurn(action));
    actionButtons.append(button);
  }
}

function renderBattle() {
  turnLabel.textContent = `${turn}ターン目`;

  if (!battleOver) {
    statusText.textContent = `${currentPlayerName()}のカード ${playerActiveIndex + 1}/${playerBattleDeck.length}、${currentOpponentName()}のカード ${opponentActiveIndex + 1}/${opponentBattleDeck.length}`;
  }

  renderCard(playerCard, player);
  renderCard(cpuCard, cpu);
  renderActions();
}

function buildCpuDeck() {
  const result = [];
  const usedCounts = new Map();

  for (const entry of playerDeck) {
    const candidates = ownedCards.filter((card) => {
      const used = usedCounts.get(card.id) ?? 0;
      return card.rarity === entry.card.rarity && used < card.copies;
    });
    const pool = candidates.length ? candidates : ownedCards;
    const card = pool[Math.floor(Math.random() * pool.length)];
    usedCounts.set(card.id, (usedCounts.get(card.id) ?? 0) + 1);
    result.push({ uid: crypto.randomUUID(), card, move: getMoves(card)[0] });
  }

  return result;
}

function startBattle() {
  if (playerDeck.length === 0) {
    teamSummary.textContent = "自分のデッキにカードを入れてください。";
    return;
  }

  if (battleMode === "twoPlayer" && playerTwoDeck.length === 0) {
    teamSummary.textContent = "二人目のデッキにカードを入れてください。";
    return;
  }

  playerBattleDeck = playerDeck.map((entry) => ({ ...entry }));
  opponentBattleDeck =
    battleMode === "cpu" ? buildCpuDeck() : playerTwoDeck.map((entry) => ({ ...entry }));
  playerActiveIndex = 0;
  opponentActiveIndex = 0;
  player = makeBattleCard(playerBattleDeck[0]);
  cpu = makeBattleCard(opponentBattleDeck[0]);
  turn = 1;
  battleOver = false;
  battleLog.innerHTML = "";

  teamScreen.classList.add("is-hidden");
  selectScreen.classList.add("is-hidden");
  battleScreen.classList.remove("is-hidden");
  addLog([`${currentPlayerName()}は${player.name}、${currentOpponentName()}は${cpu.name}で勝負開始！`]);
  renderBattle();
}

function moveOptionsHtml(card) {
  return getMoves(card)
    .map((move) => `<option value="${move}">${move}</option>`)
    .join("");
}

function renderDeckList(deck, target, targetName) {
  target.innerHTML = "";

  if (deck.length === 0) {
    target.innerHTML = `<li>まだカードがありません。</li>`;
    return;
  }

  for (const entry of deck) {
    const item = document.createElement("li");
    item.innerHTML = `
      ${entry.card.name}
      <small>${entry.card.rarityLabel} / ${entry.card.attributeLabel} / 技: ${entry.move}</small>
      <button class="plain-button" type="button">外す</button>
    `;
    item.querySelector("button").addEventListener("click", () => removeFromDeck(entry.uid, targetName));
    target.append(item);
  }
}

function renderDecks() {
  renderTeamOptions();
  playerTwoDeckPanel.classList.toggle("is-hidden", battleMode !== "twoPlayer");
  renderDeckList(playerDeck, playerDeckList, "player");
  renderDeckList(playerTwoDeck, playerTwoDeckList, "playerTwo");

  const second = battleMode === "twoPlayer" ? ` / 2P ${playerTwoDeck.length}/${maxDeckSize}` : "";
  teamSummary.textContent = `1P ${playerDeck.length}/${maxDeckSize}${second}`;
  startBattleButton.disabled = playerDeck.length === 0 || (battleMode === "twoPlayer" && playerTwoDeck.length === 0);
}

function renderTeamOptions() {
  teamSelect.innerHTML = "";

  for (const team of teams) {
    const option = document.createElement("option");
    option.value = team.id;
    option.textContent = `${team.name} (${team.deck.length}/${maxDeckSize})`;
    option.selected = team.id === activeTeamId;
    teamSelect.append(option);
  }

  deleteTeamButton.disabled = teams.length <= 1;
}

function renderChoices() {
  cardChoices.innerHTML = "";

  if (ownedCards.length === 0) {
    cardChoices.innerHTML =
      `<p class="empty-message">まだカードが読み込まれていません。</p>`;
    renderDecks();
    return;
  }

  for (const card of ownedCards) {
    const article = document.createElement("article");
    article.className = "choice-card";
    article.style.setProperty("--element-color", elementColors[card.attribute] ?? "#24745a");
    article.innerHTML = `
      ${imageHtml(card, "choice-art")}
      <h3 class="card-name">${card.name}</h3>
      <span class="element-tag">${card.attributeLabel}</span>
      <div class="meta-row">
        <span class="meta-pill">${card.rarityLabel}</span>
        <span class="meta-pill">所持: ${card.copies}枚</span>
        ${evolutionHtml(card)}
      </div>
      <div class="stats">
        <div class="stat"><span>HP</span><strong>${card.hp}</strong></div>
        <div class="stat"><span>攻撃</span><strong>${card.attack}</strong></div>
        <div class="stat"><span>防御</span><strong>${card.defense}</strong></div>
        <div class="stat"><span>すばやさ</span><strong>${card.speed}</strong></div>
      </div>
      <div class="card-controls">
        <select class="move-select" aria-label="${card.name}の技">${moveOptionsHtml(card)}</select>
        <button class="add-button" type="button">1Pに入れる</button>
      </div>
      <div class="card-controls two-player-control">
        <select class="move-select" aria-label="${card.name}の2P技">${moveOptionsHtml(card)}</select>
        <button class="add-button" type="button">2Pに入れる</button>
      </div>
    `;

    const controls = article.querySelectorAll(".card-controls");
    const playerButton = controls[0].querySelector("button");
    const playerMove = controls[0].querySelector("select");
    const playerTwoButton = controls[1].querySelector("button");
    const playerTwoMove = controls[1].querySelector("select");

    playerButton.disabled = !canAddToDeck(card, playerDeck);
    playerButton.addEventListener("click", () => addToDeck(card.id, playerMove.value, "player"));

    controls[1].classList.toggle("is-hidden", battleMode !== "twoPlayer");
    playerTwoButton.disabled = !canAddToDeck(card, playerTwoDeck);
    playerTwoButton.addEventListener("click", () => addToDeck(card.id, playerTwoMove.value, "playerTwo"));

    cardChoices.append(article);
  }

  renderDecks();
}

function renderAll() {
  renderChoices();
  renderTraining();

  if (player && cpu && !battleOver) {
    renderBattle();
  }
}

function renderTraining() {
  trainingCards.innerHTML = "";
  trainingSummary.textContent = "HP・攻撃・防御をキーボードで直接入力できます。";

  if (ownedCards.length === 0) {
    trainingCards.innerHTML = `<p class="empty-message">まだカードが読み込まれていません。</p>`;
    return;
  }

  for (const card of ownedCards) {
    const message = trainingMessage(card);
    const article = document.createElement("article");
    article.className = "training-card";
    article.innerHTML = `
      <div class="training-layout">
        ${imageHtml(card)}
        <div>
          <h3 class="card-name">${card.name}</h3>
          <div class="meta-row">
            <span class="meta-pill">${card.rarityLabel}</span>
            <span class="meta-pill">${card.attributeLabel}</span>
            ${evolutionHtml(card)}
          </div>
          <div class="training-form">
            <label>HP<input data-stat="hp" type="number" inputmode="numeric" min="1" value="${card.hp}"></label>
            <label>攻撃<input data-stat="attack" type="number" inputmode="numeric" min="1" value="${card.attack}"></label>
            <label>防御<input data-stat="defense" type="number" inputmode="numeric" min="1" value="${card.defense}"></label>
          </div>
          <p class="${message.className}">${message.text}</p>
        </div>
      </div>
    `;

    for (const input of article.querySelectorAll("[data-stat]")) {
      input.addEventListener("input", () => {
        const key = input.dataset.stat;
        const value = Number(input.value || 0);
        card[key] = value;
        card.stats[key === "attack" ? "power" : key] = value;
        saveDecks();
        renderAll();
      });
    }

    trainingCards.append(article);
  }
}

function resetGame() {
  teamScreen.classList.remove("is-hidden");
  selectScreen.classList.remove("is-hidden");
  battleScreen.classList.add("is-hidden");
  player = null;
  cpu = null;
  turn = 1;
  battleOver = false;
  battleLog.innerHTML = "";
  statusText.textContent = "スキルを選んでね";
}

function loadBattleExport(file) {
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    try {
      const result = parseBattleExport(String(reader.result));
      ownedCards = result.cards;
      ownerName = result.owner.name ?? activeAccount().name;
      teams = [createTeam("チーム1")];
      activeTeamId = teams[0].id;
      playerDeck = teams[0].deck;
      selectTitle.textContent = `${activeAccount().name}のチーム編成`;
      poolSummary.textContent =
        `${activeAccount().name}専用: ${ownedCards.length}種類 / 合計${result.totalCards}枚`;
      restoreDecks();
      resetGame();
      renderAll();
    } catch (error) {
      ownedCards = [];
      teams = [createTeam("チーム1")];
      activeTeamId = teams[0].id;
      playerDeck = teams[0].deck;
      playerTwoDeck = [];
      poolSummary.textContent = error.message;
      renderAll();
    }
  });

  reader.readAsText(file, "utf-8");
}

function makeDeckFromCards(cards) {
  return cards.map((card) => ({
    uid: crypto.randomUUID(),
    card,
    move: getMoves(card)[0],
  }));
}

function startShortBattle() {
  ownedCards = shortBattleCards.map(normalizeCard);
  ownerName = "ショートバトル";
  battleMode = "cpu";

  for (const input of battleModeInputs) {
    input.checked = input.value === "cpu";
  }

  teams = [createTeam("ショートバトル")];
  activeTeamId = teams[0].id;
  teams[0].deck = makeDeckFromCards(ownedCards);
  syncPlayerDeck();
  playerTwoDeck = [];
  selectTitle.textContent = "ショートバトルの3体";
  poolSummary.textContent = "ミズラビ・モリネ・ファイケルだけで、すぐ遊べます。";
  resetGame();
  renderAll();
  startBattle();
}

jsonInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];

  if (file) {
    loadBattleExport(file);
  }
});

shortBattleButton.addEventListener("click", startShortBattle);

for (const button of accountButtons) {
  button.addEventListener("click", () => {
    activeAccountId = button.dataset.accountId;
    localStorage.setItem(activeAccountStorageKey, activeAccountId);
    teams = [createTeam("チーム1")];
    activeTeamId = teams[0].id;
    playerDeck = teams[0].deck;
    playerTwoDeck = [];
    restoreDecks();
    resetGame();
    renderAccount();
    renderAll();
  });
}

for (const input of battleModeInputs) {
  input.addEventListener("change", () => {
    battleMode = input.value;
    renderAll();
  });
}

for (const button of tabButtons) {
  button.addEventListener("click", () => {
    const isTraining = button.dataset.tab === "training";

    for (const item of tabButtons) {
      item.classList.toggle("is-active", item === button);
    }

    for (const tab of appTabs) {
      tab.classList.toggle("is-hidden", tab.id !== `${button.dataset.tab}Screen`);
    }

    selectScreen.classList.toggle("is-hidden", isTraining);
  });
}

teamSelect.addEventListener("change", () => {
  activeTeamId = teamSelect.value;
  syncPlayerDeck();
  saveDecks();
  renderAll();
});

newTeamButton.addEventListener("click", () => {
  const team = createTeam(`チーム${teams.length + 1}`);
  teams.push(team);
  activeTeamId = team.id;
  syncPlayerDeck();
  saveDecks();
  renderAll();
});

deleteTeamButton.addEventListener("click", () => {
  if (teams.length <= 1) {
    return;
  }

  teams = teams.filter((team) => team.id !== activeTeamId);
  activeTeamId = teams[0].id;
  syncPlayerDeck();
  saveDecks();
  renderAll();
});

clearDeckButton.addEventListener("click", () => {
  activeTeam().deck = [];
  syncPlayerDeck();
  playerTwoDeck = [];
  saveDecks();
  renderAll();
});

startBattleButton.addEventListener("click", startBattle);
resetButton.addEventListener("click", resetGame);
renderAccount();
renderAll();
