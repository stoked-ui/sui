#!/usr/bin/env node

import IndexAutogen from './indexAutogen'

const dir = process.argv.slice(2)?.[0];

IndexAutogen(dir ?? process.cwd())
