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
