const expectedFormat = "lumina-battle-export-v1";

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

const actionLabels = {
  attack: "攻撃",
  defense: "防御",
  charge: "溜め",
  counter: "カウンター",
  strongAttack: "強攻撃",
  piercingAttack: "貫通攻撃",
};

let ownedCards = [];
let ownerName = "";
let player = null;
let cpu = null;
let turn = 1;
let battleOver = false;

const jsonInput = document.querySelector("#jsonInput");
const poolSummary = document.querySelector("#poolSummary");
const selectTitle = document.querySelector("#selectTitle");
const selectScreen = document.querySelector("#selectScreen");
const battleScreen = document.querySelector("#battleScreen");
const cardChoices = document.querySelector("#cardChoices");
const playerCard = document.querySelector("#playerCard");
const cpuCard = document.querySelector("#cpuCard");
const actionButtons = document.querySelector("#actionButtons");
const battleLog = document.querySelector("#battleLog");
const turnLabel = document.querySelector("#turnLabel");
const statusText = document.querySelector("#statusText");
const resetButton = document.querySelector("#resetButton");

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
    rarity: card.rarity ?? "unknown",
    rarityLabel: card.rarityLabel ?? card.rarity ?? "レア度なし",
    image: card.image ?? "",
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

function parseBattleExport(rawText) {
  const data = JSON.parse(rawText);

  if (data.format !== expectedFormat) {
    throw new Error(`対応していないJSONです: ${data.format ?? "formatなし"}`);
  }

  if (!Array.isArray(data.cards)) {
    throw new Error("cards配列がありません。");
  }

  const cards = data.cards.map(normalizeCard).filter((card) => card.copies > 0);

  return {
    owner: data.owner ?? {},
    totalCards: Number(data.totalCards ?? 0),
    uniqueCards: Number(data.uniqueCards ?? cards.length),
    cards,
  };
}

function makeBattleCard(card) {
  return {
    ...card,
    maxHp: card.hp,
    currentHp: card.hp,
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

  if (defenderAction === "counter") {
    attacker.currentHp -= damage;
    defender.currentHp -= 1;
    return `${defender.name}のカウンター！ ${attacker.name}に${damage}ダメージ。${defender.name}は1ダメージ受けた。`;
  }

  const reduction = defenseReduction(defender, defenderAction, attackerAction);
  const finalDamage = Math.max(1, damage - reduction);
  defender.currentHp -= finalDamage;
  return `${attacker.name}の${actionLabels[attackerAction]}！ ${defender.name}に${finalDamage}ダメージ。`;
}

function resolveTurn(playerAction) {
  if (battleOver) {
    return;
  }

  const cpuAction = chooseCpuAction();
  const messages = [
    `あなた: ${actionLabels[playerAction]} / CPU: ${actionLabels[cpuAction]}`,
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

  addLog(messages);
  turn += 1;
  checkWinner();
  renderBattle();
}

function checkWinner() {
  if (player.currentHp > 0 && cpu.currentHp > 0) {
    return;
  }

  battleOver = true;

  if (player.currentHp <= 0 && cpu.currentHp <= 0) {
    statusText.textContent = "引き分け！";
    addLog(["引き分け！"]);
  } else if (cpu.currentHp <= 0) {
    statusText.textContent = "勝ち！";
    addLog(["勝ち！"]);
  } else {
    statusText.textContent = "負け。もう一回チャレンジ！";
    addLog(["負け。もう一回チャレンジ！"]);
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

  return `<img class="card-art ${extraClass}" src="${card.image}" alt="${card.name}のカード画像">`;
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
      <span class="meta-pill">所持: ${card.copies}枚</span>
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
    statusText.textContent = player.charged
      ? "強攻撃か貫通攻撃も使えるよ"
      : "スキルを選んでね";
  }

  renderCard(playerCard, player);
  renderCard(cpuCard, cpu);
  renderActions();
}

function startBattle(selectedCard) {
  if (ownedCards.length < 2) {
    poolSummary.textContent = "バトルにはカードが2種類以上必要です。";
    return;
  }

  player = makeBattleCard(selectedCard);
  const cpuChoices = ownedCards.filter((card) => card.id !== selectedCard.id);
  cpu = makeBattleCard(cpuChoices[Math.floor(Math.random() * cpuChoices.length)]);
  turn = 1;
  battleOver = false;
  battleLog.innerHTML = "";

  selectScreen.classList.add("is-hidden");
  battleScreen.classList.remove("is-hidden");
  addLog([`あなたは${player.name}、CPUは${cpu.name}を選んだ！`]);
  renderBattle();
}

function renderChoices() {
  cardChoices.innerHTML = "";

  if (ownedCards.length === 0) {
    cardChoices.innerHTML =
      `<p class="empty-message">まだカードJSONが読み込まれていません。</p>`;
    return;
  }

  for (const card of ownedCards) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.style.setProperty("--element-color", elementColors[card.attribute] ?? "#24745a");
    button.innerHTML = `
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
    `;
    button.addEventListener("click", () => startBattle(card));
    cardChoices.append(button);
  }
}

function resetGame() {
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
      ownerName = result.owner.name ?? "名前なし";
      selectTitle.textContent = `${ownerName}のカードプール`;
      poolSummary.textContent =
        `${ownerName}専用: ${ownedCards.length}種類 / 合計${result.totalCards}枚`;
      resetGame();
      renderChoices();
    } catch (error) {
      ownedCards = [];
      poolSummary.textContent = error.message;
      renderChoices();
    }
  });

  reader.readAsText(file, "utf-8");
}

jsonInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];

  if (file) {
    loadBattleExport(file);
  }
});

resetButton.addEventListener("click", resetGame);
renderChoices();
