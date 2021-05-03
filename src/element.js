// @ts-check

export class LolElementBase extends HTMLElement {
  /**
   * @returns {ShadowRootInit|null}
   */
  static get shadowOptions () {
    return { mode: 'open' }
  }

  /**
   * @returns {import('./css').CSSResult|null}
   */
  static get styles () {
    return null
  }

  /**
   * @returns {AttributeConfig[]}
   */
  static get attributes () {
    return []
  }

  static get observedAttributes () {
    const attributes = defineGettersAndSettersForAttributes(
      this.prototype,
      this.attributes
    )
    return attributes.map(x => x.name)
  }

  constructor () {
    super()
    // @ts-ignore
    const { shadowOptions } = this.constructor
    if (shadowOptions !== null) this.attachShadow(shadowOptions)
    this._renderRoot = this.shadowRoot || this
    this.setup()
  }

  setup () { }
  connected () { }
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
    const callbackName = `${camelCase(name)}Changed`
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
   * Render the styles for the component. Handles both shadow, and no shadow DOM (naively).
   *
   * Warning: when no shadowRoot is present, there is no "cleaning up":
   * styles are added and they stay forever
   */
  _adoptStyles () {
    // @ts-ignore
    const { name, styles } = this.constructor
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
    styleTag.textContent = styles.toString()
    if (this.shadowRoot) {
      this.shadowRoot.appendChild(styleTag)
    } else {
      styleTag.setAttribute('data-custom-element', name)
      if (document.getElementById(styleTag.id) !== null) return
      document.head.appendChild(styleTag)
    }
  }

  /**
   * Execute the template method and call `_render`.
   */
  _update () {
    if (!this.isConnected) return
    this._render(this.template(this))
  }

  /**
   * @param {Object} host
   */
  template (host) {
    return null
  }

  /**
   * Update the DOM.
   *
   * @param {object|string} templateResult - The output from the template function
   */
  _render (templateResult) {
    throw new Error('The _render method is not defined.')
  }

  /**
   * Helper to fire a custom event.
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
}

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
  }
}

/**
 * Defines getters/setters properties for observed attributes.
 *
 * @param {Object} proto
 * @param {Array<string|AttributeConfig>} attributes
 * @returns AttributeConfig[]
 */
function defineGettersAndSettersForAttributes (proto, attributes) {
  const normalized = attributes.map(
    nameOrConfig => new AttributeConfig(typeof nameOrConfig === 'string' ? { name: nameOrConfig } : nameOrConfig)
  )

  normalized.forEach(config => {
    if (config.reflect === false) return
    const { name, propertyName, boolean, get, set } = config
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

    Object.defineProperty(proto, propertyName, descriptor)
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
