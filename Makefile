#!/bin/make -f
SHELL=/bin/sh

DC = docker compose
DC_CLI = $(DC) run --rm cli

.PHONY: dist
dist: node_modules
	$(DC_CLI) run build

.PHONY: cli
cli:
	$(DC) run --entrypoint '' --rm cli sh

js/master-password.min.js: node_modules
	$(DC_CLI) run build:js

css/master-password.min.css: node_modules
	$(DC_CLI) run build:css

node_modules:
	$(DC_CLI) install