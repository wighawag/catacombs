// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "../Game.sol";
import "../GameUtils.sol";
import "../../utils/PositionUtils.sol";

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
        StateChanges memory stateChanges = computeStateChanges(context);
        _apply(store, stateChanges);
        emit MoveRevealed(
            context.characterID,
            context.controller,
            context.epoch,
            context.actions,
            stateChanges.newPosition
        );
    }

    function step(
        Context memory context,
        StateChanges memory stateChanges,
        Game.Action memory action
    ) external pure returns (StateChanges memory) {
        _step(context, stateChanges, action);
        // TODO test if solidity create a copy
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

    function _step(Context memory context, StateChanges memory stateChanges, Game.Action memory action) internal pure {
        uint64 position = context.priorPosition;
        (int32 x, int32 y) = PositionUtils.toXY(position);
        uint64 next = action.position;
        (int32 nextX, int32 nextY) = PositionUtils.toXY(next);
        Monster[5] memory monsters = stateChanges.monsters;
        if (GameUtils.isValidMove(x, y, nextX, nextY)) {
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
            // TODO should we throw ? or just ignore like now
        }
        (x, y) = PositionUtils.toXY(position);
        for (uint256 e = 0; e < 5; e++) {
            Monster memory monster = monsters[e];
            // TODO prevent monster to share space
            if (monster.life > 0) {
                int32 m_nextX = monster.x;
                int32 m_nextY = monster.y;
                int32 xDiff = x - monster.x;
                int32 yDiff = y - monster.y;
                if (xDiff > yDiff) {
                    m_nextX -= (xDiff / -xDiff);
                } else {
                    m_nextY -= (yDiff / -yDiff);
                }
                if (m_nextX == x && nextY == y) {
                    // Player life ---
                } else {
                    monster.x = m_nextX;
                    monster.y = m_nextY;
                }
            }
        }
        stateChanges.newPosition = position;
    }

    function computeStateChanges(Context memory context) public pure returns (StateChanges memory stateChanges) {
        uint64 position = context.priorPosition;
        (int32 x, int32 y) = PositionUtils.toXY(position);
        Monster[5] memory monsters;
        // TODO randomize
        monsters[0] = Monster({x: x + 2, y: y + 5, life: 3});
        monsters[1] = Monster({x: x + 5, y: y + 5, life: 3});
        monsters[2] = Monster({x: x + 7, y: y + 2, life: 3});
        monsters[3] = Monster({x: x + 9, y: y + 5, life: 3});
        monsters[4] = Monster({x: x + 4, y: y + 10, life: 3});
        stateChanges.monsters = monsters;
        for (uint256 i = 0; i < MAX_PATH_LENGTH; i++) {
            _step(context, stateChanges, context.actions[i]);
        }
    }

    function _apply(Game.Store storage store, StateChanges memory stateChanges) internal {
        store.characterStates[stateChanges.characterID].position = stateChanges.newPosition;
        store.commitments[stateChanges.characterID].epoch = stateChanges.epoch;
    }
}
