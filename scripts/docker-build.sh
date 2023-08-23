#!/usr/bin/env sh
set -e

docker build -t contract-builder:latest -f ./docker/contract-builder.Dockerfile .
docker run \
    --rm \
    --mount type=bind,src="$PWD/contracts",target=/workspace \
    --workdir /workspace \
    contract-builder:latest bash -c "
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
"