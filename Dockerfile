FROM node:10 as nab-deps
expose 3333
expose 3334

LABEL description="notabug dev"
LABEL version="0.1"
LABEL maintainer "me@go1dfish.me"

WORKDIR /notabug
ADD . /notabug
RUN cp /notabug/server-config.json.example /notabug/server-config.json
RUN yarn

FROM nab-deps as nab
# changing BUILDNUM will break the cache here
ARG BUILDNUM=unknown
RUN yarn build

ENTRYPOINT ["node", "/notabug/server.js", "--host", "0.0.0.0", "--port", "3333"]
