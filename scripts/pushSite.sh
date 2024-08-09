#!/bin/sh

set -e

cp -r ./docs/export/* ../sui.github.io
touch ../sui.github.io/.nojekyll
cd ../sui.github.io
git add -A
git commit -m "chore: update site"
git push
