// @ts-check

import { LOLElement } from '../lol-element.js'
import { h, render } from 'preact'
import htm from 'htm'

export { css } from '../lol-element.js'
export const html = htm.bind(h)
export const svg = html

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
    render(templateResult, this.renderRoot)
  }
}
