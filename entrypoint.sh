#!/bin/sh

# TODO [$5d2dbb5044a917000799b4f9]: Once precompilation is done, run the compiled script directly.
#
# ```
# sh -c "node /app/lib/main.js $*"
# ```
#
sh -c "/app/node_modules/.bin/ts-node /app/src/main.ts $*"