// @ts-check

import { LOLElement } from './lol-element.js'
import { render } from 'uhtml/async'

export { css } from './lol-element.js'
export { html, svg } from 'uhtml/async'

export class LOL extends LOLElement {
  /**
   * Update the DOM.
   */
  render () {
    const templateResult = this.template(this)
    render(this.renderRoot, templateResult)
  }
}
