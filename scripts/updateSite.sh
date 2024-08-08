#!/bin/sh

pnpm clean
rm -rf ../sui.github.io/*
pnpm i -f
pnpm build:full
pnpm docs:typescript:formatted
cp -r ./docs/export/* ../sui.github.io
cd ../sui.github.io
