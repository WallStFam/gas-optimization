
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Unchecked{
    uint a = 1;
    uint b = 2;
    uint c = 10;    

    function unchecked_() public {
        unchecked {
            a = a *5;
            c += a;
            b += c + a * 2;
        }
    }

    function checked() public {
        a = a *5;
        c += a;
        b += c + a * 2;
    }
}
