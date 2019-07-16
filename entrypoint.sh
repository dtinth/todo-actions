#!/bin/sh

# TODO [#4]: Once precompilation is done, run the compiled script directly.
#
# ```
# sh -c "node /app/lib/main.js $*"
# ```
#
sh -c "/app/node_modules/.bin/ts-node /app/src/main.ts $*"