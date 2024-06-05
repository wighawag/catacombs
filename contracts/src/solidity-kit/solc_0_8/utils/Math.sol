// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library Math {
    function abs(int32 x) internal pure returns (int32) {
        return x >= 0 ? x : -x;
    }
}
