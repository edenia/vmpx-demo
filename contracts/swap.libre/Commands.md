**NOTE: In this example are using the PAIR BTC/USDT, which creates the swaptoken BTCUSD. We assume an BTC token located in the $BTCCONTRACT, and a USD token located in the contract $USDCONTRACT. You would need to replace these variables depending on your trading pairs.** 

These commands will work on the Libre Swap from the command line using cleos.

You can access these features on the graphical interface at https://dashboard.libre.org or on the testnet at https://dashboard.mindyourbitcoin.com

The fee value will be governed by the liquidity providers using the smart contract [sfee.libre](sfee.libre/README.md).

## EXAMPLE: TRADING BTC/USD

The simple way to trade is to transfer a token with the appropriate memo. The memo starts with "exchange:" and followed by the details of your operation, with the format *"LPTOKN, min_expected_asset, memo"*. Blank spaces before LPTOKN, min_expected_asset and memo are ignored. The amount to be obtained by the user will be computed by the contract and executed only if it is at least min_expected_asset. 

This makes it very easy to script trades on swap.libre. Here is a fully working example using the account "node2" to trade 1000 SATS and expect to get at least $0.10 in return:

`cleos push action swap.libre transfer '["node2", "swap.libre","0.00001000 BTCL","exchange: BTCUSD, 0.100000 USDL", "Trading 0.001 BTCL for USDL"]' -p node2`

Once you send BTCL, you will instantly get USDL at the market rate.

Now let's look at how to do this in a script. All of the scripts on this page will require the following variables to be sourced or in the script:

```
YOUR_ACCOUNT="node2"
BTCCONTRACT="eosio.token"
BTCSYMBOL="BTCL"
BTCPRECISION="8"
USDSYMBOL="USDL"
USDCONTRACT="eosio.token"
USDPRECISION="6"
CLEOS="cleos.sh" # you will need to create this and put it into your path specifying the correct API node
DEXCONTRACT="swap.libre"
```

This is a very simple bash execution for making the same trade as we detailed above: 

```
    $CLEOS push action $DEXCONTRACT transfer '["'"$YOUR_ACCOUNT"'", "swap.libre", "0.00001000 '"$BTCSYMBOL"'", "exchange: BTCUSD, 0.100000 "'"$USDSYMBOL"'", Trading BTCL for USDL"]' -p $YOUR_ACCOUNT
```

## EXAMPLE: GETTING PRICES TO AUTOTRADE

Now we will describe how you can easiliy create a scripted trading strategy to trade BTC / USDT:

Here is a simple bash function you can use to get the price on the swap.libre testnet and compare it to the market price on CoinGecko. Once you get the price from the Libre Swap DEX, you can choose to execute trades based on your strategy.

```
get_prices(){
	DEXSTAT=`$CLEOS get table $DEXCONTRACT BTCUSD stat`
	B=`echo $DEXSTAT|jq -r '.rows[]|.pool1.quantity'| tr -d " BTCL"`
 	U=`echo $DEXSTAT|jq -r '.rows[]|.pool2.quantity'| tr -d " USDL"`
	echo "$B BTC in pool"
	echo "$U USDT in pool"
 	PD=`echo "scale=6;$U/$B" | bc`
 	echo "Swap.Libre price is $`echo $PD`/BTC"
	# Get price from CoinGecko
	PM=`curl --silent -X 'GET' 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=USD'   -H 'accept: application/json'|jq '.bitcoin.usd'`
	echo "Market price is $`echo $PM`/BTC"
	DELTA=`echo "scale=6; ($PM-$PD)"|bc`
    echo "Difference between Market Price and Swap Price is $DELTA"
}
```

## EXAMPLE: CREATE A LIQUIDITY POOL FOR BTC/USD


You need to create one channel for each token. The second input below is the ram payer, and the authorizer must be the ram payer.


Let's go through the process of creating a liquidity pool for BTC/USD.


Open a channel in the contract. This channel will store your tokens for creating a pool, adding liquidity, or trading (you can also trade without creating a channel). Having tokens in a channel might trade faster and more reliably than using the transfers.

Open a channel for USD coin:

```
    $CLEOS push action swap.libre openext '["'"$YOUR_ACCOUNT"'", "'"$YOUR_ACCOUNT"'", {"contract":"'"$USDCONTRACT"'", "sym":"'"$USDPRECISION"','"$USDSYMBOL"'"}]' -p $YOUR_ACCOUNT
