FROM --platform=linux/amd64 ubuntu:focal
WORKDIR /app

# install dependencies
RUN export DEBIAN_FRONTEND=noninteractive \
    && apt-get update \
    && apt-get install -yq \
      wget \
      build-essential \
      libcurl4-gnutls-dev \
    && wget --no-check-certificate https://cmake.org/files/v3.27/cmake-3.27.0-linux-x86_64.sh \
    && chmod +x cmake-3.27.0-linux-x86_64.sh \
    && ./cmake-3.27.0-linux-x86_64.sh --prefix=/usr/local --exclude-subdir \
RUN rm -rf /var/lib/apt/lists/*

# install eosio.cdt
RUN wget --no-check-certificate https://github.com/AntelopeIO/cdt/releases/download/v4.0.0/cdt_4.0.0_amd64.deb
RUN apt install ./cdt_4.0.0_amd64.deb