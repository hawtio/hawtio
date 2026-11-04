const fs = require('node:fs')
console.info('================= !!!')
console.info('platform:', process.platform)
console.info('architecture:', process.arch)
console.info('================= !!!')

const bindingFile = fs.readFileSync('node_modules/@swc/core/binding.js', { encoding: 'utf8' })
console.info('node_modules/@swc/core/binding.js\n=======\n', bindingFile, '\n=======\n')
try {
  console.info('trying ./swc.linux-x64-gnu.node')
  const swc_linux_x64_gnu_node = require('./node_modules/@swc/core/swc.linux-x64-gnu.node')
  console.info('result:', swc_linux_x64_gnu_node)
} catch (e) {
  console.error('error:', e)
}
try {
  console.info('trying @swc/core-linux-x64-gnu')
  const swc_core_linux_x64_gnu = require('@swc/core-linux-x64-gnu')
  console.info('result:', swc_core_linux_x64_gnu)
} catch (e) {
  console.error('error:', e)
}
