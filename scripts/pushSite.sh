#!/bin/sh

set -e

cp -r ./docs/export/* ../stoked-ui.github.io
touch ../stoked-ui.github.io/.nojekyll
cd ../stoked-ui.github.io
git add -A
git commit -m "chore: update site"
git push
