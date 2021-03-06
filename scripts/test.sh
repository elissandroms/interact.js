#!/bin/sh
PKG_DIR=$(dirname $(readlink -f $0))/..

export PATH=$PKG_DIR/node_modules/.bin:$PWD/node_modules/.bin:$PATH
export NODE_ENV=test
export TS_NODE_TRANSPILE_ONLY=${TS_NODE_TRANSPILE_ONLY:-0}
export TS_NODE_PRETTY=${TS_NODE_PRETTY:-1}
export TS_NODE_COMPILER_OPTIONS=${TS_NODE_COMPILER_OPTIONS:-"{ \"module\": \"commonjs\" }"}

report=0

! [[ -n $TEST_RUNNER ]] && {
  report=1
  TEST_RUNNER=nyc
  TEST_RUNNER_ARGS=${TEST_RUNNER_ARGS:=--silent}
  EXEC_COMMAND=${EXEC_COMMAND:=node}
}

NODE_ENV=test $TEST_RUNNER $TEST_RUNNER_ARGS \
  $EXEC_COMMAND \
  --require ts-node/register \
  --require $PKG_DIR/packages/types/index.ts \
  $PKG_DIR/test/all.ts $@ |
  tap-spec

test_code=$?

if [ $report == 1 ]; then
  nyc report; nyc check-coverage
fi

exit $test_code
