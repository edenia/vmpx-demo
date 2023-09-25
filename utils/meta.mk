-include .env

VERSION ?= $(shell git rev-parse --short HEAD)
CURRENT_BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD)

IMAGE_NAME_HAPI=vmpx-demo-hapi
IMAGE_NAME_HASURA=vmpx-demo-hasura
IMAGE_NAME_WEBAPP=webapp-vmpx-demo

DOCKER_REGISTRY=ghcr.io/edenia/vmpx-demo
SUBDIRS = hapi hasura webapp

MAKE_ENV += DOCKER_REGISTRY VERSION IMAGE_NAME_HAPI IMAGE_NAME_HASURA IMAGE_NAME_WEBAPP

SHELL_EXPORT := $(foreach v,$(MAKE_ENV),$(v)='$($(v))')

ifneq ("$(wildcard .env)", "")
	export $(shell sed 's/=.*//' .env)
endif