set -e

mkdir -p build
cd build
cmake ..
make -j $(nproc)
cp vmpxex/vmpxex.* ../vmpxex
cp eosio.token/eosio.token.* ../eosio.token