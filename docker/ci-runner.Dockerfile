ARG NODEJS_VERSION=24
ARG DEBIAN_VERSION=trixie
ARG BASE_IMAGE=node:${NODEJS_VERSION}-${DEBIAN_VERSION}-slim
ARG TARGET_IMAGE_PLATFORM=linux/amd64

ARG OBSIDIAN_VERSION=1.12.7
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

FROM mcr.microsoft.com/devcontainers/javascript-node:24 AS devcontainer

RUN apt-get update \
    && apt-get install -y --no-install-recommends --no-install-suggests \
        libnspr4 \
        libnss3 \
        libdbus-1-3 \
        libatk1.0-0 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libgtk-3-0 \
        libgbm1 \
        libasound2 \
        xvfb \
        xauth \
      # 'x11-xserver-utils' contains xrandr
      x11-xserver-utils \
    && rm -rf /var/lib/apt/lists/*

# For opening .AppImage files
#RUN apt-get update && \
#    apt-get install -y --no-install-recommends \
#      libfuse2 \
#      fuse3 \
#    && rm -rf /var/lib/apt/lists/*

# minimalistic window/file-manager
# RUN #apt-get update \
#    && apt-get install -y --no-install-recommends \
#      openbox \
#      pcmanfm \
#    && rm -rf /var/lib/apt/lists/*

USER node

COPY --chown=node:root --from=obsidian-extractor /squashfs-root /workspaces/obsidian-appimage-extracted

ENV OBSIDIAN_BINARY_PATH=/workspaces/obsidian-appimage-extracted/obsidian
ENV DISPLAY=:1

RUN mkdir -p /home/node/Desktop

# Extracted version (основная, которую используешь для разработки)
COPY --chown=node:node --chmod=755 <<'EOF' /home/node/Desktop/obsidian-extracted.desktop
[Desktop Entry]
Version=1.0
Type=Application
Name=Obsidian (Extracted)
Exec=/opt/obsidian-appimage-extracted/obsidian
Icon=/opt/obsidian-appimage-extracted/obsidian.png
Terminal=false
EOF

# AppImage version (для сравнения/тестирования)
#COPY <<'EOF' /home/node/Desktop/obsidian-appimage.desktop
#[Desktop Entry]
#Version=1.0
#Type=Application
#Name=Obsidian (AppImage)
#Exec=/obsidian-appimage-extracted/../Obsidian.AppImage
#Icon=/obsidian-appimage-extracted/obsidian.png
#Terminal=false
#EOF

RUN chmod +x /home/node/Desktop/*.desktop

FROM --platform=${TARGET_IMAGE_PLATFORM} ${BASE_IMAGE} AS ci-image
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
CMD ["sh", "-c", "pnpm i && cd e2e && xvfb-run pnpm run test"]
