// @ts-check

import { render } from '../node_modules/lit-html/lit-html.js'

import { LolElementBase } from './element.js'
export { css } from './css.js'
export { html, svg } from '../node_modules/lit-html/lit-html.js'

/**
 * We're defining _render here so it's easy to replace lit-html
 * by inheriting directly from LolElementBase in a new consumer-defined class.
 */
export class LolElement extends LolElementBase {
  /**
   * Update the DOM.
   *
   * @param {object|string} templateResult - The output from the template function
   */
  _render (templateResult) {
    render(templateResult, this._renderRoot, { eventContext: this })
  }
}
