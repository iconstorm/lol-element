// @ts-check

import { render } from '../node_modules/lit-html/lit-html.js'

export { css } from './css.js'
export { html, svg } from '../node_modules/lit-html/lit-html.js'

/**
 * @typedef {object} ElementDefinitionObject
 * @property {string} name
 * @property {string[]|AttributeConfig[]} [attributes]
 * @property {(host: object) => object|string} [template]
 * @property {import('./css.js').CSSResult} [styles]
 * @property {ShadowRootInit} [shadowOptions]
 */

const identity = (/** @type any */x) => x

class AttributeConfig {
  /**
  * @param {object} config
  * @param {string} config.name - The name of the attribute
  * @param {boolean} [config.reflect=true] - Whether the attribute should be reflected in a property
  * @param {boolean} [config.boolean=false] - Whether the attribute is a boolean attriute
  * @param {(value: string|null) => any} [config.get]
  * @param {(value: any) => string} [config.set]
  */
  constructor ({ name, reflect = true, boolean = false, get = identity, set = identity }) {
    this.name = name
    this.reflect = reflect
    this.boolean = boolean
    this.get = get
    this.set = set
    this.propertyName = camelCase(name)
    this.callbackName = `${camelCase(name)}Changed`
  }
}

export class LolElement extends HTMLElement {
  constructor () {
    super()
    // @ts-ignore
    const { shadowOptions } = this.definition
    if (shadowOptions !== null) this.attachShadow(shadowOptions)
    this._renderRoot = this.shadowRoot || this
    this.setup()
  }

  /** Called at the end of `constructor`. */
  setup () { }
  /** Called at the end of `connectedCallback`. */
  connected () { }
  /** Called at `disconnectedCallback`. */
  disconnected () { }
  /**
   * Called on every `attributeChangedCallback`.
   *
   * @param {string} name - The name of the attribute that changed
   * @param {string} oldValue
   * @param {string} newValue
   */
  changed (name, oldValue, newValue) { }

  connectedCallback () {
    this._adoptStyles()
    this._update()
    this.connected()
  }

  disconnectedCallback () {
    this.disconnected()
  }

  /**
   * @param {string} name - The name of the attribute that changed
   * @param {string} oldValue
   * @param {string} newValue
   */
  attributeChangedCallback (name, oldValue, newValue) {
    // @ts-ignore
    const { callbackName } = this.attributeConfigMap.get(name)
    this.changed(name, oldValue, newValue)
    if (callbackName in this) {
      // @ts-ignore
      const changed = this[callbackName](oldValue, newValue)
      // Returning `false` from the callback skips update
      if (changed === false) return
    }
    this._update()
  }

  /**
   * Warning: when no shadowRoot is present, there is no "cleaning up":
   * styles are added and they stay forever
   */
  _adoptStyles () {
    // @ts-ignore
    const { styles, name } = this.definition
    if (styles == null) return
    const styleSheet = styles.styleSheet

    // Constructable Stylesheets supported
    if (styleSheet !== null && this.shadowRoot) {
      // @ts-ignore
      this.shadowRoot.adoptedStyleSheets = [styleSheet]
      return
    }
    if (styleSheet !== null && !this.shadowRoot) {
      // @ts-ignore
      if (document.adoptedStyleSheets.indexOf(styleSheet) > -1) return
      // @ts-ignore
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet]
      return
    }

    // No support
    const styleTag = document.createElement('style')
    styleTag.textContent = styles
    if (this.shadowRoot) {
      this.shadowRoot.appendChild(styleTag)
    } else {
      styleTag.id = `for-custom-element-${name}`
      if (document.getElementById(styleTag.id) !== null) return
      document.head.appendChild(styleTag)
    }
  }

  _update () {
    if (!this.isConnected) return
    // @ts-ignore
    const { template } = this.definition
    if (template == null) return
    const result = typeof template === 'function' ? template(this) : template
    this._render(result)
  }

  /**
   * Update the DOM.
   *
   * @param {object|string} templateResult - The output from the template function
   */
  _render (templateResult) {
    render(templateResult, this._renderRoot, { eventContext: this })
  }

  /**
   * Fire a custom event.
   *
   * @param {string} eventName - The name of the custom event
   * @param {any} detail - The detail property in the event
   * @param {CustomEventInit} options
   */
  emit (eventName, detail, options = {}) {
    const defaults = {
      bubbles: true,
      cancelable: true
    }
    const event = new CustomEvent(eventName, {
      detail: detail,
      ...defaults,
      ...options
    })
    this.dispatchEvent(event)
  }

  /**
   * @param {Function} Component - The custom element class
   */
  static define (Component) {
    /** @type ElementDefinitionObject */
    // @ts-ignore
    const definition = Component.definition

    if (!definition) {
      throw new Error(`'definition' object missing: ${Component.name}.`)
    }
    if (!definition.name) {
      throw new Error(`A name for the custom element is missing in the 'definition' object: ${Component.name}.`)
    }
    if (typeof definition.shadowOptions === 'undefined') {
      definition.shadowOptions = { mode: 'open' }
    }

    const attributes = defineGettersAndSettersForAttributes(
      Component,
      definition.attributes || []
    )
    Object.defineProperty(Component, 'observedAttributes', {
      get () { return attributes.map(x => x.name) }
    })
    Object.defineProperties(Component.prototype, {
      definition: {
        enumerable: false,
        get () { return definition }
      },
      attributeConfigMap: {
        enumerable: false,
        get () {
          return attributes.reduce((map, x) => map.set(x.name, x), new Map())
        }
      }
    })

    // @ts-ignore
    customElements.define(definition.name, Component)
  }
}

/**
 * Defines getters/setters properties for observed attributes.
 *
 * @param {Function} Component
 * @param {Array<string|AttributeConfig>} attributes
 * @returns AttributeConfig[]
 */
function defineGettersAndSettersForAttributes (Component, attributes) {
  const normalized = attributes.map(
    nameOrConfig => new AttributeConfig(typeof nameOrConfig === 'string' ? { name: nameOrConfig } : nameOrConfig)
  )

  normalized.forEach(config => {
    if (config.reflect === false) return
    const { name, propertyName, boolean, get, set } = config
    const current = Object.getOwnPropertyDescriptor(Component.prototype, propertyName)

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
        return get(this.getAttribute(name))
      },
      /** @this HTMLElement */
      set: function (/** @type any */value) {
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

/**
 * @param {string} str
 * @returns {string}
 */
function camelCase (str) {
  const re = /[-_]\w/ig
  return str.replace(re, (match) => {
    return match[1].toUpperCase()
  })
}
