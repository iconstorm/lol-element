// @ts-check

const p = Promise.resolve()

export class LOLElement extends HTMLElement {
  /* "public" API */

  /**
   * @returns {ShadowRootInit|null}
   */
  static get shadowOptions () {
    return { mode: 'open' }
  }

  /**
   * @returns {CSSResult|null}
   */
  static get styles () {
    return null
  }

  /**
   * @returns {Array<AttributeConfig|string>}
   */
  static get attributes () {
    return []
  }

  /**
   * @param {Object} [host]
   * @returns {string|Object|Node} The template result
   */
  template (host) {
    return null
  }

  /**
   * Update the DOM.
   *
   * @returns {void}
   */
  render () {
    // @ts-ignore
    console.log(`The \`render\` method is not defined in ${this.name}`)
  }

  /**
   * Called on every `attributeChangedCallback`.
   *
   * @param {string} name - The name of the attribute that changed
   * @param {string} oldValue
   * @param {string} newValue
   */
  changed (name, oldValue, newValue) { }

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

  tick (fn = () => {}) {
    return p.then(fn)
  }

  /* "private" stuff */

  constructor () {
    super()
    // @ts-ignore
    const { shadowOptions } = this.constructor
    // Regarding `this.shadowRoot == null`:
    // "A Custom Element being upgraded from HTML that includes a Declarative Shadow Root
    // will already have that shadow root attached."
    // https://web.dev/declarative-shadow-dom/#hydration
    if (shadowOptions !== null && this.shadowRoot == null) {
      this.attachShadow(shadowOptions)
    }
    /** @type {HTMLElement|ShadowRoot} */
    this.renderRoot = this.shadowRoot || this
  }

  static get observedAttributes () {
    const attributes = defineGettersAndSettersForAttributes(
      this.prototype,
      this.attributes
    )
    return attributes.map(x => x.name)
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
      const shouldUpdate = this[callbackName](oldValue, newValue)
      // Returning `false` from the callback skips rendering
      if (shouldUpdate === false) return
    }
    if (this.isConnected) this.render()
  }

  /**
   * Render the styles for the component.
   * Handles both shadow, and no shadow DOM (naively*).
   *
   * *when no shadowRoot is present, there is no "cleaning up":
   * styles are added and they stay forever
   */
  adoptStyles () {
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

    // No support for Constructable Stylesheets
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
}

const identity = (/** @type any */x) => x

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
 * Defines getters/setters properties for observed attributes.
 * Also return a normalized array config, so it's all AttributeConfig instances.
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

/**
 * Code below adapted from `lit-element` v1
 *
 * @license
 * Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
 * found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
 * part of the polymer project is also subject to an additional IP rights grant
 * found at http://polymer.github.io/PATENTS.txt
*/

export const supportsAdoptingStyleSheets = window.ShadowRoot &&
  ('adoptedStyleSheets' in Document.prototype) &&
  ('replace' in CSSStyleSheet.prototype)

const constructionToken = Symbol('styles')

class CSSResult {
  /**
   * @param {string} cssText
   * @param {Symbol} safeToken
   */
  constructor (cssText, safeToken) {
    if (safeToken !== constructionToken) {
      throw new Error('CSSResult is not constructable, use `css` instead.')
    }

    Object.defineProperty(this, 'cssText', {
      writable: false,
      enumerable: false,
      value: cssText
    })
  }

  get styleSheet () {
    if (this._styleSheet === undefined) {
      if (supportsAdoptingStyleSheets) {
        this._styleSheet = new CSSStyleSheet()
        // @ts-ignore
        this._styleSheet.replaceSync(this.cssText)
      } else {
        this._styleSheet = null
      }
    }
    return this._styleSheet
  }

  toString () {
    // @ts-ignore
    return this.cssText
  }
}

/**
 * Template tag for CSS.
 *
 * @param {string[]} strings
 * @param  {...CSSResult} values
 * @returns {CSSResult}
 */
export function css (strings, ...values) {
  const cssText = values.reduce(
    (acc, value, i) => acc + textFromCSSResult(value) + strings[i + 1],
    strings[0]
  )
  return new CSSResult(cssText, constructionToken)
}

/**
 * @param {CSSResult|number} value
 */
function textFromCSSResult (value) {
  if (value instanceof CSSResult) {
    // @ts-ignore
    return value.cssText
  } else if (typeof value === 'number') {
    return value
  } else {
    throw new Error(`Value passed to 'css' function must be a 'css' function result: ${value}.`)
  }
}
