// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library Math {
    function abs(int32 x) internal pure returns (uint32) {
        return x >= 0 ? uint32(x) : uint32(-x);
    }
}
