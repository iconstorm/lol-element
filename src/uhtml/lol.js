// @ts-check

import { LOLElement } from '../lol-element.js'
import { render } from 'uhtml'

export { css } from '../lol-element.js'
export { html, svg } from 'uhtml'

export class LOL extends LOLElement {
  /**
   * First render.
   * Order is important: adoptStyles() must be called AFTER render()
   */
  connectedCallback () {
    this.render()
    this.adoptStyles()
  }

  /**
   * Update the DOM.
   */
  render () {
    const templateResult = this.template(this)
    render(this.renderRoot, templateResult)
  }
}
