// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "../solidity-kit/solc_0_8/ERC721/implementations/BasicERC721.sol";

contract Characters is BasicERC721 {
    function mint(address to, uint96 data) external {
        _safeMint(to, (uint256(uint160(to)) << 92) | data);
    }
}
