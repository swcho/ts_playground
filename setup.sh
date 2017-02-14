#!/bin/bash

WHICH_GRUNT=`which grunt`
export GRUNT=`readlink -f $WHICH_GRUNT`
code .
