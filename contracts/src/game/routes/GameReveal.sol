// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "../Game.sol";
import "../GameUtils.sol";
import "../../utils/PositionUtils.sol";

contract GameReveal is Game {
    using GameUtils for Config;

    struct Context {
        uint256 avatarID;
        uint64 priorPosition;
        address controller;
        uint64 epoch;
        Game.Action[] actions;
        bytes32 secret;
    }

    struct StateChanges {
        uint64 epoch;
        uint64[] explodedCells;
        uint64 newAvatarPosition;
    }

    function reveal(uint256 avatarID, Game.Action[] calldata actions, bytes32 secret) external {
        Game.Store storage store = getStore();
        // 4 steps

        // 1. gather context (will be emitted)
        Context memory context = _context(store, avatarID, actions, secret);
        // 2. compute state changes from context (pure function)
        StateChanges memory stateChanges = _stateChanges(context);
        // 3. apply state changes (zero computation)
        _apply(store, stateChanges);
        // 4. emit event
        // TODO emit Reveal
    }

    function _context(
        Game.Store storage store,
        uint256 avatarID,
        Game.Action[] calldata actions,
        bytes32 secret
    ) internal view returns (Context memory context) {
        Config memory config = getConfig();
        // TODO check secret
        context.avatarID = avatarID;
        context.priorPosition = store.avatars[avatarID].position;
        (context.epoch, ) = config.getEpoch();
        context.actions = actions;
        context.secret = secret;
    }

    function _stateChanges(Context memory context) public pure returns (StateChanges memory stateChanges) {
        uint256 maxLength = 8; // TODO make bomb line length depends on power-ups
        uint256 count = 0;
        stateChanges.explodedCells = new uint64[](maxLength * context.actions.length);
        uint64 position = context.priorPosition;
        for (uint256 i = 0; i < context.actions.length; i++) {
            uint64[] memory path = context.actions[i].path;
            for (uint256 j = 0; j < path.length; j++) {
                uint64 next = path[j];
                if (_isValidMove(position, next)) {
                    position = next;
                }
                if (context.actions[i].actionType == Game.ActionType.Bomb) {
                    int8 length = int8(int256(maxLength));
                    // TODO optimize by making cell 1 bit and pack them in 256 bits
                    // this allow to represent 16x16 per slot
                    for (int8 k = -length / 2; k < length / 2; k++) {
                        uint64 explosionPos = PositionUtils.offset(position, k, 0);
                        stateChanges.explodedCells[count++] = explosionPos;
                    }
                    for (int8 k = -length / 2; k < length / 2; k++) {
                        uint64 explosionPos = PositionUtils.offset(position, 0, k);
                        stateChanges.explodedCells[count++] = explosionPos;
                    }
                }
            }
        }
        stateChanges.newAvatarPosition = position;
        stateChanges.epoch = context.epoch;
    }

    function _apply(Game.Store storage store, StateChanges memory stateChanges) internal {
        for (uint256 i = 0; i < stateChanges.explodedCells.length; i++) {
            uint64 pos = stateChanges.explodedCells[i];
            if (!store.cells[pos][stateChanges.epoch].exploded) {
                store.cells[pos][stateChanges.epoch].exploded = true;
            }
        }
    }

    function _isValidMove(uint64 from, uint64 to) internal pure returns (bool valid) {
        // TODO
        valid = true;
    }
}
