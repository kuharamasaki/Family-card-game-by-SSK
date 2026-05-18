const expectedFormat = "lumina-battle-export-v1";
const maxDeckSize = 5;
const shortBattleSize = 3;
const shortCardTurnLimit = 4;
const counterSelfDamage = 10;
const statKeys = ["hp", "attack", "defense"];
const cardImageVersion = "20260517-2";

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
  dark: "star",
};

const fallbackElementLabels = {
  fire: "炎",
  plant: "草",
  water: "みず",
  electric: "電気",
  star: "星",
  "star-electric": "星・電気",
  dark: "闇",
};

const elementColors = {
  fire: "#cf4f2c",
  plant: "#3c8f52",
  water: "#2b6fba",
  electric: "#a57b13",
  star: "#6f55b8",
  "star-electric": "#7d5ac7",
  dark: "#32264f",
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
  dark: {
    normal: ["黒星崩壊（こくせいほうかい）", "ナイトフォール・レクイエム"],
    rare: ["黒星崩壊（こくせいほうかい）", "ナイトフォール・レクイエム"],
    super_rare: ["黒星崩壊（こくせいほうかい）", "ナイトフォール・レクイエム"],
    ultra_rare: ["黒星崩壊（こくせいほうかい）", "ナイトフォール・レクイエム"],
  },
};

const actionLabels = {
  attack: "攻撃",
  defense: "防御",
  charge: "溜め",
  counter: "カウンター",
  strongAttack: "強攻撃",
  piercingAttack: "貫通攻撃",
  skip: "行動なし",
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
const cardPoolsStorageKey = "luminaBattleCardPools";

let ownedCards = [];
let ownerName = "";
let cardPools = {};
let twoPlayerDeckNames = { sousuke: "", emma: "" };
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
let isShortBattle = false;
let shortBattleMode = "cpu";
let shortRoundIndex = 0;
let shortRoundTurn = 1;
let shortPlayerWins = 0;
let shortOpponentWins = 0;
let pendingShortPlayerAction = "";

try {
  cardPools = JSON.parse(localStorage.getItem(cardPoolsStorageKey) ?? "{}");
} catch {
  cardPools = {};
}

const jsonInputs = document.querySelectorAll("[data-json-input]");
const shortBattleButton = document.querySelector("#shortBattleButton");
const accountButtons = document.querySelectorAll("[data-account-id]");
const accountSummary = document.querySelector("#accountSummary");
const shortSetupScreen = document.querySelector("#shortSetupScreen");
const shortSetupSummary = document.querySelector("#shortSetupSummary");
const shortBattleModeInputs = document.querySelectorAll("[name='shortBattleMode']");
const shortPlayerOrder = document.querySelector("#shortPlayerOrder");
const shortOpponentOrderPanel = document.querySelector("#shortOpponentOrderPanel");
const shortOpponentOrder = document.querySelector("#shortOpponentOrder");
const cancelShortBattleButton = document.querySelector("#cancelShortBattleButton");
const startShortPreparedButton = document.querySelector("#startShortPreparedButton");
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
const teamNameInput = document.querySelector("#teamNameInput");
const newTeamButton = document.querySelector("#newTeamButton");
const deleteTeamButton = document.querySelector("#deleteTeamButton");
const twoPlayerSetup = document.querySelector("#twoPlayerSetup");
const sousukeDeckNameInput = document.querySelector("#sousukeDeckNameInput");
const emmaDeckNameInput = document.querySelector("#emmaDeckNameInput");
const sousukeDeckNames = document.querySelector("#sousukeDeckNames");
const emmaDeckNames = document.querySelector("#emmaDeckNames");
const sousukeBattleOrder = document.querySelector("#sousukeBattleOrder");
const emmaBattleOrder = document.querySelector("#emmaBattleOrder");
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
  return deckStorageKeyFor(activeAccount().id, ownerName);
}

function deckStorageKeyFor(accountId, poolOwnerName = "") {
  return `${deckStorageKeyPrefix}:${accountId}:${poolOwnerName || "no-card-file"}`;
}

