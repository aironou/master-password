ARG WORKDIR=/master-password
ARG USER=node

FROM node:26-alpine AS base

ARG WORKDIR
ARG USER

RUN apk add git

WORKDIR $WORKDIR
USER $USER