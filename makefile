# The medical bigdata web makefile

.SILENT:
.PHONY: build startlocal startdev

# Make configs
SHELL := /bin/bash

# Check Output
ifndef CI_OUTPUT
	CI_OUTPUT := ./dist
endif

# Get a build version
ifndef CI_BRANCH
	CI_BRANCH := 
endif

ifndef CI_COMMIT
	CI_COMMIT := 
endif

ifndef CI_TIME
	CI_TIME := 
endif

ifndef CI_TAG
	CI_TAG := 
endif

VERSION := Branch [$(CI_BRANCH)] Commit [$(CI_COMMIT)] Time [$(CI_TIME)] Tag [$(CI_TAG)]

build:
	@echo Version: $(VERSION)
	@echo Output: $(CI_OUTPUT)
	cd src && gulp
	mv src/dist $(CI_OUTPUT) 

init:
	echo Initialize repository
	cd src && npm install --registry=http://registry.npm.taobao.org

startlocal:
	openweb-server --config config/dev.yaml --web-root src/dist/ --openapi-host 192.168.100.40 --openapi-port 8000 --option feedback.showWeiXinCode=false --option title=医疗大数据平台

