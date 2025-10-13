ARG NODEJS_VERSION=22
ARG BASE_IMAGE=node:${NODEJS_VERSION}-slim

ARG OBSIDIAN_VERSION=1.9.14
ARG OBSIDIAN_APPIMAGE_FILE=Obsidian-${OBSIDIAN_VERSION}.AppImage

FROM busybox:latest AS obsidian-downloader
ARG OBSIDIAN_VERSION
ARG OBSIDIAN_APPIMAGE_FILE
RUN wget https://github.com/obsidianmd/obsidian-releases/releases/download/v${OBSIDIAN_VERSION}/${OBSIDIAN_APPIMAGE_FILE}
RUN chmod +x ${OBSIDIAN_APPIMAGE_FILE}

FROM ${BASE_IMAGE} AS obsidian-extractor
ARG OBSIDIAN_APPIMAGE_FILE
COPY --from=obsidian-downloader /${OBSIDIAN_APPIMAGE_FILE} /${OBSIDIAN_APPIMAGE_FILE}
RUN LIBZ_PATH=$(ldconfig -p | grep 'libz.so.1 ' | awk '{print $NF}' | head -n1) && \
    ln -s "$LIBZ_PATH" "$(dirname "$LIBZ_PATH")/libz.so"
RUN ./${OBSIDIAN_APPIMAGE_FILE} --appimage-extract

FROM ${BASE_IMAGE}
RUN apt-get update && \
    apt-get install -y --no-install-recommends --no-install-suggests \
      libgtk-3-0 libnss3 libgbm1 libasound2 \
      xvfb xauth && \
    rm -rf /var/lib/apt/lists/*

COPY --from=obsidian-extractor /squashfs-root /obsidian

RUN corepack enable pnpm

WORKDIR /plugin
CMD pnpm i && cd e2e && pnpm i && xvfb-run pnpm run test
