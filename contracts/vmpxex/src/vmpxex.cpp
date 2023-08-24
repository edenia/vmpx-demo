#include <algorithm>
#include <util.hpp>
#include <vmpxex.hpp>

namespace exchange {
  ACTION vmpxex::linkaddr( const eosio::name &account,
                           const std::string &eth_address ) {
    require_auth( account );

    eosio::check( silkworm::is_valid_address( eth_address ),
                  "invalid eth address" );

    std::string tolower_eth_address = eth_address;

    std::transform( eth_address.begin(),
                    eth_address.end(),
                    tolower_eth_address.begin(),
                    []( unsigned char c ) { return std::tolower( c ); } );

    auto account_itr = account_tb.find( account.value );

    auto eth_address_index = account_tb.get_index< "byethaddr"_n >();
    auto eth_address_itr = eth_address_index.find(
        eosio::sha256( tolower_eth_address.c_str(), tolower_eth_address.size() ) );

    eosio::check( eth_address_itr == eth_address_index.end(),
                  "eth address already linked" );

    if ( account_itr == account_tb.end() ) {
      account_tb.emplace( account, [&]( auto &row ) {
        row.account = account;
        row.eth_address = tolower_eth_address;
      } );
    } else {
      account_tb.modify( account_itr, account, [&]( auto &row ) {
        row.eth_address = tolower_eth_address;
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

    eosio::action( eosio::permission_level{ evmpx_contract, "transferer"_n },
                   evmpx_contract,
                   "issue"_n,
                   std::make_tuple( evmpx_contract,
                                    quantity,
                                    std::string( "issue from vmpx bridge" ) ) )
        .send();

    eosio::action(
        eosio::permission_level{ evmpx_contract, "transferer"_n },
        evmpx_contract,
        "transfer"_n,
        std::make_tuple( evmpx_contract,
                         send_to,
                         quantity,
                         std::string( "transfer from vmpx bridge" ) ) )
        .send();
  }

  ACTION vmpxex::withdraw( const eosio::name  &account,
                           const eosio::asset &quantity,
                           const std::string  &eth_address ) {
    require_auth( get_self() );
  }

  void vmpxex::on_burn( const eosio::name  &account,
                        const eosio::asset &quantity,
                        const std::string  &memo ) {
    eosio::check( get_first_receiver() == evmpx_contract,
                  "invalid contract notification" );

    auto account_itr = account_tb.find( account.value );

    eosio::check( account_itr != account_tb.end(), "account not found" );

    std::string eth_address_to_withdraw = memo;

    if ( eth_address_to_withdraw.empty() ) {
      eth_address_to_withdraw = account_itr->eth_address;
    } else {
      eosio::check( silkworm::is_valid_address( eth_address_to_withdraw ),
                    "invalid eth address" );
    }

    // call withdraw action using action wrapper
    eosio::action(
        eosio::permission_level{ get_self(), "active"_n },
        get_self(),
        "withdraw"_n,
        std::make_tuple( account, quantity, eth_address_to_withdraw ) )
        .send();
  }

} // namespace exchange
