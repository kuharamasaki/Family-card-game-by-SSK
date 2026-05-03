import json
import random
from dataclasses import dataclass
from pathlib import Path


ELEMENT_ADVANTAGE = {
    "炎": "草",
    "草": "みず",
    "みず": "炎",
}


@dataclass
class Card:
    name: str
    max_hp: int
    hp: int
    attack: int
    defense: int
    element: str
    charged: bool = False


def load_cards():
    cards_path = Path(__file__).with_name("cards.json")
    data = json.loads(cards_path.read_text(encoding="utf-8"))
    return [
        Card(
            name=item["name"],
            max_hp=item["hp"],
            hp=item["hp"],
            attack=item["attack"],
            defense=item["defense"],
            element=item["element"],
        )
        for item in data
    ]


def base_attack_damage(card):
    return 10 + card.attack // 10


def base_defense_power(card):
    return 10 + card.defense // 10


def has_element_advantage(attacker, defender):
    return ELEMENT_ADVANTAGE.get(attacker.element) == defender.element


def action_damage(attacker, defender, action):
    damage = base_attack_damage(attacker)

    if has_element_advantage(attacker, defender):
        damage += 10

    if action == "strong_attack":
        damage += 30

    return damage


def defense_reduction(defender, defender_action, incoming_action):
    if incoming_action == "piercing_attack" and defender_action != "charge":
        return 0

    reduction = 0

    if defender_action == "defense":
        reduction += base_defense_power(defender)

    if defender_action == "charge":
        reduction += 30

    return reduction


def attack_hits(action):
    return action in {"attack", "strong_attack", "piercing_attack"}


def resolve_attack(attacker, defender, attacker_action, defender_action):
    damage = action_damage(attacker, defender, attacker_action)

    if defender_action == "counter":
        attacker.hp -= damage
        defender.hp -= 1
        return (
            f"{defender.name}のカウンター！ "
            f"{attacker.name}に{damage}ダメージ。"
            f"{defender.name}は1ダメージ受けた。"
        )

    reduction = defense_reduction(defender, defender_action, attacker_action)
    final_damage = max(1, damage - reduction)
    defender.hp -= final_damage
    return f"{attacker.name}の攻撃！ {defender.name}に{final_damage}ダメージ。"


def resolve_turn(player, cpu, player_action, cpu_action):
    messages = []

    old_player_charged = player.charged
    old_cpu_charged = cpu.charged

    player.charged = False
    cpu.charged = False

    if player_action == "charge":
        player.charged = True
        messages.append(f"{player.name}は力を溜めた。")

    if cpu_action == "charge":
        cpu.charged = True
        messages.append(f"{cpu.name}は力を溜めた。")

    if attack_hits(player_action):
        messages.append(resolve_attack(player, cpu, player_action, cpu_action))

    if cpu.hp > 0 and attack_hits(cpu_action):
        messages.append(resolve_attack(cpu, player, cpu_action, player_action))

    if player_action in {"strong_attack", "piercing_attack"} and not old_player_charged:
        messages.append("注意: 溜めていないので、本当はこの行動は選べません。")

    if cpu_action in {"strong_attack", "piercing_attack"} and not old_cpu_charged:
        messages.append("注意: CPUは溜めていないので、本当はこの行動は選べません。")

    player.hp = max(0, player.hp)
    cpu.hp = max(0, cpu.hp)

    return messages


def choose_card(cards):
    print("カードを選んでね。")
    for index, card in enumerate(cards, start=1):
        print(
            f"{index}. {card.name} "
            f"HP:{card.hp} 攻撃:{card.attack} 防御:{card.defense} 属性:{card.element}"
        )

    while True:
        answer = input("> ")
        if answer.isdigit() and 1 <= int(answer) <= len(cards):
            return cards[int(answer) - 1]
        print("番号で選んでね。")


def available_actions(card):
    actions = ["attack", "defense", "charge", "counter"]
    if card.charged:
        actions.extend(["strong_attack", "piercing_attack"])
    return actions


def action_label(action):
    labels = {
        "attack": "攻撃",
        "defense": "防御",
        "charge": "溜め",
        "counter": "カウンター",
        "strong_attack": "強攻撃",
        "piercing_attack": "貫通攻撃",
    }
    return labels[action]


def choose_action(card):
    actions = available_actions(card)
    print(f"{card.name}の行動を選んでね。")
    for index, action in enumerate(actions, start=1):
        print(f"{index}. {action_label(action)}")

    while True:
        answer = input("> ")
        if answer.isdigit() and 1 <= int(answer) <= len(actions):
            return actions[int(answer) - 1]
        print("番号で選んでね。")


def cpu_choose_action(card):
    return random.choice(available_actions(card))


def show_hp(player, cpu):
    print()
    print(f"{player.name} HP: {player.hp}/{player.max_hp}")
    print(f"{cpu.name} HP: {cpu.hp}/{cpu.max_hp}")
    print()


def main():
    cards = load_cards()
    player = choose_card(cards)
    cpu_candidates = [card for card in cards if card.name != player.name]
    cpu = random.choice(cpu_candidates)

    print()
    print(f"CPUは{cpu.name}を選んだ！")

    turn = 1
    while player.hp > 0 and cpu.hp > 0:
        print()
        print(f"--- {turn}ターン目 ---")
        show_hp(player, cpu)

        player_action = choose_action(player)
        cpu_action = cpu_choose_action(cpu)

        print(f"あなた: {action_label(player_action)}")
        print(f"CPU: {action_label(cpu_action)}")

        for message in resolve_turn(player, cpu, player_action, cpu_action):
            print(message)

        turn += 1

    print()
    show_hp(player, cpu)
    if player.hp <= 0 and cpu.hp <= 0:
        print("引き分け！")
    elif cpu.hp <= 0:
        print("勝ち！")
    else:
        print("負け。もう一回チャレンジ！")


if __name__ == "__main__":
    main()
