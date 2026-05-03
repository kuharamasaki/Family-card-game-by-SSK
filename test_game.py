from game import Card, resolve_turn


def make_card(name, hp, attack, defense, element):
    return Card(
        name=name,
        max_hp=hp,
        hp=hp,
        attack=attack,
        defense=defense,
        element=element,
    )


def test_element_bonus_is_10():
    attacker = make_card("ヒエンギョ", 130, 70, 30, "炎")
    defender = make_card("ミドニャ", 150, 50, 30, "草")

    resolve_turn(attacker, defender, "attack", "attack")

    assert defender.hp == 150 - 27


def test_defense_reduces_damage():
    attacker = make_card("ヒエンギョ", 130, 70, 30, "炎")
    defender = make_card("ミズニャ", 150, 30, 50, "みず")

    resolve_turn(attacker, defender, "attack", "defense")

    assert defender.hp == 150 - 2


def test_piercing_ignores_defense():
    attacker = make_card("ヒエンギョ", 130, 70, 30, "炎")
    defender = make_card("ミズニャ", 150, 30, 50, "みず")
    attacker.charged = True

    resolve_turn(attacker, defender, "piercing_attack", "defense")

    assert defender.hp == 150 - 17


def test_charge_blocks_piercing_ignore_defense():
    attacker = make_card("ヒエンギョ", 130, 70, 30, "炎")
    defender = make_card("ミズニャ", 150, 30, 50, "みず")
    attacker.charged = True

    resolve_turn(attacker, defender, "piercing_attack", "charge")

    assert defender.hp == 150 - 1


def test_counter_reflects_attack_and_takes_1_damage():
    attacker = make_card("ヒエンギョ", 130, 70, 30, "炎")
    defender = make_card("ミドニャ", 150, 50, 30, "草")

    resolve_turn(attacker, defender, "attack", "counter")

    assert attacker.hp == 130 - 27
    assert defender.hp == 150 - 1
