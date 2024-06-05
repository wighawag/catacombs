// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "../Game.sol";
import "../GameUtils.sol";
import "../../utils/PositionUtils.sol";
import "../../solidity-kit/solc_0_8/utils/Math.sol";

contract GameReveal is Game {
    using GameUtils for Config;

    struct Context {
        uint256 characterID;
        uint64 priorPosition;
        address controller;
        uint24 epoch;
        Game.Action[] actions;
        bytes32 secret;
    }

    struct Monster {
        int32 x;
        int32 y;
        uint8 life;
    }

    struct StateChanges {
        uint256 characterID;
        uint64 newPosition;
        uint24 epoch;
        Monster[5] monsters;
    }

    function reveal(uint256 characterID, Game.Action[] calldata actions, bytes32 secret) external {
        Game.Store storage store = getStore();
        Context memory context = _context(store, characterID, actions, secret);
        StateChanges memory stateChanges = computeStateChanges(context, false);
        _apply(store, stateChanges);
        emit MoveRevealed(
            context.characterID,
            context.controller,
            context.epoch,
            context.actions,
            stateChanges.newPosition
        );
    }

    function computeStateChanges(
        Context memory context,
        bool revetOnInvalidMoves
    ) public pure returns (StateChanges memory stateChanges) {
        stateChanges = initialStateChanges(context);
        for (uint256 i = 0; i < context.actions.length; i++) {
            _step(stateChanges, context.actions[i], revetOnInvalidMoves);
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
        monsters[0] = Monster({x: x - 2, y: y + 5, life: 3});
        monsters[1] = Monster({x: x - 5, y: y - 3, life: 3});
        monsters[2] = Monster({x: x + 5, y: y + 2, life: 3});
        monsters[3] = Monster({x: x + 6, y: y - 5, life: 3});
        monsters[4] = Monster({x: x + 4, y: y + 8, life: 3});
        stateChanges.monsters = monsters;
        stateChanges.newPosition = position;
    }

    /// @notice allow to step through each action and predict the outcome in turnn
    function stepChanges(
        StateChanges memory stateChanges,
        Game.Action memory action,
        bool revetOnInvalidMoves
    ) external pure returns (StateChanges memory) {
        _step(stateChanges, action, revetOnInvalidMoves);
        // as external function, it will always return a copy
        return stateChanges;
    }

    function _context(
        Game.Store storage store,
        uint256 characterID,
        Game.Action[] calldata actions,
        bytes32 secret
    ) internal view returns (Context memory context) {
        Config memory config = getConfig();
        // TODO check secret
        context.characterID = characterID;
        context.priorPosition = store.characterStates[characterID].position;
        (context.epoch, ) = config.getEpoch();
        context.actions = actions;
        context.secret = secret;
    }

    function _step(
        StateChanges memory stateChanges,
        Game.Action memory action,
        bool revetOnInvalidMoves
    ) internal pure {
        uint64 position = stateChanges.newPosition;
        (int32 x, int32 y) = PositionUtils.toXY(position);
        uint64 next = action.position;
        (int32 nextX, int32 nextY) = PositionUtils.toXY(next);
        Monster[5] memory monsters = stateChanges.monsters;
        Reason invalidMove = GameUtils.isValidMove(x, y, nextX, nextY);
        if (invalidMove == Reason.None) {
            bool attacked;
            for (uint256 e = 0; e < 5; e++) {
                if (monsters[e].life > 0 && monsters[e].x == nextX && monsters[e].y == nextY) {
                    attacked = true;
                    monsters[e].life -= 1;
                }
            }
            if (!attacked) {
                position = next;
            }
        } else {
            if (revetOnInvalidMoves) {
                revert InvalidMove(invalidMove);
            }
        }
        (x, y) = PositionUtils.toXY(position);
        for (uint256 e = 0; e < 5; e++) {
            Monster memory monster = monsters[e];
            if (monster.life > 0) {
                int32 m_nextX = monster.x;
                int32 m_nextY = monster.y;
                int32 xDiff = x - monster.x;
                int32 yDiff = y - monster.y;

                if (Math.abs(xDiff) > Math.abs(yDiff)) {
                    m_nextX += (xDiff > int32(0) ? int32(1) : int32(-1));
                    if (
                        GameUtils.isValidMove(monster.x, monster.y, m_nextX, m_nextY) != Reason.None ||
                        isTakenByOtherMonster(monsters, m_nextX, m_nextY)
                    ) {
                        m_nextY += (yDiff > int32(0) ? int32(1) : int32(-1));
                        m_nextX = monster.x;
                        if (
                            GameUtils.isValidMove(monster.x, monster.y, m_nextX, m_nextY) != Reason.None ||
                            isTakenByOtherMonster(monsters, m_nextX, m_nextY)
                        ) {
                            m_nextY = monster.y;
                        }
                    }
                } else {
                    m_nextY += (yDiff > int32(0) ? int32(1) : int32(-1));
                    if (
                        GameUtils.isValidMove(monster.x, monster.y, m_nextX, m_nextY) != Reason.None ||
                        isTakenByOtherMonster(monsters, m_nextX, m_nextY)
                    ) {
                        m_nextX += (xDiff > int32(0) ? int32(1) : int32(-1));
                        m_nextY = monster.y;
                        if (
                            GameUtils.isValidMove(monster.x, monster.y, m_nextX, m_nextY) != Reason.None ||
                            isTakenByOtherMonster(monsters, m_nextX, m_nextY)
                        ) {
                            m_nextX = monster.x;
                        }
                    }
                }
                // TODO walls
                if (m_nextX == x && m_nextY == y) {
                    // Player life ---
                } else {
                    monster.x = m_nextX;
                    monster.y = m_nextY;
                }
            }
        }
        stateChanges.newPosition = position;
    }

    function isTakenByOtherMonster(Monster[5] memory monsters, int32 x, int32 y) internal pure returns (bool) {
        for (uint256 i = 0; i < 5; i++) {
            if (monsters[i].x == x && monsters[i].y == y && monsters[i].life > 0) {
                return true;
            }
        }
        return false;
    }

    function _apply(Game.Store storage store, StateChanges memory stateChanges) internal {
        store.characterStates[stateChanges.characterID].position = stateChanges.newPosition;
        store.commitments[stateChanges.characterID].epoch = stateChanges.epoch;
    }
}
