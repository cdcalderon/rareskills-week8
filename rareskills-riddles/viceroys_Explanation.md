# Oligarchy Governance Vulnerability

Proposals can be created, and voters can cast their votes on these proposals. If a proposal receives enough votes, it can be executed.

However, the flaw lies in the way mappings inside structs are cleared when using the `delete` keyword. When a Viceroy is deposed, the `delete` keyword is used to clear their struct, but it fails to clear the mapping inside the struct. This means that even after a Viceroy is deposed, the votes of their approved voters still count.

Here's how an attacker can exploit this vulnerability:

1. The attacker creates a malicious Viceroy contract and predicts its address before it's actually deployed.

2. Using an Oligarch account, the attacker appoints the Viceroy, giving them the power to approve voters.

3. The attacker approves multiple voters through the Viceroy contract. These voters will be used to cast votes on proposals.

4. The attacker then proceeds to create a proposal, a seemingly innocuous action on the surface.

5. The voters, approved by the Viceroy, cast their votes in favor of the attacker's proposal.

6. Now, here's the crucial part: even if the Viceroy is deposed, the votes from their approved voters still count due to the flaw in the contract's implementation. This is because the `delete` keyword fails to clear the mapping inside the struct.

7. The attacker repeats steps 3-6, adding more approved voters and votes to increase the chances of the proposal being executed.

8. Eventually, when the proposal receives enough votes, it is executed, and the attacker successfully transfers all funds from the CommunityWallet to their own account.

## Takeaways

It is crucial for developers to understand the potential implications of using certain keywords, such as `delete`, and to ensure that data structures are cleared correctly.
