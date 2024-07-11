#!/usr/bin/env bash
set -e

# start vedaccio as local npm registry in the background
# If it is already running it will fail to start, that is ok
verdaccio &

# publish freon
npm run build-release
npm run unpublish-local
npm run publish-local

# checkout and build example project
mkdir -p ../tmp
cd ../tmp
rm -rf Freon-example
git clone https://github.com/freon4dsl/Freon-example.git
cd Freon-example
git checkout 0.6.0
npm run install-local
npm run generate
# yarn build
npm run model-server &
npm run prepare-app
npm run dev
