// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "../solidity-kit/solc_0_8/ERC721/implementations/BasicERC721.sol";

contract Characters is BasicERC721 {
    /// @notice the amount sent is not enough
    /// @param sent amount sent
    /// @param expected amount expected
    error NotEnoughAmountSent(uint256 sent, uint256 expected);

    uint256 immutable _price;
    constructor(uint256 initialPrice) {
        _price = initialPrice;
    }

    function mint(address to, uint96 data) external payable {
        if (msg.value < _price) {
            revert NotEnoughAmountSent(msg.value, _price);
        }
        _safeMint(to, (uint256(uint160(msg.sender)) << 92) | data, false);
    }
}
