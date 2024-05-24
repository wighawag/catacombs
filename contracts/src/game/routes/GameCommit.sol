// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "../Game.sol";
import "../GameUtils.sol";

contract GameCommit is Game {
    using GameUtils for Config;

    struct Context {
        uint256 characterID;
        address controller;
        uint24 epoch;
        bytes24 commitmentHash;
    }

    struct StateChanges {
        uint256 characterID;
        uint24 epoch;
        bytes24 commitmentHash;
    }

    function commit(uint256 characterID, bytes24 commitmentHash, address payable payee) external payable {
        Game.Store storage store = getStore();

        Context memory context = _context(store, characterID, commitmentHash);
        StateChanges memory stateChanges = _stateChanges(context);
        _apply(store, stateChanges);
        emit Game.CommitmentMade(context.characterID, context.controller, context.epoch, context.commitmentHash);

        // extra steps for which we do not intend to track via events
        if (payee != address(0) && msg.value != 0) {
            payee.transfer(msg.value);
        }
    }

    function _context(
        Game.Store storage store,
        uint256 characterID,
        bytes24 commitmentHash
    ) internal view returns (Context memory context) {
        Game.Config memory config = getConfig();
        mapping(address => Game.ControllerType) storage isController = store.characterStates[characterID].controllers;
        if (isController[msg.sender] == Game.ControllerType.None) {
            revert Game.NotAuthorizedController(msg.sender);
        }
        context.characterID = characterID;
        context.controller = msg.sender;
        (context.epoch, ) = config.getEpoch();
        context.commitmentHash = commitmentHash;
    }

    function _stateChanges(Context memory context) public pure returns (StateChanges memory stateChanges) {
        stateChanges.characterID = context.characterID;
        stateChanges.epoch = context.epoch;
        stateChanges.commitmentHash = context.commitmentHash;
    }

    function _apply(Game.Store storage store, StateChanges memory stateChanges) internal {
        store.commitments[stateChanges.characterID] = Game.Commitment({
            hash: stateChanges.commitmentHash,
            epoch: stateChanges.epoch
        });
    }
}
