
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SetVariables{
    uint a = 0;

    function setTo1() public {
        a = 1;
    }

    function setTo2() public {
        a = 2;
    }

    function setToZero() public {
        a = 0;
    }
}
