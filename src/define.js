export function define (Component, definition) {
  definition = definition || Component.definition

  if (!definition) throw new Error('`definition` missing')
  if (!definition.name) throw new Error('Element name missing')

  if (typeof definition.shadowOptions === 'undefined') {
    definition.shadowOptions = { mode: 'open' }
  }

  const attributes = defineGettersAndSettersForAttributes(
    Component,
    definition.attributes
  )

  Object.defineProperty(Component, 'observedAttributes', {
    get () { return attributes.map(x => x.name) }
  })

  Component.definition = definition
  Component.attributes = attributes.reduce((map, x) => map.set(x.name, x), new Map())

  customElements.define(definition.name, Component)
}

/**
 * This is the "meat" of the attributes/props logic
 * @todo explain the reasoning behind this
 * @param {*} Component
 * @param {*} attributes
 * @returns
 */
function defineGettersAndSettersForAttributes (Component, attributes = []) {
  const normalized = attributes.map(normalizeAttribute)

  normalized.forEach(config => {
    if (config.reflect === false) return
    const { name, propertyName, boolean, get, set } = config
    const current = Object.getOwnPropertyDescriptor(Component.prototype, propertyName)

    // getter/setter already exist, do nothing
    if (current && current.get && current.set) return

    const descriptor = {
      enumerable: false,
      configurable: true,
      get: function () {
        if (boolean) {
          return this.hasAttribute(name)
        }
        return get(this.getAttribute(name))
      },
      set: function (value) {
        if (boolean) {
          value ? this.setAttribute(name, '') : this.removeAttribute(name)
        } else {
          this.setAttribute(name, set(value))
        }
      }
    }

    // Allow "overwriting" only one
    if (current && current.get) descriptor.get = current.get
    if (current && current.set) descriptor.set = current.set

    Object.defineProperty(Component.prototype, propertyName, descriptor)
  })

  return normalized
}

/*
  attribute: {
    name: String,
    reflect: true,
    boolean: false,
    get: (str) => any
    set: (any) => str
  }
*/

function normalizeAttribute (nameOrConfig) {
  const defaults = {
    reflect: true,
    boolean: false,
    get: x => x,
    set: x => x
  }
  if (typeof nameOrConfig === 'string') {
    nameOrConfig = { name: nameOrConfig }
  }

  return {
    ...defaults,
    propertyName: camelCase(nameOrConfig.name),
    callbackName: `${camelCase(nameOrConfig.name)}Changed`,
    ...nameOrConfig
  }
}

function camelCase (str) {
  const re = /[-_]\w/ig
  return str.replace(re, (match) => {
    return match[1].toUpperCase()
  })
}
