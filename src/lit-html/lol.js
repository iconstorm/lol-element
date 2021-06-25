// @ts-check

import { LOLElement } from '../lol-element.js'
import { render } from 'lit-html'

export { css } from '../lol-element.js'
export { html, svg } from 'lit-html'

export class LOL extends LOLElement {
  /**
   * Update the DOM.
   */
  render () {
    const templateResult = this.template(this)
    render(templateResult, this.renderRoot, { eventContext: this })
  }
}
