// @ts-check
import { WebComponent, html } from 'web-component-base'

/**
 * Composition: a component within a component within a component.
 *
 * The three classes below nest three levels deep, all rendering to light DOM.
 * The point of interest is what happens to the inner subtrees when an *outer*
 * component re-renders for a reason unrelated to them.
 *
 * A parent's vnode never describes what a nested component rendered for
 * itself — `<tick-counter></tick-counter>` is empty in the row's template even
 * though the counter fills itself with a button and a count. The in-place
 * reconciler therefore treats a nested custom element as opaque: it patches the
 * element's props (so data still flows down) but leaves the element's own
 * children alone. Reconciling them would trim away the child's rendered content
 * on every ancestor re-render and leave it blank until it next re-rendered on
 * its own.
 */

/** Level 3 (leaf): owns its own count entirely — no prop feeds it. */
class TickCounter extends WebComponent {
  static props = { label: 'tick' }
  #count = 0
  get template() {
    return html`
      <button onclick=${() => this.#bump()}>
        ${this.props.label}: <strong class="count">${this.#count}</strong>
      </button>
    `
  }
  #bump() {
    this.#count++
    this.render()
  }
}
customElements.define('tick-counter', TickCounter)

/** Level 2 (middle): a labelled row that hosts a leaf counter. */
class CounterRow extends WebComponent {
  static props = { name: 'row' }
  get template() {
    return html`
      <div class="row">
        <span class="row-name">${this.props.name}</span>
        <tick-counter label=${this.props.name}></tick-counter>
      </div>
    `
  }
}
customElements.define('counter-row', CounterRow)

/** Level 1 (root): a board that re-renders on an unrelated "rename". */
class CounterBoard extends WebComponent {
  static props = { title: 'Board A' }
  get template() {
    return html`
      <section class="board">
        <header>
          <h3 id="board-title">${this.props.title}</h3>
          <button id="rename" onclick=${() => this.#rename()}>
            Rename board (re-renders the root)
          </button>
        </header>
        <counter-row name="alpha"></counter-row>
        <counter-row name="bravo"></counter-row>
        <counter-row name="charlie"></counter-row>
      </section>
    `
  }
  #renamed = 0
  #rename() {
    this.props.title = `Board ${String.fromCharCode(66 + (++this.#renamed % 25))}`
  }
}
customElements.define('counter-board', CounterBoard)
