// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "../../solidity-kit/solc_0_8/ERC721/implementations/BasicERC721.sol";

import "../../solidity-kit/solc_0_8/ERC721/interfaces/IERC721.sol";

/***
 * Wrap the control of character when they are owned by the Game
 * Allow player to transfer whil they still abode by the rule of the game
 */
contract InGameCharacters is BasicERC721 {
    IERC721 public immutable _originalCharacters;

    constructor(IERC721 originalCharacters) {
        _originalCharacters = originalCharacters;
    }

    function enterGame(address owner, uint256 characterID) external {
        _originalCharacters.transferFrom(msg.sender, address(this), characterID);
        _safeMint(owner, characterID);
    }

    function leaveGame(address to, uint256 characterID) external {
        // TODO controlled by game
        _originalCharacters.transferFrom(address(this), to, characterID);
        _burn(characterID);
    }
}
