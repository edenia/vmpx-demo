FROM node:16.20.0  as build-stage

ARG react_app_tag
ARG react_app_name
ARG react_app_title
ARG react_app_logo
ARG react_app_footer_links
ARG react_app_contract_address_eth
ARG react_app_token_linker_contract
ARG react_app_swap_vmpx_contract
ARG react_app_vmpx_pool_symbol
ARG react_app_evmpx_contract
ARG react_app_bvmpx_contract
ARG react_app_libre_chain_id
ARG react_app_libre_api_host
ARG react_app_eth_block_explorer
ARG react_app_libre_block_explorer
ARG react_app_target_eth_wallet_address
ARG react_app_wax_app_name
ARG react_app_wax_api_protocol
ARG react_app_wax_api_host
ARG react_app_wax_api_port
ARG react_app_wax_chain_id
ARG react_app_hasura_url

ENV WORK_DIR /usr/src/app
ENV PATH $WORK_DIR/node_modules/.bin:$PATH
ENV NODE_ENV production
ENV NODE_PATH ./src
ENV REACT_APP_TAG $react_app_tag
ENV REACT_APP_NAME $react_app_name
ENV REACT_APP_TITLE $react_app_title
ENV REACT_APP_CONTRACT_ADDRESS_ETH $react_app_contract_address_eth
ENV REACT_APP_TOKEN_LINKER_CONTRACT $react_app_token_linker_contract
ENV REACT_APP_SWAP_VMPX_CONTRACT $react_app_swap_vmpx_contract
ENV REACT_APP_VMPX_POOL_SYMBOL $react_app_vmpx_pool_symbol
ENV REACT_APP_EVMPX_CONTRACT $react_app_evmpx_contract
ENV REACT_APP_BVMPX_CONTRACT $react_app_bvmpx_contract
ENV REACT_APP_LIBRE_CHAIN_ID $react_app_libre_chain_id
ENV REACT_APP_LIBRE_API_HOST $react_app_libre_api_host
ENV REACT_APP_ETH_BLOCK_EXPLORER $react_app_eth_block_explorer
ENV REACT_APP_LIBRE_BLOCK_EXPLORER $react_app_libre_block_explorer
ENV REACT_APP_TARGET_ETH_WALLET_ADDRESS $react_app_target_eth_wallet_address
ENV REACT_APP_LOGO $react_app_logo
ENV REACT_APP_FOOTER_LINKS $react_app_footer_links
ENV REACT_APP_WAX_APP_NAME $react_app_wax_app_name
ENV REACT_APP_WAX_API_PROTOCOL $react_app_wax_api_protocol
ENV REACT_APP_WAX_API_HOST $react_app_wax_api_host
ENV REACT_APP_WAX_API_PORT $react_app_wax_api_port
ENV REACT_APP_WAX_CHAIN_ID $react_app_wax_chain_id
ENV REACT_APP_HASURA_URL $react_app_hasura_url
ENV TOOL_NODE_FLAGS --max_old_space_size=4096

RUN mkdir -p $WORK_DIR
WORKDIR $WORK_DIR

COPY ./ $WORK_DIR

RUN yarn install && yarn build

FROM nginx:1.17.10-alpine as run-stage

COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html
COPY --from=build-stage /usr/src/app/compression.conf /etc/nginx/conf.d/compression.conf
COPY --from=build-stage /usr/src/app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

