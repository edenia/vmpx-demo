![LIBRESWAP](Light.png)

# Summary 

This repo contains 2 smart contracts: swap.libre and sfee.libre:

    swap.libre is an automatic market maker that allows the creation of liquidity pools for any pair of tokens on the chain. It facilitates a decentralizated exchange through simple, permissionless transfers and offers an interesting financial position for the liquidity providers.

    sfee.libre allows the liquidity provider (LP) token holders to vote on the liquidity pool trading fees. By default, this is set to a very low fee of 10 basis points (0.10%).

Libre Swap follows the line initiated by Bancor, Uniswap, and Evodex (built by Argentina) but with some design improvements that we explain below:

1- Liquidity Provider Tokens (swaptokens). For each registered pair there will be a standard token backed by the assets in the corresponding pool. These new tokens can be freely transferred, facilitating the access and management of the investment position. We can call these tokens "swaptokens".

2- Initial fee and fee governance. A fee value is set at initialization of each trading pair. The contract sfee.libre will be able to control the fee value through a voting mechanism. The liquidity providers can vote for a value between 0.1% and 1%, their vote will be weighted according to their stake.

The fee value will be set to the median value of the votes. The voting tables are updated each time a liquidity provider modifies its balance.

A tiny fee of 0.01% is charged when providing liquidity in order to protect previous liquidity providers from attacks to the fee value. The action of removing liquidity is free of charge.

Check out the [commands document](Commands.md) for instructions on how to trade as well as info on how to create an automated trading strategy using swap.libre to trade BTC/USDT.

# Build

`eosio-cpp libreswap.cpp token_functions.cpp -o swap.libre.wasm --abigen`

# Test

To run tests, you will need to have to use your own paths to eosio.contracts and to build/lib/cmake/eosio:

```
cd tests/build
cmake -D CONTRACTS_BUILD_FOLDER=<path>/build -D eosio_DIR=<path>build/lib/cmake/eosio ..
make 
./unit_test
```

**Formulas that determinie prices**

Libre Swap follows standard criterion for a decentralized exchange - after an exchange operation for a given pair, the product of the amounts in the pools of the corresponding pair must remain equal before the fee is charged. As the fees are collected by the pool, that product will rise accordingly. 

New Pool = +/- traded amount (including fee as set by sfee.libre)

All the rounding errors favour the pools in order to avoid the gaming of the system. This criterion completely determines the price behaviour which is equal to pool 1 / pool 2. Notice that whenever the amount to exchange is small compared to the pool sizes the price is approximately equal to the quotient between the amounts in the pools.

When adding or removing liquidity, the (again standard) criterion is to keep fixed ratios between minted swaptokens and the amounts in the pools that back their value. There is a small correction for adding liquidity: 

The 0.01% fees accrued from trades will gradually increase the value of the swaptoken as the pools grow.

**Considerations for liquidity providers**

Being a liquidity provider is a financial position that deserves a careful analysis. It is necessary to understand the exposure to gains and losses in various future scenarios. This is known as "impermanent loss" but essentially, you could end up losing almost all of one token and ending up with only the other token in the pool.

The sfee.libre allows for decentralized governance of swap fees, since the optimal fee parameter is expected to change according to the mood of the market. For example, high volatility suggests high fee. Another relevant factor is the competition from other exchange opportunities. Without the ability to change the fee, liquidity providers might want to move their funds from one place to the other, thus discouraging them to invest in the first place. Therefore a dynamic fee offers a practical way to benefit from the large exchange activity in the cryptocurrency space.

**Consideration for traders**

Continuous liquidity pools offer advantages of a permissionless, trustless decentralized exchange. There is no need to trust funds to an institution. The prices are computed algorithmically according to the available liquidity. High liquidity will translate to low price slippage (this is the price variation as the exchanged amount varies).
Conversely, if the liquidity pools are small, there will be considerable slippage and the exchange will only be practical for tiny amounts.

A list of cleos commands to interact with this contract can be found at [Commands.md](Commands.md)

**References:** Articles from [Bancor](https://about.bancor.network/protocol/), [Uniswap](https://uniswap.org), and [Eos Argentina](https://steemit.com/eosio/@yuhjtman/why-bancor-like-exchanges-are-expected-to-have-fees) (2018).

**This is a fork of [evolutiondex](https://github.com/EOSArgentina/evolutiondex) by the amazing team at EOS Argentina - and it is the basis for several other battle-tested DEX contracts on various EOSIO/Antelope chains **