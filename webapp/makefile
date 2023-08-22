include ../utils/meta.mk ../utils/help.mk

LATEST_TAG ?= latest

install: ##@local Install all dependencies
install:
	@npm install

clean-install: ##@local Reinstalls all dependencies
clean-install:
	@rm -Rf node_modules
	@npm install

run: ##@local Run the project locally (without docker)
run: node_modules
	@$(SHELL_EXPORT) npm run dev

build-docker: ##@devops Build the docker image
build-docker: ./Dockerfile
	echo "Building containers..."
	@docker pull $(DOCKER_REGISTRY)/$(IMAGE_NAME_WEBAPP):$(LATEST_TAG) || true
	@docker build \
		-t $(DOCKER_REGISTRY)/$(IMAGE_NAME_WEBAPP):$(VERSION) --target run-stage \
		-t $(DOCKER_REGISTRY)/$(IMAGE_NAME_WEBAPP):$(LATEST_TAG) --target run-stage \
	  --build-arg react_app_version="$(REACT_APP_VERSION)" \
		--build-arg react_app_name="$(REACT_APP_NAME)" \
		--build-arg react_app_title="$(REACT_APP_TITLE)" \
		--build-arg react_app_contract_address_eth="$(REACT_APP_CONTRACT_ADDRESS_ETH)" \
		--build-arg react_app_token_linker_contract="$(REACT_APP_TOKEN_LINKER_CONTRACT)" \
		--build-arg react_app_swap_vmpx_contract="$(REACT_APP_SWAP_VMPX_CONTRACT)" \
		--build-arg react_app_vmpx_pool_symbol="$(REACT_APP_VMPX_POOL_SYMBOL)" \
		--build-arg react_app_bvmpx_contract="$(REACT_APP_BVMPX_CONTRACT)" \
		--build-arg react_app_vmpx_transfer_limit="$(REACT_APP_VMPX_TRANSFER_LIMIT)" \
		--build-arg react_app_libre_chain_id="$(REACT_APP_LIBRE_CHAIN_ID)" \
		--build-arg react_app_libre_api_host="$(REACT_APP_LIBRE_API_HOST)" \
		--build-arg react_app_eth_block_explorer="$(REACT_APP_ETH_BLOCK_EXPLORER)" \
		--build-arg react_app_libre_block_explorer="$(REACT_APP_LIBRE_BLOCK_EXPLORER)" \
		--build-arg react_app_evmpx_contract="$(REACT_APP_EVMPX_CONTRACT)" \
		--build-arg react_app_target_eth_wallet_address="$(REACT_APP_TARGET_ETH_WALLET_ADDRESS)" \
		--build-arg react_app_logo="$(REACT_APP_LOGO)" \
		--build-arg react_app_footer_links="$(REACT_APP_FOOTER_LINKS)" \
		--build-arg react_app_wax_app_name="$(REACT_APP_WAX_APP_NAME)" \
		--build-arg react_app_wax_api_protocol="$(REACT_APP_WAX_API_PROTOCOL)" \
		--build-arg react_app_wax_api_host="$(REACT_APP_WAX_API_HOST)" \
		--build-arg react_app_wax_api_port="$(REACT_APP_WAX_API_PORT)" \
		--build-arg react_app_wax_chain_id="$(REACT_APP_WAX_CHAIN_ID)" \
		--build-arg react_app_hasura_url="$(REACT_APP_HASURA_URL)" \
		.

pull-image: ##@devops Pull the latest image from registry for caching
pull-image:
	@docker pull $(DOCKER_REGISTRY)/$(IMAGE_NAME_WEBAPP):$(LATEST_TAG) || true

build-docker-cached: ##@devops Build the docker image using cached layers
build-docker-cached: ./Dockerfile
	@docker build \
		--target prod-stage \
		--cache-from $(DOCKER_REGISTRY)/$(IMAGE_NAME_WEBAPP):$(LATEST_TAG) \
		-t $(DOCKER_REGISTRY)/$(IMAGE_NAME_WEBAPP):$(VERSION) \
		-t $(DOCKER_REGISTRY)/$(IMAGE_NAME_WEBAPP):$(LATEST_TAG) \
		.

push-image: ##@devops Push the freshly built image and tag with release or latest tag
push-image:
	@docker push $(DOCKER_REGISTRY)/$(IMAGE_NAME_WEBAPP):$(VERSION)
