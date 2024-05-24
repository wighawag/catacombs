// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "../Game.sol";
import "../GameUtils.sol";

contract GameLeave is Game {
    using GameUtils for Config;

    struct Context {
        uint256 characterID;
        uint64 position;
        address controller;
    }

    function leave(uint256 characterID, address to) external {
        Game.Store storage store = getStore();
        Game.Config memory config = getConfig();

        Context memory context = _context(store, characterID);
        if (context.position != 0) {
            revert UnableToExitFromThisPosition(context.position);
        }

        emit LeftTheGame(context.characterID, context.controller, context.position);

        // transfer Character back to the player
        config.characters.safeTransferFrom(address(this), to, characterID);
    }

    function _context(Game.Store storage store, uint256 characterID) internal view returns (Context memory context) {
        mapping(address => Game.ControllerType) storage isController = store.characterStates[characterID].controllers;
        if (isController[msg.sender] == Game.ControllerType.None) {
            revert Game.NotAuthorizedController(msg.sender);
        }
        context.controller = msg.sender;
        context.characterID = characterID;
        context.position = store.characterStates[characterID].position;
    }
}