```

Open a channel for BTC coin:

```
    $CLEOS push action swap.libre openext '["'"$YOUR_ACCOUNT"'", "'"$YOUR_ACCOUNT"'", {"contract":"'"$BTCCONTRACT"'", "sym":"'"$BTCPRECISION"','"$BTCSYMBOL"'"}]' -p $YOUR_ACCOUNT
```


Transfer in some of each token - in this example, the starting price of the trading pair will be $20k/BTC (amount of USD divided by amount of BTC):
```
    $CLEOS push action $BTCCONTRACT transfer '["'"$YOUR_ACCOUNT"'", "swap.libre", "1.00000000 '"$BTCSYMBOL"'", "memo"]' -p $YOUR_ACCOUNT

    $CLEOS push action $USDCONTRACT transfer '["'"$YOUR_ACCOUNT"'", "swap.libre", "20000.000000 '"$USDSYMBOL"'", "memo"]' -p $YOUR_ACCOUNT
```

Verify that the channels are funded:
```
    $CLEOS get table swap.libre $YOUR_ACCOUNT swapacnts
```

Next you will initialize the LP tokens and create the pool:
```
    $CLEOS push action swap.libre inittoken '["'"$YOUR_ACCOUNT"'", "7,BTCUSDD", {"contract":"'"$BTCONTRACT"'", "quantity":"1.00000000 '"$BTCSYMBOL"'"}, {"contract":"'"$USDCONTRACT"'", "quantity":"20000.000000 '"$USDSYMBOL"'"}, 10, "sfee.libre"]' -p $YOUR_ACCOUNT -p swap.libre
```
    
Close the contract's channel for a specific token. In case there are funds there, it will return them to the account mentioned in the second item here - assume most people would want this to withdraw to their own account:
```
    $CLEOS push action swap.libre closeext '["'"$YOUR_ACCOUNT"'", "'"$YOUR_ACCOUNT"'", {"contract":"'"$BTCCONTRACT"'", "sym":"'"$BTCPRECISION"','"$BTCSYMBOL"'"}, "memo"]' -p swap.libre -p $YOUR_ACCOUNT 

    $CLEOS push action swap.libre closeext '["'"$YOUR_ACCOUNT"'", "'"$YOUR_ACCOUNT"'", {"contract":"'"$USDCONTRACT"'", "sym":"'"$USDPRECISION"','"$USDSYMBOL"'"}, "memo"]' -p swap.libre -p $YOUR_ACCOUNT
```

## OTHER COMMANDS

Withdraw funds from an open channel, to the account "TO":

    cleos push action swap.libre withdraw '["'"$YOUR_ACCOUNT"'", "TO", {"contract":"'"$BTCONTRACT"'", "quantity":"1.00000000 '"$BTCSYMBOL"'"}, "memo"]' -p $YOUR_ACCOUNT

Create the BTCUSD swaptoken. Set the initial liquidity, the initial fee for the trading pair and the fee controller.

    cleos push action swap.libre inittoken '["'"$YOUR_ACCOUNT"'", "6,BTCUSD", {"contract":"'"$BTCONTRACT"'", "quantity":"1.00000000 '"$BTCSYMBOL"'"}, {"contract":"'"$USDCONTRACT"'", "quantity":"1.0000 '"$USDSYMBOL"'}, 10, "sfee.libre"]' -p $YOUR_ACCOUNT

Check your swaptokens (LP Tokens) balance:

    $CLEOS get table swap.libre $YOUR_ACCOUNT accounts

    $CLEOS get currency balance swap.libre $YOUR_ACCOUNT

Add more liquidity to a pool. Set the exact amount of swaptoken to obtain, in this case 
1.5000 BTCUSD, and the maximum you are willing to pay of each token of the pair.

    cleos push action swap.libre addliquidity '["'"$YOUR_ACCOUNT"'", "1.5000 BTCUSD", "2.0000 '"$BTCSYMBOL"', "2.0000 '"$USDSYMBOL"']' -p $YOUR_ACCOUNT

Sell your swaptokens and retire liquidity. The amount of swaptoken is exact and the other two are minima required.
```
    $CLEOS push action swap.libre remliquidity '["'"$YOUR_ACCOUNT"'", "141.4213562 BTCUSD", "20.000000 '"$USDSYMBOL"'", "1.0000 '"$BTCSYMBOL"'"]' -p $YOUR_ACCOUNT
