ARG NODEJS_VERSION=22
ARG DEBIAN_VERSION=trixie
ARG BASE_IMAGE=node:${NODEJS_VERSION}-${DEBIAN_VERSION}-slim
ARG TARGET_IMAGE_PLATFORM=linux/amd64

ARG OBSIDIAN_VERSION=1.9.14
ARG OBSIDIAN_APPIMAGE_FILE=Obsidian-${OBSIDIAN_VERSION}.AppImage

FROM busybox:latest AS obsidian-downloader
ARG OBSIDIAN_VERSION
ARG OBSIDIAN_APPIMAGE_FILE
RUN wget https://github.com/obsidianmd/obsidian-releases/releases/download/v${OBSIDIAN_VERSION}/${OBSIDIAN_APPIMAGE_FILE}

FROM ${BASE_IMAGE} AS obsidian-extractor-amd64
ARG OBSIDIAN_APPIMAGE_FILE
COPY --from=obsidian-downloader /${OBSIDIAN_APPIMAGE_FILE} /${OBSIDIAN_APPIMAGE_FILE}
RUN chmod +x ${OBSIDIAN_APPIMAGE_FILE}
RUN ./${OBSIDIAN_APPIMAGE_FILE} --appimage-extract

# `--appimage-extract` won't work on Apple Silicon, hence using a special extraction stage
FROM --platform=${TARGET_IMAGE_PLATFORM} ${BASE_IMAGE} AS obsidian-extractor-arm64
ARG OBSIDIAN_APPIMAGE_FILE
RUN apt-get update && \
    apt-get install -y squashfs-tools && \
    rm -rf /var/lib/apt/lists/*
COPY --from=obsidian-downloader /${OBSIDIAN_APPIMAGE_FILE} /${OBSIDIAN_APPIMAGE_FILE}
RUN offset=$(grep -aob 'hsqs' ${OBSIDIAN_APPIMAGE_FILE} | tail -n1 | cut -d: -f1) && \
dd if=${OBSIDIAN_APPIMAGE_FILE} of=image.squashfs bs=4M iflag=skip_bytes,count_bytes skip=$offset status=progress && \
unsquashfs image.squashfs

FROM obsidian-extractor-${TARGETARCH} AS obsidian-extractor

FROM --platform=${TARGET_IMAGE_PLATFORM} ${BASE_IMAGE}
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
