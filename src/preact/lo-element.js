import {
  attachShadow,
  adoptStyles,
  defineAttributes,
  firePropChangedCallbacks
} from '../lo.js'
import { h, render } from 'preact'
import htm from 'htm'

export { css } from '../css.js'
export const html = htm.bind(h)
export const svg = html

export class LO extends HTMLElement {
  static get observedAttributes () {
    return defineAttributes(this.prototype, this.attributes)
  }

  connectedCallback () {
    attachShadow(this)
    // Order here does not seem to make a difference
    this.update()
    adoptStyles(this)
  }

  attributeChangedCallback (name, oldValue, newValue) {
    firePropChangedCallbacks(this, name, oldValue, newValue)
    if (this.isConnected) this.update()
  }

  update () {
    if (this.shadowRoot && this.isConnected) {
      render(this.template(this), this.shadowRoot)
    }
  }

  template (host) {
    return null
  }
}
