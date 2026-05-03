const cards = [
  {
    name: "ミドニャ",
    hp: 150,
    attack: 50,
    defense: 30,
    element: "草",
    image: "assets/cards/midonya.png",
  },
  {
    name: "ミズニャ",
    hp: 150,
    attack: 30,
    defense: 50,
    element: "みず",
    image: "assets/cards/mizunya.png",
  },
  {
    name: "ヒエンギョ",
    hp: 130,
    attack: 70,
    defense: 30,
    element: "炎",
    image: "assets/cards/hiengyo.png",
  },
];

const elementAdvantage = {
  "炎": "草",
  "草": "みず",
  "みず": "炎",
};

const elementColors = {
  "炎": "#cf4f2c",
  "草": "#3c8f52",
  "みず": "#2b6fba",
};

const actionLabels = {
  attack: "攻撃",
  defense: "防御",
  charge: "溜め",
  counter: "カウンター",
  strongAttack: "強攻撃",
  piercingAttack: "貫通攻撃",
};

let player = null;
let cpu = null;
let turn = 1;
let battleOver = false;

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
  return elementAdvantage[attacker.element] === defender.element;
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

function renderCard(target, card) {
  target.style.setProperty("--element-color", elementColors[card.element]);
  target.style.setProperty("--hp-percent", hpPercent(card));
  target.innerHTML = `
    <img class="card-art" src="${card.image}" alt="${card.name}のカード画像">
    <h2 class="card-name">${card.name}</h2>
    <span class="element-tag">${card.element}</span>
    <div class="stats">
      <div class="stat"><span>攻撃</span><strong>${card.attack}</strong></div>
      <div class="stat"><span>防御</span><strong>${card.defense}</strong></div>
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
  player = makeBattleCard(selectedCard);
  const cpuChoices = cards.filter((card) => card.name !== selectedCard.name);
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

  for (const card of cards) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.style.setProperty("--element-color", elementColors[card.element]);
    button.innerHTML = `
      <img class="card-art choice-art" src="${card.image}" alt="${card.name}のカード画像">
      <h3 class="card-name">${card.name}</h3>
      <span class="element-tag">${card.element}</span>
      <div class="stats">
        <div class="stat"><span>HP</span><strong>${card.hp}</strong></div>
        <div class="stat"><span>攻撃</span><strong>${card.attack}</strong></div>
        <div class="stat"><span>防御</span><strong>${card.defense}</strong></div>
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

resetButton.addEventListener("click", resetGame);
renderChoices();
