#!/bin/bash

WHICH_GRUNT=`which grunt`
export GRUNT=$WHICH_GRUNT

WHICH_NODE=`which node`
export NODE=$WHICH_NODE

code .
npm run watch_tasks
