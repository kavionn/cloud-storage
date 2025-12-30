FROM node:20.19.1

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends git ca-certificates && \
    rm -rf /var/lib/apt/lists/*

ARG CACHEBUST=1

RUN --mount=type=secret,id=GITHUB_REPO,required=true \
    git clone $(cat /run/secrets/GITHUB_REPO) --depth=1 .

RUN yarn install
RUN yarn build

RUN chown -R node:node /app
USER node

EXPOSE 7860
CMD ["yarn", "start"]
