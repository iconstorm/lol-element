// @ts-check

import { LOLElement } from './lol-element.js'
import { render } from 'uhtml'

export { css } from './lol-element.js'
export { html, svg } from 'uhtml'

export class LOL extends LOLElement {
  /**
   * Update the DOM.
   */
  render () {
    console.log('render', this.name)
    const templateResult = this.template(this)
    render(this.renderRoot, templateResult)
  }
}
