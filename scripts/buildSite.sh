#!/bin/sh
set -e

pnpm clean:build
rm -rf docs/.next
rm -rf "../sui.github.io/!(.git)"
pnpm i
pnpm build
pnpm proptypes
pnpm docs:api
pnpm docs:typescript:formatted
pnpm docs:build
