#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include <eosio/system.hpp>
#include <eosio/print.hpp>
#include <cmath>
#include <numeric>

using namespace eosio;
using namespace std;

class [[eosio::contract("sfee.libre")]] swapfee : public contract
{
public:
   using contract::contract;
   [[eosio::action]] void votefee(name user, symbol_code pair_token, int fee_voted);
   [[eosio::action]] void openfeetable(name user, symbol_code pair_token);
   [[eosio::action]] void closevote(name user, symbol_code pair_token);
   [[eosio::action]] void closefeetable(symbol_code pair_token);
   [[eosio::action]] void updatefee(symbol_code pair_token);
   [[eosio::on_notify("swapvmpx::addliquidity")]] void onaddliquidity(name user, asset to_buy,
                                                                        asset max_asset1, asset max_asset2);
   [[eosio::on_notify("swapvmpx::remliquidity")]] void onremliquidity(name user, asset to_sell,
                                                                        asset min_asset1, asset min_asset2);
   [[eosio::on_notify("swapvmpx::transfer")]] void ontransfer(const name &from, const name &to,
                                                                const asset &quantity, const string &memo);

private:
   static constexpr std::array<int, 15> FEE_VECTOR{1, 2, 3, 5, 7, 10, 15, 20, 30, 50, 75, 100, 150, 200, 300};
   static const int DEFAULT_FEE_INDEX = 5;
   static const int MIN_FEE_INDEX = 5;
   static const int MAX_FEE_INDEX = 11;
   static_assert((0 <= DEFAULT_FEE_INDEX) && (DEFAULT_FEE_INDEX < FEE_VECTOR.size()), "invalid index");
   static_assert((0 <= MIN_FEE_INDEX) && (MIN_FEE_INDEX < FEE_VECTOR.size()), "invalid index");
   static_assert((0 <= MAX_FEE_INDEX) && (MAX_FEE_INDEX < FEE_VECTOR.size()), "invalid index");
   static_assert(MIN_FEE_INDEX < MAX_FEE_INDEX, "min_fee must be smaller than max_fee");

   int median(symbol_code pair_token);
   int get_index(int number);
   void addvote(symbol_code pair_token, int fee_index, int64_t amount, bool need_update);
   void add_balance(name user, asset to_add, bool need_update);
   asset bring_balance(name user, symbol_code pair_token);

   struct [[eosio::table]] feeaccount
   {
      symbol_code pair_token;
      int fee_index_voted;
      uint64_t primary_key() const { return pair_token.raw(); }
   };

   struct [[eosio::table]] feetable
   {
      symbol_code pair_token;
      vector<int64_t> votes;
      uint64_t primary_key() const { return pair_token.raw(); }
   };

   typedef eosio::multi_index<"feeaccount"_n, feeaccount> feeaccounts;
   typedef eosio::multi_index<"feetable"_n, feetable> feetables;

   struct [[eosio::table]] account
   {
      asset balance;
      uint64_t primary_key() const { return balance.symbol.code().raw(); }
   };
   typedef eosio::multi_index<"accounts"_n, account> accounts;
};
