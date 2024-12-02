// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "../Game.sol";
import "../GameUtils.sol";
import "../../utils/PositionUtils.sol";
import "../../solidity-kit/solc_0_8/utils/Math.sol";
import "hardhat/console.sol";

contract GameReveal is Game {
    using GameUtils for Config;

    struct Context {
        uint256 characterID;
        uint64 priorPosition;
        uint24 epoch;
        uint256[] actions;
        bytes32 secret;
        uint64 priorGold;
        uint8 priorHP;
        uint24 priorXP;
        uint128 attackGear;
        uint128 defenseGear;
        uint128 accessory1;
        uint128 accessory2;
    }

    struct Monster {
        int32 x;
        int32 y;
        uint8 hp;
        uint8 kind;
    }

    struct Battle {
        uint8 monsterIndexPlus1; // 0 means no monster
        uint8 attackCardsUsed1; // bitmap
        uint8 attackCardsUsed2; // bitmap
        uint8 defenseCardsUsed1; // bitmap
        uint8 defenseCardsUsed2; // bitmap
    }

    struct StateChanges {
        uint256 characterID;
        uint64 newPosition;
        uint24 epoch;
        uint24 newXP;
        uint8 newHP;
        Monster[5] monsters;
        Battle battle;
    }

    function reveal(uint256 characterID, uint256[] calldata actions, bytes32 secret) external {
        Game.Store storage store = getStore();
        Context memory context = _context(store, characterID, actions, secret);
        StateChanges memory stateChanges = computeStateChanges(context, false);
        _apply(store, stateChanges);
        emit MoveRevealed(
            context.characterID,
            context.epoch,
            context.actions,
            stateChanges.newPosition,
            stateChanges.newHP,
            stateChanges.newXP
        );
    }

    function computeStateChanges(
        Context memory context,
        bool revetOnInvalidMoves
    ) public pure returns (StateChanges memory stateChanges) {
        stateChanges = initialStateChanges(context);
        for (uint256 i = 0; i < context.actions.length; i++) {
            _step(stateChanges, context, context.actions[i], revetOnInvalidMoves);
        }
    }

    function initialStateChanges(Context memory context) public pure returns (StateChanges memory stateChanges) {
        uint64 position = context.priorPosition;
        (int32 x, int32 y) = PositionUtils.toXY(position);
        Monster[5] memory monsters;
        // TODO randomize
        // TODO explore the idea of persistent local monsters
        // they get replaced by new one if out of bound
        // we can easily store Monster info in 256 bits?
        // position can be represented as delta from player and can be store in few bits this way
        // life is tiny and monster type can do the rest
        // 256bits should be enough
        monsters[0] = Monster({x: x - 2, y: y + 5, hp: 3, kind: 1});
        monsters[1] = Monster({x: x - 5, y: y - 3, hp: 3, kind: 1});
        monsters[2] = Monster({x: x + 5, y: y + 2, hp: 3, kind: 1});
        monsters[3] = Monster({x: x + 6, y: y - 5, hp: 3, kind: 1});
        monsters[4] = Monster({x: x + 4, y: y + 8, hp: 3, kind: 1});
        stateChanges.monsters = monsters;
        stateChanges.newPosition = position;
        stateChanges.newHP = 10; // TODO
        stateChanges.newXP = 10; // TODO
    }

    /// @notice allow to step through each action and predict the outcome in turnn
    function stepChanges(
        StateChanges memory stateChanges,
        Context memory context,
        uint256 action,
        bool revetOnInvalidMoves
    ) external pure returns (StateChanges memory) {
        _step(stateChanges, context, action, revetOnInvalidMoves);
        // as external function, it will always return a copy
        return stateChanges;
    }

    function _context(
        Game.Store storage store,
        uint256 characterID,
        uint256[] calldata actions,
        bytes32 secret
    ) internal view returns (Context memory context) {
        Config memory config = getConfig();
        // TODO check secret
        context.characterID = characterID;
        context.priorPosition = store.characterStates[characterID].position;
        (context.epoch, ) = config.getEpoch();
        context.actions = actions;
        context.secret = secret;

        context.priorGold = store.characterStates[characterID].gold;
        context.priorHP = store.characterStates[characterID].hp;
        context.priorXP = store.characterStates[characterID].xp;
        context.attackGear = store.characterStates[characterID].attackGear;
        context.defenseGear = store.characterStates[characterID].defenseGear;
        context.accessory1 = store.characterStates[characterID].accessory1;
        context.accessory2 = store.characterStates[characterID].accessory2;
    }

    function _step(
        StateChanges memory stateChanges,
        Context memory context,
        uint256 action,
        bool revetOnInvalidMoves
    ) internal pure {
        uint64 position = stateChanges.newPosition;
        (int32 x, int32 y) = PositionUtils.toXY(position);
        if (stateChanges.battle.monsterIndexPlus1 == 0) {
            _move(x, y, stateChanges, action, revetOnInvalidMoves);
        } else {
            _battle(stateChanges, context, action, revetOnInvalidMoves);
        }
    }
    function _move(
        int32 x,
        int32 y,
        StateChanges memory stateChanges,
        uint256 action,
        bool revetOnInvalidMoves
    ) internal pure {
        uint64 position = stateChanges.newPosition;
        Monster[5] memory monsters = stateChanges.monsters;
        if (action >> 248 != 0) {
            if (revetOnInvalidMoves) {
                revert InvalidMove(Reason.ActionIsNotMove);
            }
            return;
        }
        uint64 next = uint64(action);
        (int32 nextX, int32 nextY) = PositionUtils.toXY(next);
        Reason invalidMove = GameUtils.isValidMove(x, y, nextX, nextY);
        if (invalidMove == Reason.None) {
            position = next;
        } else {
            if (revetOnInvalidMoves) {
                revert InvalidMove(invalidMove);
            }
        }
        (x, y) = PositionUtils.toXY(position);
        for (uint256 e = 0; e < 5; e++) {
            Monster memory monster = monsters[e];
            if (monster.hp > 0) {
                _moveMonster(x, y, monsters, monster);
                if (monster.x == x && monster.y == y) {
                    stateChanges.battle.monsterIndexPlus1 = uint8(e + 1); // TODO make e uint8 ?
                }
            }
        }
        stateChanges.newPosition = position;
    }

    function _moveMonster(int32 x, int32 y, Monster[5] memory monsters, Monster memory monster) internal pure {
        int32 m_nextX = monster.x;
        int32 m_nextY = monster.y;
        int32 xDiff = x - monster.x;
        int32 yDiff = y - monster.y;

        if (!(xDiff == 0 && yDiff == 0)) {
            // TODO randomize like in initialState
            int32 rand_x = x + 5;
            int32 rand_y = y + 5;
            if (
                (Math.abs(xDiff) > 10 || Math.abs(yDiff) > 10) &&
                isTakenByOtherMonster(monsters, rand_x, rand_y) == type(uint256).max
            ) {
                m_nextX = rand_x;
                m_nextY = rand_y;
            } else if (Math.abs(xDiff) > Math.abs(yDiff)) {
                m_nextX += (xDiff > int32(0) ? int32(1) : int32(-1));
                if (
                    GameUtils.isValidMove(monster.x, monster.y, m_nextX, m_nextY) != Reason.None ||
                    isTakenByOtherMonster(monsters, m_nextX, m_nextY) != type(uint256).max
                ) {
                    m_nextY += (yDiff > int32(0) ? int32(1) : int32(-1));
                    m_nextX = monster.x;
                    if (
                        GameUtils.isValidMove(monster.x, monster.y, m_nextX, m_nextY) != Reason.None ||
                        isTakenByOtherMonster(monsters, m_nextX, m_nextY) != type(uint256).max
                    ) {
                        m_nextY = monster.y;
                    }
                }
            } else {
                m_nextY += (yDiff > int32(0) ? int32(1) : int32(-1));
                if (
                    GameUtils.isValidMove(monster.x, monster.y, m_nextX, m_nextY) != Reason.None ||
                    isTakenByOtherMonster(monsters, m_nextX, m_nextY) != type(uint256).max
                ) {
                    m_nextX += (xDiff > int32(0) ? int32(1) : int32(-1));
                    m_nextY = monster.y;
                    if (
                        GameUtils.isValidMove(monster.x, monster.y, m_nextX, m_nextY) != Reason.None ||
                        isTakenByOtherMonster(monsters, m_nextX, m_nextY) != type(uint256).max
                    ) {
                        m_nextX = monster.x;
                    }
                }
            }
            monster.x = m_nextX;
            monster.y = m_nextY;
        }
    }

    // TODO : (2 << 98) | (2 << 91) | (2 << 84) | (1 << 77) | (2 << 70)
    uint128 constant defaultAttackGear = (2 << 98) | (4 << 91) | (2 << 84) | (2 << 77) | (1 << 70); // <uint3 numCards><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value>
    // TODO : (2 << 98) | (2 << 91) | (0 << 84) | (0 << 77) | (1 << 70)
    uint128 constant defaultDefenseGear = (2 << 98) | (3 << 91) | (3 << 84) | (1 << 77) | (2 << 70); // <uint3 numCards><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value>

    uint256 constant defaultMonster =
        //<uint8 hp>
        (4 << 248) |
            //<uint3 numCards><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value>
            (2 << 226) |
            (2 << 219) |
            (1 << 212) |
            (1 << 205) |
            (1 << 198) |
            //<uint3 numCards><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value>
            (2 << 98) |
            (0 << 91) |
            (0 << 84) |
            (1 << 77) |
            (0 << 70);

    function _battle(
        StateChanges memory stateChanges,
        Context memory context,
        uint256 action,
        bool revetOnInvalidMoves
    ) internal pure {
        if (action >> 248 != 1) {
            if (revetOnInvalidMoves) {
                revert InvalidMove(Reason.ActionIsNotBattle);
            }
            return;
        }

        uint256 monsterIndex = stateChanges.battle.monsterIndexPlus1 - 1;

        {
            (uint8 attackBonus1, uint8 attackValue1, uint8 newAttackCardsUsed1) = _checkAndGetCardData(
                stateChanges.battle.attackCardsUsed1,
                context.attackGear,
                uint8(action >> 8)
            );
            stateChanges.battle.attackCardsUsed1 = newAttackCardsUsed1;

            (uint8 defenseBonus2, uint8 defenseValue2, uint8 newDefenseCardsUsed2) = _checkAndGetCardData(
                stateChanges.battle.defenseCardsUsed2,
                uint128((defaultMonster) & 0x1FFFFFFFFFFFFFFFFFFFFFFFFF),
                _getAvailableCardIndex(
                    stateChanges.battle.defenseCardsUsed2,
                    uint128((defaultMonster) & 0x1FFFFFFFFFFFFFFFFFFFFFFFFF)
                )
            );
            stateChanges.battle.defenseCardsUsed2 = newDefenseCardsUsed2;

            // console.log("attackBonus1 %i", attackBonus1);
            // console.log("attackValue1 %i", attackValue1);
            // console.log("defenseBonus2 %i", defenseBonus2);
            // console.log("defenseValue2 %i", defenseValue2);

            if (attackBonus1 > defenseBonus2) {
                uint8 damage = defenseValue2 > attackValue1 ? 0 : attackValue1 - defenseValue2;
                uint8 hp = stateChanges.monsters[monsterIndex].hp;
                if (damage >= hp) {
                    hp = 0;
                } else {
                    hp -= damage;
                }

                stateChanges.monsters[monsterIndex].hp = hp;
                // console.log("you inflict %i damage", damage);
            }
        }

        {
            (uint8 defenseBonus1, uint8 defenseValue1, uint8 newDefenseCardsUsed1) = _checkAndGetCardData(
                stateChanges.battle.defenseCardsUsed1,
                context.defenseGear,
                uint8(action)
            );
            stateChanges.battle.defenseCardsUsed1 = newDefenseCardsUsed1;

            (uint8 attackBonus2, uint8 attackValue2, uint8 newAttackCardsUsed2) = _checkAndGetCardData(
                stateChanges.battle.attackCardsUsed2,
                uint128((defaultMonster >> 128) & 0x1FFFFFFFFFFFFFFFFFFFFFFFFF),
                _getAvailableCardIndex(
                    stateChanges.battle.attackCardsUsed2,
                    uint128((defaultMonster >> 128) & 0x1FFFFFFFFFFFFFFFFFFFFFFFFF)
                )
            );
            stateChanges.battle.attackCardsUsed2 = newAttackCardsUsed2;

            if (attackBonus2 > defenseBonus1) {
                uint8 damage = defenseValue1 > attackValue2 ? 0 : attackValue2 - defenseValue1;
                uint8 hp = stateChanges.newHP;
                if (damage >= hp) {
                    // YOU ARE DEAD // TODO
                    hp = 0;
                } else {
                    hp -= damage;
                }
                stateChanges.newHP = hp;

                // console.log("monster inflict %i damage", damage);
            }
        }

        if (stateChanges.monsters[monsterIndex].hp == 0) {
            stateChanges.battle.monsterIndexPlus1 = 0; // battle end // TODO loot
            // we do not reset the player cards
            // stateChanges.battle.attackCardsUsed1 = 0;
            // stateChanges.battle.defenseCardsUsed1 = 0;
            stateChanges.battle.attackCardsUsed2 = 0;
            stateChanges.battle.defenseCardsUsed2 = 0;
            stateChanges.newXP += 2;

            (int32 x, int32 y) = PositionUtils.toXY(stateChanges.newPosition);
            // TODO randomize like in initialState
            int32 rand_x = x + 5;
            int32 rand_y = y + 5;
            if (
                // TODO find another if there ,  hmm, ?
                isTakenByOtherMonster(stateChanges.monsters, rand_x, rand_y) == type(uint256).max
            ) {
                stateChanges.monsters[monsterIndex].hp = 4; // TODO
                stateChanges.monsters[monsterIndex].x = rand_x;
                stateChanges.monsters[monsterIndex].y = rand_y;
            }
        }
    }

    function _getAvailableCardIndex(uint8 cardsUsed, uint128 gear) internal pure returns (uint8 cardIndex) {
        uint8 numCards = uint8(gear >> 98);
        if (cardsUsed == 0 || cardsUsed == (2 ** numCards) - 1) {
            return 0;
        }
        for (uint8 i = 0; i < numCards; i++) {
            if ((cardsUsed & (1 << i)) == 0) {
                return i;
            }
        }
    }

    function _checkAndGetCardData(
        uint8 cardsUsed,
        uint128 gear,
        uint8 cardIndex
    ) internal pure returns (uint8 bonus, uint8 value, uint8 newCardsUsed) {
        _checkCard(cardsUsed, gear, cardIndex);
        return _getCardData(cardsUsed, gear, cardIndex);
    }

    function _checkCard(uint8 cardsUsed, uint128 gear, uint8 cardIndex) internal pure {
        uint8 numCards = uint8(gear >> 98);
        if (cardIndex >= numCards) {
            revert InvalidMove(Reason.InvalidCard);
        }
        if (!(cardsUsed == 2 ** numCards - 1 || cardsUsed & (2 ** cardIndex) == 0)) {
            revert InvalidMove(Reason.CardAlreadyUsed);
        }
    }

    function _getCardData(
        uint8 cardsUsed,
        uint128 gear,
        uint8 cardIndex
    ) internal pure returns (uint8 bonus, uint8 value, uint8 newCardsUsed) {
        bonus = uint8((gear >> (98 - 7 - cardIndex * 14)) & 0x7F);
        value = uint8((gear >> (98 - 14 - cardIndex * 14)) & 0x7F);
        newCardsUsed = cardsUsed | (uint8(2) ** cardIndex);
    }

    function isTakenByOtherMonster(
        Monster[5] memory monsters,
        int32 x,
        int32 y
    ) internal pure returns (uint256 monsterIndex) {
        for (uint256 i = 0; i < 5; i++) {
            if (monsters[i].x == x && monsters[i].y == y && monsters[i].hp > 0) {
                return i;
            }
        }
        return type(uint256).max;
    }

    function _apply(Game.Store storage store, StateChanges memory stateChanges) internal {
        store.characterStates[stateChanges.characterID].position = stateChanges.newPosition;
        store.commitments[stateChanges.characterID].epoch = stateChanges.epoch;
    }
}
