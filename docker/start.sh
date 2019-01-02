#!/bin/bash

docker stop notabug
docker rm notabug

docker run \
  -p 3333:3333 \
  --name notabug \
  notabug
