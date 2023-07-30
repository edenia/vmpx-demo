include utils/meta.mk utils/help.mk

SHELL := /bin/bash
BLUE   := $(shell tput -Txterm setaf 6)
RESET  := $(shell tput -Txterm sgr0)

run:
	make -B postgres
	make -B hapi
	make -B hasura
	make -B -j 2 hapi-logs hasura-cli

postgres:
	@docker-compose stop postgres
	@docker-compose up -d --build postgres
	@echo "done postgres"

hapi:
	@docker-compose stop hapi
	@docker-compose up -d --build hapi
	@echo "done hapi"

hapi-logs:
	@docker-compose logs -f hapi

hasura:
	$(eval -include .env)
	@until \
		docker-compose exec -T postgres pg_isready; \
		do echo "$(BLUE)hasura |$(RESET) waiting for postgres service"; \
		sleep 5; done;
	@until \
		curl -s -o /dev/null -w 'hapi status %{http_code}\n' http://localhost:9090/healthz; \
		do echo "$(BLUE)hasura |$(RESET) waiting for hapi service"; \
		sleep 5; done;
	@docker-compose stop hasura
	@docker-compose up -d --build hasura
	@echo "done hasura"

hasura-cli:
	$(eval -include .env)
	@until \
		curl -s -o /dev/null -w 'hasura status %{http_code}\n' http://localhost:8080/healthz; \
		do echo "$(BLUE)hasura |$(RESET) waiting for hasura service"; \
		sleep 5; done;
	@cd hasura && hasura console --endpoint http://localhost:8080 --skip-update-check --no-browser --admin-secret $(HASURA_GRAPHQL_ADMIN_SECRET);

hasura-plant:
	$(eval -include .env)
	@cd hasura && hasura seeds apply --admin-secret $(HASURA_GRAPHQL_ADMIN_SECRET) --database-name default && echo "success!" || echo "failure!";

stop:
	@docker-compose stop

clean:
	@docker-compose stop
	@rm -rf tmp/hapi
	@docker rm postgres hasura hapi
	@docker volume rm crypto_postgres_data

docker-clean:
	@docker-compose stop
	@docker rm postgres hasura hapi
	@docker volume rm backend-boilerplate_postgres_data

build-docker-images: ##@devops Build docker images
build-docker-images:
	@echo "Building docker containers..."
	@for dir in $(SUBDIRS); do \
		$(MAKE) build-docker -C $$dir; \
	done

push-docker-images: ##@devops Publish docker images
push-docker-images:
	@echo $(DOCKER_PASSWORD) | docker login \
		--username $(DOCKER_USERNAME) \
		--password-stdin
	for dir in $(SUBDIRS); do \
		$(MAKE) push-image -C $$dir; \
	done