```

The other for trading method operates between funds already deposited in the contract. The structure
of the input is account, swaptoken, extended_asset to pay (exact), asset to receive (limiting).

    cleos push action swap.libre exchange '["'"$YOUR_ACCOUNT"'", "BTCUSD", {"contract":"'"$BTCONTRACT"'", "quantity":"1.00000000 '"$BTCSYMBOL"'"}, "0.1000 '"$USDSYMBOL"']' -p $YOUR_ACCOUNT

It is also possible to set the exact amount to obtain and limit the amount to pay.

To do this, use negative amounts. The following example means that you want to receive exactly 0.1000 '"$USDSYMBOL and pay at most 1.0000 EOS. 

    cleos push action swap.libre exchange '["'"$YOUR_ACCOUNT"'", "BTCUSD", {"contract":"'"$BTCONTRACT"'", "quantity":"-0.1000 '"$USDSYMBOL"'"}, "-1.0000 '"$BTCSYMBOL"'"]' -p $YOUR_ACCOUNT

Transfer your swaptokens (LP tokens) to another account:

    cleos push action swap.libre transfer '["'"$YOUR_ACCOUNT"'", "$ANOTHER_ACCOUNT'"$BTCSYMBOL"', "0.0001 BTCUSD", "Transfer LP token"]' -p $YOUR_ACCOUNT

See swaptoken stats:

    $CLEOS get table swap.libre BTCUSD stat

In many practical cases, users will prefer to run many actions in a single transaction.
For example, if you want to add liquidity, you will probably prefer to close the accounts in the contract swap.libre corresponding to the external tokens, to avoid spending RAM. To that end, you may run:

    $CLEOS push transaction addliquidity.json

where the file addliquidity.json contains:
```
    {
        "actions":
        [
        {
            "account": "swap.libre",
            "name": "openext",
            "authorization": [{"actor": '"$YOUR_ACCOUNT"',"permission": "active"}],
            "data": {
                "user": '"$YOUR_ACCOUNT"',
                "payer": '"$YOUR_ACCOUNT"',
                "ext_symbol": {"contract":"'"$BTCONTRACT"'", "sym":"'"$BTCPRECISION","$BTCSYMBOL"'"}
            }
        },{
            "account": "swap.libre",
            "name": "openext",
            "authorization": [{"actor": '"$YOUR_ACCOUNT"',"permission": "active"}],
            "data": {
                "user": '"$YOUR_ACCOUNT"',
                "payer": '"$YOUR_ACCOUNT"',
                "ext_symbol": {"contract":"'"$USDCONTRACT"'", "sym":"'"$USDPRECISION","$USDSYMBOL"'"}
            }
        },{
            "account": '"$BTCONTRACT"',
            "name": "transfer",
            "authorization": [{"actor": '"$YOUR_ACCOUNT"',"permission": "active"}],
            "data": {
                "from": '"$YOUR_ACCOUNT"',
                "to": "swap.libre",
                "quantity": "$MAX_ASSET1 '"$BTCSYMBOL"',
                "memo": ""
            }
        },{
            "account": '"$USDCONTRACT"',
            "name": "transfer",
            "authorization": [{"actor": '"$YOUR_ACCOUNT"',"permission": "active"}],
            "data": {
                "from": '"$YOUR_ACCOUNT"',
                "to": "swap.libre",
                "quantity": "$MAX_ASSET2 '"$USDSYMBOL"',
                "memo": ""
            }
        },{
            "account": "swap.libre",
            "name": "addliquidity",
            "authorization": [{"actor": '"$YOUR_ACCOUNT"',"permission": "active"}],
            "data": {
                "user": '"$YOUR_ACCOUNT"',
                "to_buy": "$LPTOKENAMOUNT BTCUSD",
                "max_asset1": "$MAX_ASSET1 '"$BTCSYMBOL"',
                "max_asset2": "$MAX_ASSET2 '"$USDSYMBOL"',                
            }
        },{
            "account": "swap.libre",
            "name": "closeext",
            "authorization": [{"actor": '"$YOUR_ACCOUNT"',"permission": "active"}],
            "data": {
                "user": '"$YOUR_ACCOUNT"',
                "to": "TO",
                "ext_symbol": {"contract":"'"$USDCONTRACT"'", "sym":"'"$USDPRECISION","$USDSYMBOL"'"},
                "memo": "Close Channel"
            }
        },{
            "account": "swap.libre",
            "name": "closeext",
            "authorization": [{"actor": '"$YOUR_ACCOUNT"',"permission": "active"}],
            "data": {
                "user": '"$YOUR_ACCOUNT"',
                "to": "TO",                
                "ext_symbol": {"contract":"'"$BTCONTRACT"'", "sym":"'"$BTCPRECISION","$BTCSYMBOL"'"},
                "memo": "Close Channel"
            }
        }
        ]
    }    
```

The same idea applies to the operations of removing liquidity and inittoken.

Check the commands of sfee.libre [here](sfee.libre/README.md).