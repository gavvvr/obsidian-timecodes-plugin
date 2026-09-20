ARG NODEJS_VERSION=24
ARG DEBIAN_VERSION=trixie
ARG BASE_IMAGE=node:${NODEJS_VERSION}-${DEBIAN_VERSION}-slim
ARG TARGET_IMAGE_PLATFORM=linux/amd64

ARG OBSIDIAN_VERSION=1.13.7
ARG OBSIDIAN_APPIMAGE_FILE=Obsidian-${OBSIDIAN_VERSION}.AppImage

FROM alpine:3 AS downloader
RUN apk add --no-cache \
    curl \
    jq
ARG OBSIDIAN_VERSION
ARG OBSIDIAN_APPIMAGE_FILE
RUN curl -sSL -O https://github.com/obsidianmd/obsidian-releases/releases/download/v${OBSIDIAN_VERSION}/${OBSIDIAN_APPIMAGE_FILE}
ARG TARGET_IMAGE_PLATFORM

RUN --mount=type=bind,source=package.json,target=/tmp/package.json sh <<'EOF'
set -euo pipefail

case "${TARGET_IMAGE_PLATFORM}" in
linux/amd64) PNPM_ARCH="x64" ;;
linux/arm64) PNPM_ARCH="arm64" ;;
*)
  echo "ERROR: Unsupported architecture ${TARGETARCH}" >&2
  exit 1
  ;;
esac

WANTED_PNPM_MAJOR=$(jq -r '.devEngines.packageManager.version // empty' /tmp/package.json | grep -oE '[0-9]+' | head -1)
if [ -z "$WANTED_PNPM_MAJOR" ]; then
  echo "ERROR: Could not parse pnpm major version from package.json" >&2
  exit 1
fi
echo "Target pnpm major version: v${WANTED_PNPM_MAJOR}.x"

LATEST_PNPM_VERSION=$(curl -fsSL -H "Accept: application/vnd.npm.install-v1+json" \
  https://registry.npmjs.org/pnpm |
  jq -r --arg prefix "${WANTED_PNPM_MAJOR}." '
        (.versions // {})
        | [ keys[]? | select(startswith($prefix) and (contains("-") | not)) ]
        | if length == 0 then
            "not_found"
          else
            map(split(".") | map(tonumber)) | max | join(".")
          end
         ')

if [ "$LATEST_PNPM_VERSION" = "not_found" ]; then
  echo "ERROR: Failed to resolve latest pnpm ${WANTED_PNPM_MAJOR}.x version" >&2
  exit 1
fi
echo "Resolved pnpm version: ${LATEST_PNPM_VERSION}"

DL_URL="https://github.com/pnpm/pnpm/releases/download/v${LATEST_PNPM_VERSION}"
curl -fsSL "${DL_URL}/pnpm-linux-${PNPM_ARCH}.tar.gz" | tar -xzf -
EOF

FROM ${BASE_IMAGE} AS obsidian-extractor-amd64
ARG OBSIDIAN_APPIMAGE_FILE
COPY --from=downloader /${OBSIDIAN_APPIMAGE_FILE} /${OBSIDIAN_APPIMAGE_FILE}
RUN chmod +x ${OBSIDIAN_APPIMAGE_FILE}
RUN ./${OBSIDIAN_APPIMAGE_FILE} --appimage-extract

# `--appimage-extract` won't work on Apple Silicon, hence using a special extraction stage
FROM --platform=${TARGET_IMAGE_PLATFORM} ${BASE_IMAGE} AS obsidian-extractor-arm64
ARG OBSIDIAN_APPIMAGE_FILE
RUN apt-get update && \
    apt-get install -y squashfs-tools && \
    rm -rf /var/lib/apt/lists/*
COPY --from=downloader /${OBSIDIAN_APPIMAGE_FILE} /${OBSIDIAN_APPIMAGE_FILE}
RUN offset=$(grep -aob 'hsqs' ${OBSIDIAN_APPIMAGE_FILE} | tail -n1 | cut -d: -f1) && \
dd if=${OBSIDIAN_APPIMAGE_FILE} of=image.squashfs bs=4M iflag=skip_bytes,count_bytes skip=$offset status=progress && \
unsquashfs image.squashfs

FROM obsidian-extractor-${TARGETARCH} AS obsidian-extractor

FROM --platform=${TARGET_IMAGE_PLATFORM} ${BASE_IMAGE} AS ci-image
RUN apt-get update && \
    apt-get install -y --no-install-recommends --no-install-suggests \
      libgtk-3-0 libnss3 libgbm1 libasound2 \
      xvfb xauth && \
    rm -rf /var/lib/apt/lists/*

COPY --from=obsidian-extractor /squashfs-root /obsidian-appimage-extracted

ENV OBSIDIAN_BINARY_PATH=/obsidian-appimage-extracted/obsidian
ENV OBSIDIAN_NO_SANDBOX=true

COPY --from=downloader /pnpm /usr/local/bin/pnpm

# for running locally as: docker run --rm -it -v ${PWD}:/plugin local-ci-runner
WORKDIR /plugin
CMD ["sh", "-c", "pnpm i && xvfb-run pnpm run test:e2e"]
