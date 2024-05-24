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

    struct StateChanges {
        uint64 newAvatarPosition;
    }

    function reveal(uint256 characterID, Game.Action[] calldata actions, bytes32 secret) external {
        Game.Store storage store = getStore();
        Context memory context = _context(store, characterID, actions, secret);
        StateChanges memory stateChanges = _stateChanges(context);
        _apply(store, context, stateChanges);
        emit MoveRevealed(
            context.characterID,
            context.controller,
            context.epoch,
            context.actions,
            stateChanges.newAvatarPosition
        );
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

    function _stateChanges(Context memory context) public pure returns (StateChanges memory stateChanges) {
        uint64 position = context.priorPosition;
        Game.Action[] memory actions = context.actions;
        for (uint256 i = 0; i < MAX_PATH_LENGTH; i++) {
            uint64 next = actions[i].position;
            if (_isValidMove(position, next)) {
                position = next;
            }
        }
        stateChanges.newAvatarPosition = position;
    }

    function _apply(Game.Store storage store, Context memory context, StateChanges memory stateChanges) internal {
        store.characterStates[context.characterID].position = stateChanges.newAvatarPosition;
    }

    function _isValidMove(uint64 from, uint64 to) internal pure returns (bool valid) {
        // TODO
        valid = true;
    }
}
