// @ts-check

import { LOLElement } from '../lol-element.js'
import { h, render } from 'preact'
import htm from 'htm'

export { css } from '../lol-element.js'
export const html = htm.bind(h)
export const svg = html

export class LOL extends LOLElement {
  /**
   * Update the DOM.
   */
  render () {
    const templateResult = this.template(this)
    render(templateResult, this.renderRoot)
  }
}
