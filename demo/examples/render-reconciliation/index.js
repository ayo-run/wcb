// @ts-check
import { WebComponent, html } from 'web-component-base'

/**
 * 1. A controlled text field.
 *
 * Every keystroke writes back to a prop, which re-renders the component. The
 * `<input>` element is reused by the reconciler, so focus, the caret position
 * and the typed-but-uncommitted value all survive the re-render. Before
 * in-place patching this rebuilt the input and kicked the user out of the field
 * on the first character.
 */
class ControlledInput extends WebComponent {
  static props = { value: '' }

  get template() {
    return html`
      <label for="field"
        >Type here — focus and caret survive every render</label
      >
      <input
        id="field"
        type="text"
        placeholder="start typing..."
        oninput=${(e) => (this.props.value = e.target.value)}
      />
      <p>
        Prop value: <output id="echo">${this.props.value || '(empty)'}</output>
      </p>
      <p class="hint">Renders: <span id="renders">${this.#renders}</span></p>
    `
  }

  #renders = 0
  render() {
    this.#renders++
    super.render()
  }
}
customElements.define('controlled-input', ControlledInput)

/**
 * 2. Attribute-only changes patch in place.
 *
 * Selecting a tab changes nothing but `aria-selected` and `class` on the
 * existing buttons — the elements themselves are reused, so a tab you reached
 * with the keyboard keeps focus after selection. Tab into the strip and use
 * the arrow-free Tab/Enter or Space to see focus persist.
 */
class SegmentedControl extends WebComponent {
  static props = { value: 'one' }

  get template() {
    const tab = (id, label) => html`
      <button
        id=${id}
        class=${this.props.value === id ? 'seg selected' : 'seg'}
        aria-selected=${String(this.props.value === id)}
        onclick=${() => (this.props.value = id)}
      >
        ${label}
      </button>
    `
    return html`
      <div role="tablist" class="seg-group">
        ${tab('one', 'One')} ${tab('two', 'Two')} ${tab('three', 'Three')}
      </div>
      <p>Selected: <output id="selected">${this.props.value}</output></p>
    `
  }
}
customElements.define('segmented-control', SegmentedControl)

/**
 * 3. Unrelated re-renders don't restart a CSS transition.
 *
 * The box runs a 2s width transition. Bumping the counter re-renders the whole
 * component every 200ms, but the box's vnode is unchanged, so its element is
 * left completely untouched and the transition keeps running instead of
 * snapping back to the start.
 */
class TransitionSafe extends WebComponent {
  static props = { ticks: 0, wide: false }

  // self-contained so the transition is guaranteed present wherever the
  // component is used — including the e2e spec, which loads no page CSS
  static shadowRootInit = { mode: 'open' }
  // `:host` needs an explicit block so the box's `width: 90%` resolves against a
  // definite containing block. Without it the host is `display: inline` (no page
  // CSS in the e2e spec), and percentage-width resolution against an unsized
  // inline host is engine-dependent — WebKit never grows the box, so the e2e
  // "grew mid-transition" assertion sees the untouched 4em start width.
  static styles = `
    :host { display: block; }
    .anim-box {
      width: 4em;
      height: 2.5em;
      background: currentColor;
      opacity: 0.5;
      border-radius: 6px;
      transition: width 2s ease-in-out;
    }
    .anim-box.wide { width: 90%; }
  `

  get template() {
    return html`
      <div
        id="box"
        class=${this.props.wide ? 'anim-box wide' : 'anim-box'}
      ></div>
      <p>
        Unrelated re-renders while it animates:
        <output id="ticks">${this.props.ticks}</output>
      </p>
      <button id="run" onclick=${() => this.#run()}>Animate + re-render</button>
    `
  }

  #run() {
    this.props.wide = !this.props.wide
    // hammer the component with unrelated re-renders during the transition
    let n = 0
    const id = setInterval(() => {
      this.props.ticks++
      if (++n >= 10) clearInterval(id)
    }, 200)
  }
}
customElements.define('transition-safe', TransitionSafe)

/**
 * 4. Prop and attribute removal.
 *
 * A prop that disappears from the new vnode is actively undone, not left
 * behind: a dropped `disabled` goes back to `false`, a dropped `data-*`
 * attribute is removed, and dropped `style` rules are cleared.
 */
class PropRemoval extends WebComponent {
  // the demo starts decorated, but the boolean prop still defaults to `false`
  // and carries the inverted name — absence has to mean both "false" and
  // "default", which only works when they coincide
  static props = { plain: false }

  get template() {
    const on = !this.props.plain
    // spread so the props are genuinely *absent* when off — that's the removal
    // path: present in the old vnode, gone from the new one
    const decoration = on
      ? {
          disabled: true,
          'data-badge': 'decorated',
          style: { outline: '2px solid currentColor', padding: '0.6em' },
        }
      : {}
    return html`
      <button id="target" ...${decoration}>target element</button>
      <p class="hint">
        <code>disabled</code>, <code>data-badge</code> and the inline
        <code>style</code> are present only while decorated — toggling removes
        them from the same element instead of building a new one.
      </p>
      <button id="toggle" onclick=${() => (this.props.plain = on)}>
        ${on ? 'Remove props' : 'Add props'}
      </button>
    `
  }
}
customElements.define('prop-removal', PropRemoval)

/**
 * 5. Lists — including the non-keyed limitation.
 *
 * Growing and shrinking reuses the surviving rows. But patching is index-based,
 * so a *reorder* matches nodes by position, not identity: the DOM ends up
 * correct, yet each row keeps its slot and has its content rewritten. Type into
 * a row, then reorder, and you'll see the caret stay on the position rather
 * than follow the item.
 */
class ItemList extends WebComponent {
  static props = { items: ['alpha', 'bravo', 'charlie'] }

  get template() {
    return html`
      <ul id="list">
        ${this.props.items.map(
          (item) => html`
            <li>
              <span class="row-label">${item}</span>
              <input class="row-note" placeholder="note for ${item}" />
            </li>
          `
        )}
      </ul>
      <button
        id="add"
        onclick=${() => this.#set([...this.props.items, 'delta'])}
      >
        Append
      </button>
      <button
        id="drop"
        onclick=${() => this.#set(this.props.items.slice(0, -1))}
      >
        Remove last
      </button>
      <button
        id="reverse"
        onclick=${() => this.#set([...this.props.items].reverse())}
      >
        Reverse (shows the non-keyed limitation)
      </button>
      <p class="hint">
        Type a note into the first row, then press <b>Reverse</b>: the labels
        swap but your note stays in row 1, because rows are matched by position.
        A <code>key</code> prop would be needed to make state follow the item.
      </p>
    `
  }

  #set(items) {
    this.props.items = items
  }
}
customElements.define('item-list', ItemList)
