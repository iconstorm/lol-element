import { LolElement, css } from './src/lol-element.js'

class Yep extends LolElement {
  static definition = {
    name: 'a-yep',
    styles: css`
      :host {
        font-weight: bold;
        color: red;
        font-family: monospace;
      }
    `
  }

  setup () {
    this.$append(`
      <p>This is madness.</p>
      <p>I actually love it.</p>
    `)
  }
}

LolElement.define(Yep)
