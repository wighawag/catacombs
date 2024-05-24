// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "../Game.sol";

contract GameController is Game {
    struct Context {
        uint256 avatarID;
        address sender;
    }

    struct StateChanges {
        uint256 avatarID; //key
        address controller;
    }

    function join(uint256 avatarID) external {
        Game.Store storage store = getStore();
        // 4 steps

        // 1. gather context (will be emitted)
        Context memory context = Context({avatarID: avatarID, sender: msg.sender});
        // 2. compute state changes from context (pure function)
        StateChanges memory stateChanges = _stateChanges(context);
        // 3. apply state changes (zero computation)
        _apply(store, stateChanges);
        // 4. emit event
        emit Game.Joined(context.avatarID, context.sender);
    }

    function _stateChanges(Context memory context) public pure returns (StateChanges memory stateChanges) {
        return StateChanges({avatarID: context.avatarID, controller: context.sender});
    }

    function _apply(Game.Store storage store, StateChanges memory stateChanges) internal {
        // TODO allow to set Basic for local key
        store.avatars[stateChanges.avatarID].controllers[stateChanges.controller] = Game.ControllerType.Owner;
    }
}
