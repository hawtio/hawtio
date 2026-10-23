/* eslint-disable no-console */

import { readFileSync, writeFileSync, globSync as glob } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const PLACEHOLDER = '__HAWTIO_VERSION_PLACEHOLDER__'

// Resolve paths relative to this script's own location so it works regardless
// of the working directory from which it is invoked.
const __base = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkgJsonPath = resolve(__base, './package.json')

const version = process.argv.length > 2 ? process.argv[2] : JSON.parse(readFileSync(pkgJsonPath, 'utf8').toString()).version
console.info('Setting package version to', version)

let files = process.argv.slice(3) ?? []
files = files.flatMap(file => {
  return glob(file, { cwd: __base })
})
for (const file of files) {
  const distPath = resolve(__base, file)
  const original = readFileSync(distPath, 'utf8').toString()

  if (!original.includes(PLACEHOLDER)) {
    continue
  }

  const replaced = original.replaceAll(PLACEHOLDER, version)
  writeFileSync(distPath, replaced, 'utf8')
  console.log(`Replaced ${PLACEHOLDER} with ${version} in ${distPath}`)
}
