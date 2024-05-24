// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "../Game.sol";
import "../GameUtils.sol";

contract GameEnter is Game {
    using GameUtils for Config;

    struct Context {
        uint256 characterID;
        uint64 position;
        address controller;
    }

    struct StateChanges {
        uint64 position;
    }

    function enter(uint256 characterID, address payable payee) external payable {
        Game.Store storage store = getStore();
        Game.Config memory config = getConfig();

        Context memory context = _context(characterID);
        StateChanges memory stateChanges = _stateChanges(context);
        _apply(store, context, stateChanges);
        emit EnteredTheGame(context.characterID, context.controller, stateChanges.position);

        // transfer Character to the game
        config.characters.transferFrom(msg.sender, address(this), characterID);

        // extra steps for which we do not intend to track via events
        if (payee != address(0) && msg.value != 0) {
            payee.transfer(msg.value);
        }
    }

    function _context(uint256 characterID) internal view returns (Context memory context) {
        context.controller = msg.sender;
        context.characterID = characterID;
        context.position = 0;
    }

    function _stateChanges(Context memory context) public pure returns (StateChanges memory stateChanges) {
        return StateChanges({position: context.position});
    }

    function _apply(Game.Store storage store, Context memory context, StateChanges memory stateChanges) internal {
        store.characterStates[context.characterID].controllers[context.controller];
        store.characterStates[context.characterID].position = stateChanges.position;
    }
}
