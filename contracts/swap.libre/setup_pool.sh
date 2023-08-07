#!/bin/bash
CLEOS="cleos.sh"
YOUR_ACCOUNT="node1"
SWAPCONTRACT="swap.libre"
FEECONTRACT="sfee.libre"
USDSYMBOL="USDL"
USDCONTRACT="eosio.token"
USDPRECISION="6"
USDAMT="20000.000000 USDL"
BTCSYMBOL="BTCL"
BTCCONTRACT="eosio.token"
BTCPRECISION="8"
BTCAMT="1.00000000 BTCL"

# create accounts 
cleos.sh create account eosio $SWAPCONTRACT EOS5qTmvrGEVdFqtFmALRs9BXe1RDXZXCxwV6Zr6aveaSuszL7Aq3 
cleos.sh create account eosio $FEECONTRACT EOS5qTmvrGEVdFqtFmALRs9BXe1RDXZXCxwV6Zr6aveaSuszL7Aq3

# Set limits
/opt/eosio/phoenix-boot/setalimits.sh $FEECONTRACT
/opt/eosio/phoenix-boot/setalimits.sh $SWAPCONTRACT
/opt/eosio/phoenix-boot/setalimits.sh $YOUR_ACCOUNT
cleos.sh set account permission --add-code $SWAPCONTRACT active

# Publish code
cleos.sh set contract $SWAPCONTRACT ~/src/$SWAPCONTRACT/
cleos.sh set contract $FEECONTRACT ~/src/$SWAPCONTRACT/$FEECONTRACT

# Fund myaccount account
cleos.sh transfer eosio $YOUR_ACCOUNT "$BTCAMT"
cleos.sh transfer eosio $YOUR_ACCOUNT "$USDAMT"

# Initialize liquidity pool
$CLEOS push action $SWAPCONTRACT openext '["'"$YOUR_ACCOUNT"'", "'"$YOUR_ACCOUNT"'", {"contract":"'"$BTCCONTRACT"'", "sym":"'"$BTCPRECISION"','"$BTCSYMBOL"'"}]' -p $YOUR_ACCOUNT
$CLEOS push action $SWAPCONTRACT openext '["'"$YOUR_ACCOUNT"'", "'"$YOUR_ACCOUNT"'", {"contract":"'"$USDCONTRACT"'", "sym":"'"$USDPRECISION"','"$USDSYMBOL"'"}]' -p $YOUR_ACCOUNT
$CLEOS push action $BTCCONTRACT transfer '["'"$YOUR_ACCOUNT"'", "'"$SWAPCONTRACT"'", "'"$USDAMT"'", "memo"]' -p $YOUR_ACCOUNT
$CLEOS push action $USDCONTRACT transfer '["'"$YOUR_ACCOUNT"'", "'"$SWAPCONTRACT"'", "'"$BTCAMT"'", "memo"]' -p $YOUR_ACCOUNT
$CLEOS push action $SWAPCONTRACT inittoken '["'"$YOUR_ACCOUNT"'", "7,BTCUSD", {"contract":"'"$BTCCONTRACT"'", "quantity":"'"$BTCAMT"'"}, {"contract":"'"$USDCONTRACT"'", "quantity":"'"$USDAMT"'"}, 10, '"$FEECONTRACT"']' -p $YOUR_ACCOUNT -p $SWAPCONTRACT
$CLEOS get table $SWAPCONTRACT $YOUR_ACCOUNT swapacnts

# GOT UP TO HERE WITH ERROR: "assertion failure with message: extended_symbol not registered for this user, please run openext action or write exchange details in the memo of your transfer"