#!/bin/bash

set -e

DIST_BRANCH='gh-pages'
DIST_OUT='dist/client'

GIT_REPO_ROOT=$(git rev-parse --show-toplevel)
if [ "$GIT_REPO_ROOT" != "$PWD" ]; then
  echo "Should run this script in the repository root";
  exit 1;
fi

GIT_BRANCH_NAME=$(git symbolic-ref HEAD 2>/dev/null)
if [ "$GIT_BRANCH_NAME" != "refs/heads/master" ]; then
  echo "Should checkout master branch";
  exit 1;
fi

if [[ -n $(git status -s) ]]; then
  echo "Should be clean";
  exit 1;
fi

if [[ -n $(git log origin/master..master) ]]; then
  echo "Should be pushed to master";
  exit 1;
fi

# Update remote commits
git remote update

# Get hash
LAST_HASH=$(git rev-parse HEAD)

echo "Commit $LAST_HASH will be distributed"

# Check out to dist branch
git checkout $DIST_BRANCH

# Rebase against master
git rebase master

# Reset to last commit
git reset --hard $LAST_HASH

# Build
npm run build

# Add built files
git add $DIST_OUT

# Commit
git commit -am "Built"

# Push
git push -f

# Back to master
git checkout master

echo "FINISHED"