function renderAccount() {
  const account = activeAccount();
  accountSummary.textContent = `${account.name}のアカウントを使用中`;

  for (const button of accountButtons) {
    button.classList.toggle("is-active", button.dataset.accountId === account.id);
  }
}

function resetNormalDeckState() {
  teams = [createTeam("チーム1")];
  activeTeamId = teams[0].id;
  playerDeck = teams[0].deck;
  playerTwoDeck = [];
}

function cardByIdFor(accountId, id) {
  const pool = cardPools[accountId];
  const cards = accountId === activeAccountId ? ownedCards : pool?.cards ?? [];
  return cards.find((card) => card.id === id);
}

function restoreDeck(savedDeck = [], accountId = activeAccount().id) {
  const restored = [];

  for (const item of savedDeck) {
    const card = cardByIdFor(accountId, item.cardId);
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

function loadDeckStateForAccount(accountId) {
  const account = accounts.find((item) => item.id === accountId) ?? accounts[0];
  const pool = cardPools[accountId];
  const fallbackTeam = { id: crypto.randomUUID(), name: "チーム1", deck: [] };

  if (!pool) {
    return { teams: [fallbackTeam], activeTeamId: fallbackTeam.id, playerTwoDeck: [] };
  }

  try {
    const saved = JSON.parse(localStorage.getItem(deckStorageKeyFor(accountId, pool.ownerName)) ?? "{}");

    if (saved.ownerName !== pool.ownerName || saved.accountId !== account.id) {
      return { teams: [fallbackTeam], activeTeamId: fallbackTeam.id, playerTwoDeck: [] };
    }

    const restoredTeams = Array.isArray(saved.teams) && saved.teams.length > 0
      ? saved.teams.map((team, index) => ({
          id: team.id ?? crypto.randomUUID(),
          name: team.name ?? `チーム${index + 1}`,
          deck: restoreDeck(team.deck, accountId),
        }))
      : [fallbackTeam];

    return {
      teams: restoredTeams,
      activeTeamId: saved.activeTeamId ?? restoredTeams[0].id,
      playerTwoDeck: restoreDeck(saved.playerTwoDeck, accountId),
    };
  } catch {
    return { teams: [fallbackTeam], activeTeamId: fallbackTeam.id, playerTwoDeck: [] };
  }
}

function setActiveCardPool(accountId) {
  const account = accounts.find((item) => item.id === accountId) ?? activeAccount();
  const pool = cardPools[account.id];
  activeAccountId = account.id;
  localStorage.setItem(activeAccountStorageKey, activeAccountId);
  isShortBattle = false;
  shortSetupScreen.classList.add("is-hidden");

  if (!pool) {
    ownedCards = [];
    ownerName = account.name;
    resetNormalDeckState();
    selectTitle.textContent = `${account.name}のチーム編成`;
    poolSummary.textContent = `${account.name}のカードファイルを読み込んでください。`;
    resetGame();
    renderAccount();
    renderAll();
    return;
  }

  ownedCards = pool.cards;
  ownerName = pool.ownerName;
  resetNormalDeckState();
  selectTitle.textContent = `${account.name}のチーム編成`;
  poolSummary.textContent = `${account.name}専用: ${ownedCards.length}種類 / 合計${pool.totalCards}枚`;
  restoreDecks();
  resetGame();
  renderAccount();
  renderAll();
}

function saveCardPools() {
  localStorage.setItem(cardPoolsStorageKey, JSON.stringify(cardPools));
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
  renderTwoPlayerSetup();
}

function restoreDecks() {
  const state = loadDeckStateForAccount(activeAccount().id);
  teams = state.teams;
  activeTeamId = state.activeTeamId;
  syncPlayerDeck();
  playerTwoDeck = state.playerTwoDeck;
}

function makeBattleCard(entry) {
  return {
    ...entry.card,
    move: entry.move,
    maxHp: entry.card.hp,
    currentHp: entry.card.hp,
    charged: false,
    usedActions: new Set(),
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

function actionDisplayName(card, action) {
  if (action === "attack") {
    return card.move ?? actionLabels.attack;
  }

  if (action === "strongAttack") {
    return `強攻撃: ${card.move ?? actionLabels.attack}`;
  }

  if (action === "piercingAttack") {
    return `貫通: ${card.move ?? actionLabels.attack}`;
  }

  return actionLabels[action];
}

function availableActions(card) {
  const baseActions = ["attack", "defense", "charge", "counter"];
  const used = card.usedActions ?? new Set();
  const actions = isShortBattle ? baseActions.filter((action) => !used.has(action)) : baseActions;

  if (card.charged) {
    for (const action of ["strongAttack", "piercingAttack"]) {
      if (!isShortBattle || !used.has(action)) {
        actions.push(action);
      }
    }
  }

  return actions;
}

function chooseCpuAction() {
  const actions = availableActions(cpu);
  if (actions.length === 0) {
    return "skip";
  }

  return actions[Math.floor(Math.random() * actions.length)];
}

function resolveAttack(attacker, defender, attackerAction, defenderAction) {
  const damage = actionDamage(attacker, defender, attackerAction);
  const moveName = attacker.move ?? actionLabels[attackerAction];

  if (defenderAction === "counter") {
    attacker.currentHp -= damage;
    defender.currentHp -= counterSelfDamage;
    return `${defender.name}のカウンター！ ${attacker.name}に${damage}ダメージ。${defender.name}は${counterSelfDamage}ダメージ受けた。`;
  }

  const reduction = defenseReduction(defender, defenderAction, attackerAction);
  const finalDamage = Math.max(1, damage - reduction);
  defender.currentHp -= finalDamage;
  return `${attacker.name}の${moveName}！ ${defender.name}に${finalDamage}ダメージ。`;
}

function resolveAttacksBySpeed(firstCard, secondCard, firstAction, secondAction, messages) {
  const attacks = [];

  if (attackHits(firstAction)) {
    attacks.push({
      attacker: firstCard,
      defender: secondCard,
      action: firstAction,
      defenderAction: secondAction,
      order: 0,
    });
  }

  if (attackHits(secondAction)) {
    attacks.push({
      attacker: secondCard,
      defender: firstCard,
      action: secondAction,
      defenderAction: firstAction,
      order: 1,
    });
  }

  attacks.sort((a, b) => {
    const speedDiff = Number(b.attacker.speed ?? 0) - Number(a.attacker.speed ?? 0);
    return speedDiff || a.order - b.order;
  });

  for (const attack of attacks) {
    if (attack.attacker.currentHp <= 0 || attack.defender.currentHp <= 0) {
      continue;
    }

    messages.push(resolveAttack(attack.attacker, attack.defender, attack.action, attack.defenderAction));
  }
}

function currentPlayerName() {
  if (isShortBattle) {
    return "ソウスケ";
  }

  return battleMode === "twoPlayer" ? "ソウスケ" : "あなた";
}

function currentOpponentName() {
  if (isShortBattle) {
    return battleMode === "twoPlayer" ? "エマ" : "CPU";
  }

  return battleMode === "twoPlayer" ? "エマ" : "CPU";
}

function resolveTurn(playerAction) {
  if (battleOver) {
    return;
  }

  if (isShortBattle) {
    resolveShortTurn(playerAction);
    return;
  }

  const cpuAction = chooseCpuAction();
  const messages = [
    `${currentPlayerName()}: ${actionDisplayName(player, playerAction)} / ${currentOpponentName()}: ${actionDisplayName(cpu, cpuAction)}`,
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

  resolveAttacksBySpeed(player, cpu, playerAction, cpuAction, messages);

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

function markActionUsed(card, action) {
  if (!card || action === "skip") {
    return;
  }

  if (!card.usedActions) {
    card.usedActions = new Set();
  }

  card.usedActions.add(action);
}

function resolveActionPair(playerAction, opponentAction) {
  const messages = [
    `${currentPlayerName()}: ${actionDisplayName(player, playerAction)} / ${currentOpponentName()}: ${actionDisplayName(cpu, opponentAction)}`,
  ];

  player.charged = false;
  cpu.charged = false;
  markActionUsed(player, playerAction);
  markActionUsed(cpu, opponentAction);

  if (playerAction === "charge") {
    player.charged = true;
    messages.push(`${player.name}は力を溜めた。`);
  }

  if (opponentAction === "charge") {
    cpu.charged = true;
    messages.push(`${cpu.name}は力を溜めた。`);
  }

  resolveAttacksBySpeed(player, cpu, playerAction, opponentAction, messages);

  player.currentHp = Math.max(0, player.currentHp);
  cpu.currentHp = Math.max(0, cpu.currentHp);
  return messages;
}

function resolveShortTurn(playerAction) {
  if (battleMode === "twoPlayer" && !pendingShortPlayerAction) {
    pendingShortPlayerAction = playerAction;
    statusText.textContent = "エマの行動を選んでください。";
    renderActions();
    return;
  }

  const opponentAction =
    battleMode === "twoPlayer" ? playerAction : chooseCpuAction();
  const firstAction =
    battleMode === "twoPlayer" ? pendingShortPlayerAction : playerAction;
  pendingShortPlayerAction = "";

  const messages = resolveActionPair(firstAction, opponentAction);
  shortRoundTurn += 1;
  turn += 1;

  if (player.currentHp <= 0 || cpu.currentHp <= 0 || shortRoundTurn > shortCardTurnLimit) {
    messages.push(finishShortRound());
  }

  addLog(messages.filter(Boolean));
  renderBattle();
}

function finishShortRound() {
  let result = "";

  if (player.currentHp > cpu.currentHp) {
    shortPlayerWins += 1;
    result = `${player.name}の勝ち。ソウスケ ${shortPlayerWins}勝 / ${currentOpponentName()} ${shortOpponentWins}勝`;
  } else if (cpu.currentHp > player.currentHp) {
    shortOpponentWins += 1;
    result = `${cpu.name}の勝ち。ソウスケ ${shortPlayerWins}勝 / ${currentOpponentName()} ${shortOpponentWins}勝`;
  } else {
    result = `${player.name}と${cpu.name}は引き分け。`;
  }

  shortRoundIndex += 1;

  if (shortRoundIndex >= shortBattleSize) {
    battleOver = true;
    if (shortPlayerWins > shortOpponentWins) {
      statusText.textContent = "ソウスケの勝ち！";
      return `${result} 3カード対戦はソウスケの勝ち！`;
    }

    if (shortOpponentWins > shortPlayerWins) {
      statusText.textContent = `${currentOpponentName()}の勝ち！`;
      return `${result} 3カード対戦は${currentOpponentName()}の勝ち！`;
    }

    statusText.textContent = "引き分け！";
    return `${result} 3カード対戦は引き分け！`;
  }

  player = makeBattleCard(playerBattleDeck[shortRoundIndex]);
  cpu = makeBattleCard(opponentBattleDeck[shortRoundIndex]);
  shortRoundTurn = 1;
  turn = 1;
  return `${result} 次は${player.name} vs ${cpu.name}。`;
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
  const actingCard = isShortBattle && battleMode === "twoPlayer" && pendingShortPlayerAction ? cpu : player;
  const actorName = isShortBattle && battleMode === "twoPlayer" && pendingShortPlayerAction ? "エマ" : currentPlayerName();
  const actions = availableActions(actingCard);

  if (actions.length === 0 && isShortBattle) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "skill-button";
    button.textContent = `${actorName}: ${actionDisplayName(actingCard, "skip")}`;
    button.disabled = battleOver;
    button.addEventListener("click", () => resolveTurn("skip"));
    actionButtons.append(button);
    return;
  }

  for (const action of actions) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "skill-button";
    const label = actionDisplayName(actingCard, action);
    button.textContent = isShortBattle && battleMode === "twoPlayer" ? `${actorName}: ${label}` : label;

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
  battleScreen.classList.toggle("short-battle-board", isShortBattle);
  turnLabel.textContent = isShortBattle ? `${shortRoundIndex + 1}戦目 ${shortRoundTurn}/${shortCardTurnLimit}` : `${turn}ターン目`;

  if (!battleOver) {
    statusText.textContent = isShortBattle
      ? `ソウスケ ${shortPlayerWins}勝 / ${currentOpponentName()} ${shortOpponentWins}勝`
      : `${currentPlayerName()}のカード ${playerActiveIndex + 1}/${playerBattleDeck.length}、${currentOpponentName()}のカード ${opponentActiveIndex + 1}/${opponentBattleDeck.length}`;
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

function accountTeams(accountId) {
  if (accountId === activeAccount().id) {
    return teams;
  }

  return loadDeckStateForAccount(accountId).teams;
}

function deckNameOptions(target, accountId) {
  target.innerHTML = "";

  for (const team of accountTeams(accountId)) {
    const option = document.createElement("option");
    option.value = team.name;
    target.append(option);
  }
}

function deckByName(accountId, name) {
  return accountTeams(accountId).find((team) => team.name === name);
}

function fillDefaultDeckName(input, accountId) {
  const accountDecks = accountTeams(accountId);
  if (!input.value && accountDecks[0]) {
    input.value = accountDecks[0].name;
  }
}

function orderOptionsHtml(deck, selectedIndex) {
  return deck.deck
    .map((entry, index) => `
      <option value="${index}" ${index === selectedIndex ? "selected" : ""}>
        ${entry.card.name} / 技: ${entry.move}
      </option>
    `)
    .join("");
}

function renderOrderControls(container, deck, side) {
  container.innerHTML = "";

  if (!deck || deck.deck.length === 0) {
    container.innerHTML = `<p class="empty-message">デッキが見つかりません。</p>`;
    return;
  }

  deck.deck.forEach((entry, index) => {
    const label = document.createElement("label");
    label.textContent = `${index + 1}番目`;
    label.innerHTML = `
      ${index + 1}番目
      <select data-battle-order="${side}">${orderOptionsHtml(deck, index)}</select>
    `;
    container.append(label);
  });
}

function renderTwoPlayerSetup() {
  const isTwoPlayer = battleMode === "twoPlayer";
  twoPlayerSetup.classList.toggle("is-hidden", !isTwoPlayer);

  if (!isTwoPlayer) {
    return;
  }

  deckNameOptions(sousukeDeckNames, "sousuke");
  deckNameOptions(emmaDeckNames, "emma");
  fillDefaultDeckName(sousukeDeckNameInput, "sousuke");
  fillDefaultDeckName(emmaDeckNameInput, "emma");

  const sousukeDeck = deckByName("sousuke", sousukeDeckNameInput.value);
  const emmaDeck = deckByName("emma", emmaDeckNameInput.value);
  renderOrderControls(sousukeBattleOrder, sousukeDeck, "sousuke");
  renderOrderControls(emmaBattleOrder, emmaDeck, "emma");
}

function orderedDeckFromControls(accountId, name, side) {
  const deck = deckByName(accountId, name);

  if (!deck || deck.deck.length === 0) {
    return null;
  }

  const indexes = [...document.querySelectorAll(`[data-battle-order="${side}"]`)].map((select) =>
    Number(select.value)
  );

  if (indexes.length !== deck.deck.length || new Set(indexes).size !== indexes.length) {
    return null;
  }

  return indexes.map((index) => ({ ...deck.deck[index], uid: crypto.randomUUID() }));
}

function startBattle() {
  isShortBattle = false;
  battleScreen.classList.remove("short-battle-board");

  if (battleMode === "twoPlayer") {
    const sousukeDeck = orderedDeckFromControls("sousuke", sousukeDeckNameInput.value, "sousuke");
    const emmaDeck = orderedDeckFromControls("emma", emmaDeckNameInput.value, "emma");

    if (!sousukeDeck || !emmaDeck) {
      teamSummary.textContent = "ソウスケとエマのデッキ名、出す順番を確認してください。";
      return;
    }

    playerBattleDeck = sousukeDeck;
    opponentBattleDeck = emmaDeck;
  } else if (playerDeck.length === 0) {
    teamSummary.textContent = "自分のデッキにカードを入れてください。";
    return;
  } else {
    playerBattleDeck = playerDeck.map((entry) => ({ ...entry }));
    opponentBattleDeck = buildCpuDeck();
  }

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
  renderTwoPlayerSetup();
  playerTwoDeckPanel.classList.add("is-hidden");
  renderDeckList(playerDeck, playerDeckList, "player");
  renderDeckList(playerTwoDeck, playerTwoDeckList, "playerTwo");

  if (battleMode === "twoPlayer") {
    const sousukeDeck = deckByName("sousuke", sousukeDeckNameInput.value);
    const emmaDeck = deckByName("emma", emmaDeckNameInput.value);
    const hasSousukeDeck = Boolean(sousukeDeck?.deck.length);
    const hasEmmaDeck = Boolean(emmaDeck?.deck.length);
    teamSummary.textContent = `二人対戦: ソウスケ「${sousukeDeckNameInput.value || "未指定"}」 / エマ「${emmaDeckNameInput.value || "未指定"}」`;
    startBattleButton.disabled = !hasSousukeDeck || !hasEmmaDeck;
    return;
  }

  teamSummary.textContent = `自分 ${playerDeck.length}/${maxDeckSize}`;
  startBattleButton.disabled = playerDeck.length === 0;
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
  teamNameInput.value = activeTeam().name;
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

    controls[1].classList.add("is-hidden");
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
          <p data-training-message class="${message.className}">${message.text}</p>
        </div>
      </div>
    `;

    const messageElement = article.querySelector("[data-training-message]");

    for (const input of article.querySelectorAll("[data-stat]")) {
      input.addEventListener("input", () => {
        const key = input.dataset.stat;
        const value = Number(input.value || 0);
        card[key] = value;
        card.stats[key === "attack" ? "power" : key] = value;
        saveDecks();

        const nextMessage = trainingMessage(card);
        messageElement.className = nextMessage.className;
        messageElement.textContent = nextMessage.text;
      });
    }

    trainingCards.append(article);
  }
}

function resetGame() {
  if (isShortBattle) {
    shortSetupScreen.classList.remove("is-hidden");
    teamScreen.classList.add("is-hidden");
    selectScreen.classList.add("is-hidden");
    trainingScreen.classList.add("is-hidden");
  } else {
    shortSetupScreen.classList.add("is-hidden");
    teamScreen.classList.remove("is-hidden");
    selectScreen.classList.remove("is-hidden");
  }

  battleScreen.classList.add("is-hidden");
  battleScreen.classList.remove("short-battle-board");
  player = null;
  cpu = null;
  turn = 1;
  battleOver = false;
  pendingShortPlayerAction = "";
  battleLog.innerHTML = "";
  statusText.textContent = "スキルを選んでね";
}

function loadBattleExport(file, accountId = activeAccountId) {
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    try {
      const result = parseBattleExport(String(reader.result));
      const account = accounts.find((item) => item.id === accountId) ?? activeAccount();
      cardPools[account.id] = {
        cards: result.cards,
        ownerName: result.owner.name ?? account.name,
        totalCards: result.totalCards,
        uniqueCards: result.uniqueCards,
      };
      saveCardPools();
      setActiveCardPool(account.id);
    } catch (error) {
      ownedCards = [];
      resetNormalDeckState();
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

function shortCardOptions(selectedId = "") {
  return ownedCards
    .map((card) => `<option value="${card.id}" ${card.id === selectedId ? "selected" : ""}>${card.name}</option>`)
    .join("");
}

function renderShortOrderControls() {
  const ids = ownedCards.map((card) => card.id);
  const labels = ["先鋒", "中堅", "大将"];
  shortPlayerOrder.innerHTML = labels
    .map((label, index) => `
      <label>${label}
        <select data-short-order="player">${shortCardOptions(ids[index])}</select>
      </label>
    `)
    .join("");
  shortOpponentOrder.innerHTML = labels
    .map((label, index) => `
      <label>${label}
        <select data-short-order="opponent">${shortCardOptions(ids[index])}</select>
      </label>
    `)
    .join("");
  renderShortSetup();
}

function renderShortSetup() {
  shortOpponentOrderPanel.classList.toggle("is-hidden", shortBattleMode !== "twoPlayer");
  shortSetupSummary.textContent =
    shortBattleMode === "twoPlayer"
      ? "ソウスケとエマが、同じ3体から出す順番だけ選びます。"
      : "ソウスケの出す順番を選びます。CPも同じ3体で勝負します。";
}

function selectedShortCards(target) {
  const selects = [...document.querySelectorAll(`[data-short-order="${target}"]`)];
  const ids = selects.map((select) => select.value);

  if (new Set(ids).size !== shortBattleSize) {
    return null;
  }

  return ids.map((id) => cardById(id));
}

function startShortBattle() {
  ownedCards = shortBattleCards.map(normalizeCard);
  ownerName = "ショートバトル";
  isShortBattle = true;
  battleMode = "cpu";
  shortBattleMode = "cpu";

  for (const input of battleModeInputs) {
    input.checked = input.value === "cpu";
  }

  for (const input of shortBattleModeInputs) {
    input.checked = input.value === "cpu";
  }

  teams = [createTeam("ショートバトル")];
  activeTeamId = teams[0].id;
  teams[0].deck = [];
  syncPlayerDeck();
  playerTwoDeck = [];
  selectTitle.textContent = "ショートバトルの3体";
  poolSummary.textContent = "ミズラビ・モリネ・ファイケルだけで、順番を選んで遊べます。";
  resetGame();
  shortSetupScreen.classList.remove("is-hidden");
  teamScreen.classList.add("is-hidden");
  selectScreen.classList.add("is-hidden");
  trainingScreen.classList.add("is-hidden");
  for (const button of tabButtons) {
    button.classList.remove("is-active");
  }
  renderShortOrderControls();
  renderAll();
}

function startPreparedShortBattle() {
  const playerCards = selectedShortCards("player");
  const opponentCards =
    shortBattleMode === "twoPlayer" ? selectedShortCards("opponent") : [...ownedCards].reverse();

  if (!playerCards || !opponentCards) {
    shortSetupSummary.textContent = "同じカードを2回選ばず、3体を1回ずつ選んでください。";
    return;
  }

  battleMode = shortBattleMode;
  playerDeck = makeDeckFromCards(playerCards);
  playerTwoDeck = makeDeckFromCards(opponentCards);
  playerBattleDeck = playerDeck.map((entry) => ({ ...entry }));
  opponentBattleDeck = playerTwoDeck.map((entry) => ({ ...entry }));
  playerActiveIndex = 0;
  opponentActiveIndex = 0;
  shortRoundIndex = 0;
  shortRoundTurn = 1;
  shortPlayerWins = 0;
  shortOpponentWins = 0;
  pendingShortPlayerAction = "";
  player = makeBattleCard(playerBattleDeck[0]);
  cpu = makeBattleCard(opponentBattleDeck[0]);
  turn = 1;
  battleOver = false;
  battleLog.innerHTML = "";
  shortSetupScreen.classList.add("is-hidden");
  battleScreen.classList.remove("is-hidden");
  addLog([`ショートバトル開始！ ${player.name} vs ${cpu.name}`]);
  renderBattle();
}

for (const input of jsonInputs) {
  input.addEventListener("change", (event) => {
    const file = event.target.files?.[0];

    if (file) {
      loadBattleExport(file, input.dataset.jsonInput);
    }
  });
}

shortBattleButton.addEventListener("click", startShortBattle);

for (const input of shortBattleModeInputs) {
  input.addEventListener("change", () => {
    shortBattleMode = input.value;
    renderShortSetup();
  });
}

cancelShortBattleButton.addEventListener("click", () => {
  isShortBattle = false;
  shortSetupScreen.classList.add("is-hidden");
  resetGame();
  renderAll();
});

startShortPreparedButton.addEventListener("click", startPreparedShortBattle);

for (const button of accountButtons) {
  button.addEventListener("click", () => {
    setActiveCardPool(button.dataset.accountId);
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

teamNameInput.addEventListener("input", () => {
  const nextName = teamNameInput.value.trim() || "名前なしデッキ";
  activeTeam().name = nextName;
  saveDecks();
  renderTeamOptions();
});

sousukeDeckNameInput.addEventListener("input", () => {
  twoPlayerDeckNames.sousuke = sousukeDeckNameInput.value;
  renderTwoPlayerSetup();
  renderDecks();
});

emmaDeckNameInput.addEventListener("input", () => {
  twoPlayerDeckNames.emma = emmaDeckNameInput.value;
  renderTwoPlayerSetup();
  renderDecks();
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

if (cardPools[activeAccountId]) {
  setActiveCardPool(activeAccountId);
} else {
  renderAccount();
  renderAll();
}
