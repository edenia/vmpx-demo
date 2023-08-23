// Repository: https://github.com/torquem-ch/silkworm/tree/master/silkworm/core/common/util.hpp

#include <regex>

namespace silkworm {
  inline constexpr size_t kAddressLength{ 20 };

  inline bool is_valid_hex( std::string_view s ) {
    static const std::regex hexRegex( "^0x[0-9a-fA-F]+$" );
    return std::regex_match( s.data(), hexRegex );
  }

  inline bool is_valid_address( std::string_view s ) {
    if ( s.length() != 2 + kAddressLength * 2 ) {
      return false;
    }
    return is_valid_hex( s );
  }

} // namespace silkworm