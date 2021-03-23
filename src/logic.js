export class LolElementLogic extends HTMLElement {
  constructor () {
    super()
    const { shadowOptions } = this.constructor.definition
    if (shadowOptions !== null) this.attachShadow(shadowOptions)
    this._renderRoot = this.shadowRoot || this
    this.setup()
  }

  setup () {}
  connected () {}
  disconnected () {}
  changed () {}

  connectedCallback () {
    this._adoptStyles()
    this._update()
    this.connected()
  }

  disconnectedCallback () {
    this.disconnected()
  }

  attributeChangedCallback (name, oldValue, newValue) {
    const { callbackName } = this.constructor.attributes.get(name)
    this.changed(name, oldValue, newValue)
    if (typeof this[callbackName] === 'function') {
      const changed = this[callbackName](oldValue, newValue)
      // Returning `false` from the callback skips update
      if (changed === false) return
    }
    this._update()
  }

  emit (eventName, detail, options = {}) {
    const defaults = {
      bubbles: true,
      cancelable: true
    }
    const event = new CustomEvent(eventName, {
      detail,
      ...defaults,
      ...options
    })
    this.dispatchEvent(event)
  }
}
