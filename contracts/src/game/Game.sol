// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "./Game.sol";

abstract contract Game {
    enum ControllerType {
        None,
        Basic,
        Owner
    }

    /// @notice happen when an unauthrozed account attempt to controller a character
    error NotAuthorizedController(address sender);

    error GameNotStarted();

    /// @notice A character has commited to make a move and reveal it on the reveal phase
    /// @param avatarID the id of the NFT being played
    /// @param controller account handling the character moves
    /// @param epoch epoch number on which this commit belongs to
    /// @param commitmentHash the hash of moves
    event CommitmentMade(
        uint256 indexed avatarID,
        address indexed controller,
        uint24 indexed epoch,
        bytes24 commitmentHash
    );

    /// @notice A character has commited to make a move and reveal it on the reveal phase
    /// @param avatarID the id of the NFT being played
    /// @param controller account handling the character moves
    event Joined(uint256 indexed avatarID, address indexed controller);

    struct Commitment {
        bytes24 hash;
        uint24 epoch;
    }

    /// @notice The set of possible action
    enum ActionType {
        None,
        Bomb
    }

    /// @notice Move struct that define the action, type and position
    struct Action {
        uint64[] path; // we use position instead of delta so we can add teleport or other path mechanisms
        ActionType actionType;
    }

    struct Avatar {
        mapping(address => ControllerType) controllers;
        uint64 position;
        uint64 epoch;
        uint8 bombs;
    }

    struct CellAtEpoch {
        bool exploded;
    }

    struct Store {
        mapping(uint256 => Commitment) commitments;
        mapping(uint256 => Avatar) avatars;
        mapping(uint64 => mapping(uint64 => CellAtEpoch)) cells; // position => epoch => CellAEpoch
    }

    /// @notice Config struct to configure the game instance
    struct Config {
        uint256 startTime;
        uint256 commitPhaseDuration;
        uint256 revealPhaseDuration;
    }

    function getStore() internal pure returns (Store storage store) {
        assembly {
            store.slot := 0
        }
    }

    function getConfig() internal pure returns (Config memory config) {
        uint256 offset = _getImmutableArgsOffset();
        config = abi.decode(msg.data[offset:], (Config));
    }

    /// @return offset The offset of the packed immutable args in calldata
    function _getImmutableArgsOffset() internal pure returns (uint256 offset) {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            offset := sub(calldatasize(), add(shr(240, calldataload(sub(calldatasize(), 2))), 2))
        }
    }
}
