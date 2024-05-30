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
        if (uint256(areaHash) % 2 == 0) {
            return
                Game.Area({
                    /*
00000000000
00000000000
00000000000
00000111011
11110000000
01101000000
00000000000
00000001111
00000000000
10000000000
11111110111
                */
                    southWalls: 0x77E01A000001E002007F7 << 7,
                    /*
00011000001
00011000001
00000000001
00011000001
00010010001
00000010001
10001010000
10001010001
10001000001
00001000001
00001000001
                */
                    eastWalls: 0x3046080118224408C508A310420841 << 7
                });
        } else {
            return
                Game.Area({
                    /*
00000000000
11011100000
00000000000
00000000000
00000011110
11011110000
00011110000
00111111101
00000000000
00000000000
11111110111
                */
                    southWalls: 0x37000000007B780F03FA000007F7 << 7, // TODO inject from outside data file so it can be shared with frontend
                    /*
00000100011
00000100011
00000000011
00000100011
00000100011
00000101001
01000000001
01000001000
00000100001
00000100001
00000100001
                */
                    eastWalls: 0x8C1180304608C14A0141008410821 << 7 // TODO inject from outside data file so it can be shared with frontend
                });
        }
    }

    function areaAt(int32 x, int32 y) public pure returns (Game.Area memory area) {
        // TODO
        area = computeArea(keccak256(abi.encodePacked(x, y)));
    }

    function wallAt(uint128 walls, int32 x, int32 y) internal pure returns (bool) {
        uint8 xx = PositionUtils.areaLocalCoord(x);
        uint8 yy = PositionUtils.areaLocalCoord(y);
        uint8 i = yy * uint8(int8(PositionUtils.AREA_SIZE)) + xx;
        return ((walls >> (2 ** i)) & 0x1) == 1;
    }

    function isValidMove(int32 x, int32 y, int32 nextX, int32 nextY) internal pure returns (Game.Reason reason) {
        if (nextX == x) {
            if ((nextY == y + 1)) {
                // TODO cache area, detect area change and update accordingly
                Game.Area memory area = areaAt(x, y);
                if (wallAt(area.southWalls, x, y)) {
                    return Game.Reason.Wall;
                } else {
                    return Game.Reason.None;
                }
            } else if (nextY == y - 1) {
                Game.Area memory area = areaAt(nextX, nextY);
                if (wallAt(area.southWalls, nextX, nextY)) {
                    return Game.Reason.Wall;
                } else {
                    return Game.Reason.None;
                }
            } else {
                return Game.Reason.NonAdjacent;
            }
        } else if (nextY == y) {
            if ((nextX == x + 1)) {
                Game.Area memory area = areaAt(x, y);
                if (wallAt(area.southWalls, x, y)) {
                    return Game.Reason.Wall;
                } else {
                    return Game.Reason.None;
                }
            } else if (nextX == x - 1) {
                Game.Area memory area = areaAt(nextX, nextY);
                if (wallAt(area.southWalls, nextX, nextY)) {
                    return Game.Reason.Wall;
                } else {
                    return Game.Reason.None;
                }
            } else {
                return Game.Reason.NonAdjacent;
            }
        }
        return Game.Reason.NonAdjacent;
    }
}
