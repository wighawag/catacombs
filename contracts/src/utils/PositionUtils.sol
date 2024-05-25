// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.0;

library PositionUtils {
    int32 constant AREA_SIZE = 11;
    int32 constant AREA_OFFSET = 5;

    function areaCoord(int32 a) internal pure returns (int32 b) {
        if (a >= 0) {
            b = (a + AREA_OFFSET) / AREA_SIZE;
        } else {
            b = -((-a + AREA_OFFSET) / AREA_SIZE);
        }
    }

    function areaWorldPoint(int32 areaC) internal pure returns (int32 worldCoord) {
        return areaC * AREA_SIZE - AREA_OFFSET;
    }

    function areaLocalCoord(int32 x) internal pure returns (uint8 index) {
        return uint8(uint32(x - (areaCoord(x) * AREA_SIZE - AREA_OFFSET)));
    }

    function area(int32 x, int32 y) internal pure returns (int32 areaX, int32 areaY) {
        areaX = areaCoord(x);
        areaY = areaCoord(y);
    }

    function toXY(uint64 position) internal pure returns (int32 x, int32 y) {
        x = int32(uint32(position) & 0xFFFFFFFF);
        y = int32(uint32(position >> 32));
    }

    function offset(uint64 position, int32 x, int32 y) internal pure returns (uint64 newPosition) {
        x = int32(uint32(position) & 0xFFFFFFFF) + x;
        y = int32(uint32(position >> 32)) + y;
        newPosition = (uint64(uint32(y)) << 32) + uint64(uint32(x));
    }
}
