**Single action examples for the contract sfee.libre** 

Open a fee table for the swaptoken LPTOKN:

    cleos push action sfee.libre openfeetable '["YOUR_ACCOUNT", "LPTOKN"]' -p YOUR_ACCOUNT

Vote the fee value 0.3% for the swaptoken LPTOKN.

    cleos push action sfee.libre votefee '["YOUR_ACCOUNT", "LPTOKN", "30"]' -p YOUR_ACCOUNT

Remark: the possible fee values in this version are 10, 15, 20, 30, 50, 75, 100. 
Values less than 10 or greater than 100 will be rejected. Intermediate values will be rounded upwards. In future versions, other values might be possible as well.

The fee value will automatically update to the median of the current votes
each time a vote is entered, a voter's pool token balance is modified or
a vote is closed.

Close your vote for the swaptoken EVO:

    cleos push action sfee.libre closevote '["YOUR_ACCOUNT", "LPTOKN"]' -p YOUR_ACCOUNT
