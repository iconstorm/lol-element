import { render } from '../node_modules/lit-html/lit-html.js'
import { LolElementLogic } from './logic.js'
import { define } from './define.js'

export class LolElement extends LolElementLogic {
  /**
   * Warning: when no shadowRoot is present, there is no "cleaning up":
   * styles are added and they stay forever
   */
  _adoptStyles () {
    const { styles, name } = this.constructor.definition
    if (styles == null) return
    const hasShadowRoot = this.shadowRoot !== null
    const styleSheet = styles.styleSheet

    // Constructable Stylesheets supported
    if (styleSheet !== null && hasShadowRoot) {
      this.shadowRoot.adoptedStyleSheets = [styleSheet]
      return
    }
    if (styleSheet !== null && !hasShadowRoot) {
      if (document.adoptedStyleSheets.indexOf(styleSheet) > -1) return
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet]
      return
    }

    // No support
    const styleTag = document.createElement('style')
    styleTag.textContent = styles
    if (hasShadowRoot) {
      this.shadowRoot.appendChild(styleTag)
    } else {
      styleTag.id = `for-custom-element-${name}`
      if (document.getElementById(styleTag.id) !== null) return
      document.head.appendChild(styleTag)
    }
  }

  _update () {
    if (!this.isConnected) return
    const { template } = this.constructor.definition
    if (template == null) return
    const result = typeof template === 'function' ? template(this) : template
    this._render(result)
  }

  _render (templateResult) {
    render(templateResult, this._renderRoot, { eventContext: this })
  }
}

LolElement.define = define
