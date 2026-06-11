#!/bin/sh
# Wrapper that runs mocha via Node 20 when available (yargs@16 breaks on Node 26+).
# Falls back to system node for CI environments that already run Node 20.
NODE20="$HOME/.nvm/versions/node/v20.20.0/bin/node"
if [ -f "$NODE20" ]; then
  exec "$NODE20" ./node_modules/mocha/bin/mocha.js "$@"
else
  exec node ./node_modules/mocha/bin/mocha.js "$@"
fi
