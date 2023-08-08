#include <eosio/asset.hpp>
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>

namespace exchange {
  inline constexpr eosio::name evmpx_contract = "evmpx"_n;

  CONTRACT vmpxex : public eosio::contract {

  public:
    using contract::contract;

    vmpxex( eosio::name                       receiver,
            eosio::name                       code,
            eosio::datastream< const char * > ds )
        : contract( receiver, code, ds ),
          account_tb( receiver, receiver.value ) {}

    ACTION linkaddr( const eosio::name &account,
                     const std::string &eth_address );
    ACTION unlinkaddr( const eosio::name &account );
    ACTION sendfunds( const std::string &sender, const eosio::asset &quantity );
    ACTION withdraw( const eosio::name  &account,
                     const eosio::asset &quantity,
                     const std::string  &eth_address );

    //   using hi_action = action_wrapper< "hi"_n, &vmpxex::hi >;

    TABLE account {
      eosio::name        account;
      std::string        eth_address;
      uint64_t           primary_key() const { return account.value; }
      eosio::checksum256 by_eth_address() const {
        return eosio::sha256( eth_address.c_str(), eth_address.size() );
      }
    };

    using account_table = eosio::multi_index<
        "account"_n,
        account,
        eosio::indexed_by< "byethaddr"_n,
                           eosio::const_mem_fun< account,
                                                 eosio::checksum256,
                                                 &account::by_eth_address > > >;

  private:
    account_table account_tb;
  };
} // namespace exchange

// 1. create a linkaddress action to link every eth address to a Libre account (1:1 relation)
// - this action can only be called with the permission of the caller
// - this action can only be called once per eth address
// 2. create a unlinkaddress action to unlink an eth address from a Libre account (1:1 relation)
// - this action can only be called with the permission of the called
// 3. create a withdraw action to return the vmpx tokens to the eth address.
// - funds can be withdrawn to any eth address, but if no address is specified
//   the funds will be withdrawn to the linked eth address.
// - the format to withdraw action will needs to receive a valid eth address

// Requirements
// 1. create eosio.code permission for this contract
// 2. give permission from [vmpx contract name] to this contract to be able to issue and transfer tokens on behalf of the [vmpx contract name]
// 3. give permission from [vmpx contract name] to this contract to be able to burn tokens