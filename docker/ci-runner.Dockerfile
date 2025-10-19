ARG NODEJS_VERSION=22
ARG DEBIAN_VERSION=trixie
ARG BASE_IMAGE=node:${NODEJS_VERSION}-${DEBIAN_VERSION}-slim

ARG OBSIDIAN_VERSION=1.9.14
ARG OBSIDIAN_APPIMAGE_FILE=Obsidian-${OBSIDIAN_VERSION}.AppImage

FROM busybox:latest AS obsidian-downloader
ARG OBSIDIAN_VERSION
ARG OBSIDIAN_APPIMAGE_FILE
RUN wget https://github.com/obsidianmd/obsidian-releases/releases/download/v${OBSIDIAN_VERSION}/${OBSIDIAN_APPIMAGE_FILE}

FROM ${BASE_IMAGE} AS obsidian-extractor
ARG OBSIDIAN_APPIMAGE_FILE
COPY --from=obsidian-downloader /${OBSIDIAN_APPIMAGE_FILE} /${OBSIDIAN_APPIMAGE_FILE}
RUN chmod +x ${OBSIDIAN_APPIMAGE_FILE}
RUN ./${OBSIDIAN_APPIMAGE_FILE} --appimage-extract

FROM ${BASE_IMAGE}
RUN apt-get update && \
    apt-get install -y --no-install-recommends --no-install-suggests \
      libgtk-3-0 libnss3 libgbm1 libasound2 \
      xvfb xauth && \
    rm -rf /var/lib/apt/lists/*

COPY --from=obsidian-extractor /squashfs-root /obsidian-appimage-extracted

ENV OBSIDIAN_BINARY_PATH=/obsidian-appimage-extracted/obsidian
ENV OBSIDIAN_NO_SANDBOX=true

RUN corepack enable pnpm

# for running locally as: docker run --rm -it -v ${PWD}:/plugin local-ci-runner
WORKDIR /plugin
CMD ["sh", "-c", "pnpm i && cd e2e && pnpm i && xvfb-run pnpm run test"]
