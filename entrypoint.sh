#!/bin/sh

# TODO [$5d2df603d0b2e60007407249]: Once precompilation is done, run the compiled script directly.
#
# ```
# sh -c "node /app/lib/main.js $*"
# ```
#
sh -c "/app/node_modules/.bin/ts-node /app/src/CLIEntrypoint.ts $*"