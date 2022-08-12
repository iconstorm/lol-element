import { supportsAdoptingStyleSheets } from './css.js'

// TODO finish JSDoc and add some nice Backbone.js-style comments to each exported function

const identity = (/** @type any */x) => x

export function attachShadow (host, options = {}) {
  let { shadowOptions, template } = options
  if (host.shadowRoot != null) return // SSR
  if (shadowOptions === undefined) {
    shadowOptions = host.constructor.shadowOptions
  }
  if (shadowOptions === undefined) {
    shadowOptions = { mode: 'open' }
  }
  host.attachShadow(shadowOptions)
  template = template ?? host.constructor.template
  if (template != null) {
    if (host.shadowRoot) {
      host.shadowRoot.appendChild(template.content.cloneNode(true))
    }
  }
}

/**
 * @param {object} proto
 * @param {Array<string|AttributeConfig>} attributes
 * @returns string[]
 */
export function defineAttributes (proto, attributes = []) {
  const normalized = attributes.map(
    nameOrConfig => new AttributeConfig(typeof nameOrConfig === 'string' ? { name: nameOrConfig } : nameOrConfig)
  )
  // Really?
  proto.__attributes = normalized

  normalized.forEach(config => {
    if (config.reflect === false) return
    const { name, propertyName, boolean, read, write, fallbackValue } = config
    const current = Object.getOwnPropertyDescriptor(proto, propertyName)

    // getter/setter already exist, do nothing
    if (current && current.get && current.set) return

    const descriptor = {
      enumerable: false,
      configurable: true,
      /** @this HTMLElement */
      get: function () {
        if (boolean) {
          return this.hasAttribute(name)
        }
        if (this.getAttribute(name) == null && fallbackValue !== undefined) {
          return fallbackValue
        }
        return read(this.getAttribute(name))
      },
      /** @this HTMLElement */
      set: function (/** @type any */value) {
        if (boolean) {
          value ? this.setAttribute(name, '') : this.removeAttribute(name)
        } else {
          this.setAttribute(name, write(value))
        }
      }
    }

    // Allow "overwriting" only one
    if (current && current.get) descriptor.get = current.get
    if (current && current.set) descriptor.set = current.set

    Object.defineProperty(proto, propertyName, descriptor)
  })

  return normalized.map(x => x.name)
}

class AttributeConfig {
  /**
   * @param {object} config
   * @param {string} config.name - The name of the attribute
   * @param {boolean} [config.reflect=true] - Whether the attribute should be reflected in a property
   * @param {boolean} [config.boolean=false] - Whether the attribute is a boolean type of attribute (https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Getting_started#boolean_attributes)
   * @param {(value: string|null) => any} [config.read]
   * @param {(value: any) => string} [config.write]
   * @param {any} [config.fallbackValue] - The value returned by the property getter when the attribute is missing
   */
  constructor ({
    name,
    reflect = true,
    boolean = false,
    read = identity,
    write = identity,
    fallbackValue = undefined
  }) {
    this.name = name
    this.reflect = reflect
    this.boolean = boolean
    this.read = read
    this.write = write
    this.fallbackValue = fallbackValue
    this.propertyName = camelCase(name)
  }
}

/**
 * @param {*} host
 * @param {*} styles
 */
export function adoptStyles (host, styles) {
  styles = styles ?? host.constructor.styles
  if (styles == null) return
  if (supportsAdoptingStyleSheets) {
    host.shadowRoot.adoptedStyleSheets = [styles.styleSheet]
  } else {
    const styleTag = document.createElement('style')
    styleTag.textContent = styles.toString()
    host.shadowRoot.appendChild(styleTag)
  }
}

/**
 * @param {Object} host
 * @param {string} name - The name of the attribute that changed
 * @param {string} [oldValue]
 * @param {string} [newValue]
 */
export function firePropChangedCallbacks (host, name, oldValue, newValue) {
  const callbackName = `${camelCase(name)}Changed`
  if (callbackName in host) {
    this[callbackName](oldValue, newValue)
  }
}

/**
 * Helper to fire a custom event.
 *
 * @param {Object} host
 * @param {string} eventName - The name of the custom event
 * @param {any} detail - The detail property in the event
 * @param {CustomEventInit} options
 */
export function emitCustomEvent (host, eventName, detail, options = {}) {
  const defaults = {
    bubbles: true,
    cancelable: true
  }
  const event = new CustomEvent(eventName, {
    detail: detail,
    ...defaults,
    ...options
  })
  host.dispatchEvent(event)
}

/**
 * @param {string} string
 * @returns {string}
 */
function camelCase (string) {
  const re = /[-_]\w/ig
  return string.replace(re, (match) => {
    return match[1].toUpperCase()
  })
}

export function html (strings, ...values) {
  const htmlText = values.reduce(
    (acc, value, i) => acc + htmlTextFromTemplate(value) + strings[i + 1],
    strings[0]
  )
  const template = document.createElement('template')
  template.innerHTML = htmlText
  return template
}

function htmlTextFromTemplate (value) {
  if (value instanceof HTMLTemplateElement) {
    return value.innerHTML
  }
  // throw new Error(`Value passed to 'tmpl' function must be a template element: ${value}.`)
  return value
}
