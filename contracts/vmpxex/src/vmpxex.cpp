#include <vmpxex.hpp>

namespace exchange {
  ACTION vmpxex::linkaddr( const eosio::name &account,
                           const std::string &eth_address ) {
    require_auth( account );

    auto account_itr = account_tb.find( account.value );

    auto eth_address_index = account_tb.get_index< "byethaddr"_n >();
    auto eth_address_itr = eth_address_index.find(
        eosio::sha256( eth_address.c_str(), eth_address.size() ) );

    eosio::check( eth_address_itr == eth_address_index.end(),
                  "eth address already linked" );

    if ( account_itr == account_tb.end() ) {
      account_tb.emplace( account, [&]( auto &row ) {
        row.account = account;
        row.eth_address = eth_address;
      } );
    } else {
      account_tb.modify( account_itr, account, [&]( auto &row ) {
        row.eth_address = eth_address;
      } );
    }
  }

  ACTION vmpxex::unlinkaddr( const eosio::name &account ) {
    require_auth( account );

    auto account_itr = account_tb.find( account.value );

    eosio::check( account_itr != account_tb.end(), "account not found" );

    account_tb.erase( account_itr );
  }

  ACTION vmpxex::sendfunds( const std::string  &sender,
                            const eosio::asset &quantity ) {
    require_auth( get_self() );

    auto eth_address_index = account_tb.get_index< "byethaddr"_n >();
    auto eth_address_itr = eth_address_index.find(
        eosio::sha256( sender.c_str(), sender.size() ) );

    eosio::check( eth_address_itr != eth_address_index.end(),
                  "eth address has no Libre account linked" );

    eosio::name send_to = eth_address_itr->account;

    // TODO: load address from account (address -> account)

    eosio::action( eosio::permission_level{ vmpx_contract, "transferer"_n },
                   vmpx_contract,
                   "issue"_n,
                   std::make_tuple( vmpx_contract,
                                    quantity,
                                    std::string( "issue from vmpx bridge" ) ) )
        .send();

    eosio::action(
        eosio::permission_level{ vmpx_contract, "transferer"_n },
        vmpx_contract,
        "transfer"_n,
        std::make_tuple( vmpx_contract,
                         send_to,
                         quantity,
                         std::string( "transfer from vmpx bridge" ) ) )
        .send();
  }

  ACTION vmpxex::withdraw( const eosio::name  &account,
                           const eosio::asset &quantity,
                           const std::string  &eth_address ) {
    // TODO: validate eth address is correct
    require_auth( account );

    auto account_itr = account_tb.find( account.value );

    eosio::check( account_itr != account_tb.end(), "account not found" );

    std::string eth_address_to_withdraw = eth_address;

    if ( eth_address_to_withdraw.empty() ) {
      eth_address_to_withdraw = account_itr->eth_address;
    }

    eosio::action( eosio::permission_level{ vmpx_contract, "transferer"_n },
                   vmpx_contract,
                   "burn"_n,
                   std::make_tuple( quantity,
                                    std::string( account.to_string() + ":" +
                                                 eth_address_to_withdraw ) ) )
        .send();
  }

} // namespace exchange
