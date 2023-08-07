<h1 class="contract">openfeetable</h1>

---
spec_version: "0.2.0"
title: Open fee table
summary: 'Open a fee table for a given pair token'
---

{{user}} initializes a table for registering votes for the pair token 
{{pair_token}} of the contract swap.libre.

The authorization of {{user}} is required, who will pay for the RAM required.


<h1 class="contract">closefeetable</h1>

---
spec_version: "0.2.0"
title: Close fee table
summary: 'Close a fee table for a given pair token'
---

This action closes the fee table corresponding to {{pair_token}}. It will fail if the table is storing at least one vote. 
In case it succeeds, the corresponding RAM will be liberated.


<h1 class="contract">votefee</h1>

---
spec_version: "0.2.0"
title: Vote fee
summary: 'Vote fee value for a specific pair token'
---

{{user}} votes a fee value for {{pair_token}} of swap.libre. The exact value voted will be equal to the least of the numbers 10,15,20,30,50,75,100 that is greater than or equal to {{fee_voted}}. Values less than 10 or greater than 100 will be rejected. One unit of fee value is equal to 0.01%.

The authorization of {{user}} is required, who will pay for the RAM required.

<h1 class="contract">closevote</h1>

---
spec_version: "0.2.0"
title: Close vote
summary: 'Close vote for a specific pair token'
---

{{user}} closes its vote corresponding to {{pair_token}} of swap.libre.
The corresponding RAM will be liberated.

The authorization of {{user}} is required.


<h1 class="contract">updatefee</h1>

---
spec_version: "0.2.0"
title: Update fee
summary: 'Updates the fee value of a specific pair token'
---

This action executes the action changefee from swap.libre with inputs {{pair_token}} and a fee value that is computed as the weighted median of the current votes in the corresponding fee table.  The weights of the votes are the balances of the pair token of each voter. In the current version, it is always unnecessary to run this action, since it is automatically called by other actions.

<h1 class="contract">onaddliquidity</h1>

---
spec_version: "0.2.0"
title: On add liquidity
summary: 'Updates the weight of a vote when adding liquidity'
---

When swap.libre notifies that {{user}} has added liquidity to the pair token {{asset_to_symbol_code to_buy}}, the weight of the vote of {{user}} is updated accordingly.

<h1 class="contract">onremliquidity</h1>

---
spec_version: "0.2.0"
title: On remove liquidity
summary: 'Updates the weight of a vote when removing liquidity'
---

When swap.libre notifies that {{user}} has removed liquidity from the pair token {{asset_to_symbol_code to_sell}}, the weight of the vote of {{user}} is updated accordingly.


<h1 class="contract">ontransfer</h1>

---
spec_version: "0.2.0"
title: On transfer
summary: 'Updates the weight of a vote on a transfer by the contract swap.libre'
---

When swap.libre notifies that {{from}} has transferred {{quantity}} to {{to}}, the weights of the votes of {{from}} and {{to}} are updated accordingly.