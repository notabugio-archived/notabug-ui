#!/bin/bash

docker stop notabug
docker rm notabug

docker run \
  -p 3001:3001 \
  -p 3002:3002 \
  -p 3003:3003 \
  --name notabug \
  notabug
