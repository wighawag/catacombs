// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "./Game.sol";
import "../utils/PositionUtils.sol";

library GameUtils {
    function getEpoch(Game.Config memory config) internal view returns (uint24 epoch, bool commiting) {
        uint256 epochDuration = config.commitPhaseDuration + config.revealPhaseDuration;
        uint256 time = block.timestamp; // TODO_timestamp();
        if (time < config.startTime) {
            revert Game.GameNotStarted();
        }
        uint256 timePassed = time - config.startTime;
        epoch = uint24(timePassed / epochDuration + 2); // epoch start at 2, this make the hypothetical previous reveal phase's epoch to be 1
        commiting = timePassed - ((epoch - 2) * epochDuration) < config.commitPhaseDuration;
    }

    function computeArea(bytes32 areaHash) public pure returns (Game.Area memory) {
        // "made only for 11x11"
        assert(PositionUtils.AREA_SIZE == 11);
        return
            Game.Area({
                /*
11111011111
00000000000
00000000000
00000000000
00000000000
00000000000
00000000000
00000000000
00000000000
00000000000
11111110111
                */
                southWalls: 0x1F7C0000000000000000000000007F7 << 7,
                /*
10000000001
10000000001
00000000001
10000000001
10000000001
10000000001
10000000000
10000000001
10000000001
10000000001
10000000001
                */
                eastWalls: 0x10060080180300600C0080300600C01 << 7
            });
    }

    function areaAt(int32 x, int32 y) internal pure returns (Game.Area memory area) {
        // TODO
        area = computeArea(0x0000000000000000000000000000000000000000000000000000000000000000);
    }

    function wallAt(uint128 walls, int32 x, int32 y) internal pure returns (bool) {
        uint8 xx = PositionUtils.areaLocalCoord(x);
        uint8 yy = PositionUtils.areaLocalCoord(y);
        uint8 i = yy * uint8(int8(PositionUtils.AREA_SIZE)) + xx;
        return ((walls >> (2 ** i)) & 0x1) == 1;
    }

    function isValidMove(int32 x, int32 y, int32 nextX, int32 nextY) internal pure returns (bool valid) {
        if (nextX == x) {
            if ((nextY == y + 1)) {
                // TODO cache area, detect area change and update accordingly
                Game.Area memory area = areaAt(x, y);
                return !wallAt(area.southWalls, x, y);
            } else if (nextY == y - 1) {
                Game.Area memory area = areaAt(nextX, nextY);
                return !wallAt(area.southWalls, nextX, nextY);
            } else {
                return false;
            }
        } else if (nextY == y) {
            if ((nextX == x + 1)) {
                Game.Area memory area = areaAt(x, y);
                return !wallAt(area.southWalls, x, y);
            } else if (nextX == x - 1) {
                Game.Area memory area = areaAt(nextX, nextY);
                return !wallAt(area.southWalls, nextX, nextY);
            } else {
                return false;
            }
        }
    }
}
