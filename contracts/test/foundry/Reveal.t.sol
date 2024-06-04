// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "src/game/Game.sol";
import "src/game/routes/GameReveal.sol";

contract RevealTest is Test {
    uint256 testNumber;
    GameReveal revealRoute;

    error GenericError(string str);

    function setUp() public {
        revealRoute = new GameReveal();
    }

    function test_stepReveal() public view {
        Game.Action memory action = Game.Action({position: PositionUtils.toPosition(1, 0), action: 0});
        GameReveal.StateChanges memory initialStateChanges;
        GameReveal.StateChanges memory newStateChanges = revealRoute.stepChanges(initialStateChanges, action, true);
        assertEq(newStateChanges.newPosition, PositionUtils.toPosition(1, 0));
    }

    function test_stepReveal2() public view {
        Game.Action memory action = Game.Action({position: PositionUtils.toPosition(2, 0), action: 0});
        GameReveal.StateChanges memory initialStateChanges;
        initialStateChanges.newPosition = PositionUtils.toPosition(1, 0);
        GameReveal.StateChanges memory newStateChanges = revealRoute.stepChanges(initialStateChanges, action, true);
        assertEq(newStateChanges.newPosition, PositionUtils.toPosition(2, 0));
    }

    function test_area() public view {
        int32 x;
        int32 y;
        x = 1;
        y = 0;
        bytes32 areaHash = keccak256(abi.encodePacked(PositionUtils.areaCoord(x), PositionUtils.areaCoord(y)));

        for (y = 0; y < 5; y++) {
            for (x = 0; x < 5; x++) {
                bytes32 testAreaHash = keccak256(
                    abi.encodePacked(PositionUtils.areaCoord(x), PositionUtils.areaCoord(y))
                );
                if (testAreaHash != areaHash) {
                    revert GenericError("not same hash");
                }
            }
        }

        x = 1;
        y = 0;
        uint8 lx = PositionUtils.areaLocalCoord(x);
        uint8 ly = PositionUtils.areaLocalCoord(y);
        console.log("(%i, %i)", lx, ly);
        uint8 index = ly * uint8(int8(PositionUtils.AREA_SIZE)) + lx;
        console.log("(%i)", index);
        console.log("area num: %i", uint256(areaHash) % 5);
        Game.Area memory area = GameUtils.areaAt(x, y);
        console.log(area.eastWalls);
        console.log("wall: %b", ((area.eastWalls >> (127 - index)) & 0x1) == 1);

        console.log(GameUtils.wallAt(area.eastWalls, x, y));
    }

    function testFail_stepReveal() public view {
        Game.Action memory action = Game.Action({position: PositionUtils.toPosition(0, 0), action: 0});
        GameReveal.StateChanges memory initialStateChanges;
        GameReveal.StateChanges memory newStateChanges = revealRoute.stepChanges(initialStateChanges, action, true);
        assertEq(newStateChanges.newPosition, PositionUtils.toPosition(0, 0));
    }
}
