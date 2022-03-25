// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VariablePacking_1 {
    uint8 var1 = 1;
    uint256 var2 = 1;
    uint8 var3 = 1;

    function foo() public {
        var1 = 2;
        var2 = 3;
        var3 = 4;
    }

    function foo2() public {
        var1 = 5;
        var3 = 6;
    }
}

contract VariablePacking_2 {
    uint256 var1 = 1;
    uint8 var2 = 1;
    uint8 var3 = 1;

    function foo() public {
        var1 = 2;
        var2 = 3;
        var3 = 4;
    }

    function foo2() public {
        var2 = 5;
        var3 = 6;
    }
}

contract VariablePacking_3 {
    uint256 var1 = 1;
    uint8 var2 = 1;
    uint8 var3 = 1;
    uint8 var4 = 1;
    uint8 var5 = 1;
    uint8 var6 = 1;
    uint8 var7 = 1;

    function foo() public {
        var2 = 7;
        var3 = 8;
        var4 = 9;
        var5 = 10;
        var6 = 11;
        var7 = 12;
    }
}