// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "./Game.sol";
import "../solidity-kit/solc_0_8/ERC721/interfaces/IERC721.sol";

abstract contract Game {
    // we use constant to bound gas and allow solidity to calulate worst case scenario
    uint256 constant MAX_PATH_LENGTH = 256;

    /// @notice happen when an unauthorized account attempt to control a character
    error NotAuthorizedController(address sender);

    /// @notice happen when attempting to leave the game from a non-exit position
    error UnableToExitFromThisPosition(uint64 position);

    /// @notice happen when attempting to do something on a game that did not start yet
    error GameNotStarted();

    /// @notice A character has commited to make a move and reveal it on the reveal phase
    /// @param characterID the id of the NFT being played
    /// @param controller account handling the character moves
    /// @param epoch epoch number on which this commit belongs to
    /// @param commitmentHash the hash of moves
    event CommitmentMade(
        uint256 indexed characterID,
        address indexed controller,
        uint24 indexed epoch,
        bytes24 commitmentHash
    );

    /// @notice A character has its moves revealed and executed
    /// @param characterID the id of the NFT being played
    /// @param controller account handling the character moves
    /// @param epoch epoch number on which this commit belongs to
    /// @param actions the list of moves made
    /// @param newPosition the resulting new character's position
    event MoveRevealed(
        uint256 indexed characterID,
        address indexed controller,
        uint24 indexed epoch,
        Action[] actions,
        uint64 newPosition
    );

    /// @notice A character has commited to make a move and reveal it on the reveal phase
    /// @param characterID the id of the NFT being played
    /// @param controller account handling the character moves
    /// @param newPosition the resulting new character's position
    event EnteredTheGame(uint256 indexed characterID, address indexed controller, uint64 newPosition);

    /// @notice A character has commited to make a move and reveal it on the reveal phase
    /// @param characterID the id of the NFT being played
    /// @param controller account handling the character moves
    /// @param positionWhenLeaving the character's position when leaving
    event LeftTheGame(uint256 indexed characterID, address indexed controller, uint64 positionWhenLeaving);

    struct Commitment {
        bytes24 hash;
        uint24 epoch;
    }

    /// @notice Move struct that define the action, type and position
    struct Action {
        uint64 position;
        uint192 action; // TODO define: none, open, attack cards, etc...
    }

    enum ControllerType {
        None,
        Basic,
        Owner
    }

    struct CharacterState {
        mapping(address => ControllerType) controllers;
        uint64 position;
        uint64 epoch;
    }

    struct Store {
        mapping(uint256 => Commitment) commitments;
        mapping(uint256 => CharacterState) characterStates;
    }

    /// @notice Config struct to configure the game instance
    struct Config {
        uint256 startTime;
        uint256 commitPhaseDuration;
        uint256 revealPhaseDuration;
        IERC721 characters;
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
