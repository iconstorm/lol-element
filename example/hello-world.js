import { LOL, html, css } from '../src/preact/lol.js'

class HelloWorld extends LOL {
  static attributes = [
    { name: 'with-exclamation-mark', boolean: true }
  ]

  static get styles () {
    return css`
      :host {
        font-family: 'Comic Sans MS', sans-serif;
        font-size: 400%;
      }
    `
  }

  template () {
    return html`
      <del>Hello World${this.withExclamationMark ? '!' : ''}</del>
    `
  }
}

customElements.define('lol-hello-world', HelloWorld)
