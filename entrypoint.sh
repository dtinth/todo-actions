#!/bin/sh

# TODO: Once precompilation is done, run the compiled script directly.
#
# ```
# sh -c "node /app/lib/main.js $*"
# ```
#
sh -c "cd /app && yarn ts-node $*"