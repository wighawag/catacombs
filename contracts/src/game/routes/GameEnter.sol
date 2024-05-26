// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "../Game.sol";
import "../GameUtils.sol";
import "../../solidity-kit/solc_0_8/ERC721/interfaces/IERC721Receiver.sol";
import "hardhat/console.sol";

contract GameEnter is Game, IERC721Receiver {
    using GameUtils for Config;

    struct Context {
        uint256 characterID;
        address sender;
    }

    struct StateChanges {
        uint256 characterID;
        uint64 position;
        address controller;
    }

    // function mintAndEnter() external {

    // }

    function enter(uint256 characterID, address payable payee) external payable {
        Game.Config memory config = getConfig();

        _enter(msg.sender, characterID);

        // transfer Character to the game
        config.characters.transferFrom(msg.sender, address(this), characterID);

        // extra steps for which we do not intend to track via events
        if (payee != address(0) && msg.value != 0) {
            payee.transfer(msg.value);
        }
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenID,
        bytes calldata
    ) external override returns (bytes4) {
        Game.Config memory config = getConfig();
        console.log("onERC721Received");

        if (msg.sender == address(config.characters)) {
            _enter(from == address(0) ? operator : from, tokenID);
        } else {
            revert OnlyCharactersAreAccepted();
        }
        return IERC721Receiver.onERC721Received.selector;
    }

    function _enter(address sender, uint256 characterID) internal {
        Game.Store storage store = getStore();
        Context memory context = _context(sender, characterID);
        StateChanges memory stateChanges = _stateChanges(context);
        _apply(store, stateChanges);
        console.log("EnteredTheGame", context.characterID, stateChanges.controller, stateChanges.position);
        emit EnteredTheGame(context.characterID, stateChanges.controller, stateChanges.position);
    }

    function _context(address sender, uint256 characterID) internal pure returns (Context memory context) {
        context.sender = sender;
        context.characterID = characterID;
    }

    function _stateChanges(Context memory context) public pure returns (StateChanges memory stateChanges) {
        return StateChanges({characterID: context.characterID, position: 0, controller: context.sender});
    }

    function _apply(Game.Store storage store, StateChanges memory stateChanges) internal {
        store.characterStates[stateChanges.characterID].controllers[stateChanges.controller];
        store.characterStates[stateChanges.characterID].position = stateChanges.position;
    }
}
