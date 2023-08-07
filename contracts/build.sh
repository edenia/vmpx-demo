set -e

rm -rf build
mkdir -p build
cd build
cmake ..
make -j $(nproc)
cp vmpxex/vmpxex.* ../vmpxex
cp eosio.token/eosio.token.* ../eosio.token
cp swap.libre/swap.libre.* ../swap.libre
cp sfee.libre/sfee.libre.* ../sfee.libre