// components/index.js
const components = import.meta.glob('./*.vue', { eager: true })

const exports = {}

for (const path in components) {
  const name = path.match(/\.\/(.*)\.vue$/)[1]
  exports[name] = components[path].default
}

export default exports
