// TODO simplify this, try and make `static styles` directly a CSSStyleSheet

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
      // console.log('defining stylesheet', this.cssText)
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
