const _ = require('lodash')
const html = require('choo/html')
const sf = require('sheetify')
const update = require('immutability-helper')
const component = require('choo-component')
const classNames = require('classnames')

// PanelGroup
//
// creates multiple panels which are separated by dividers which can be used to resize the panels

const DIVIDER_WIDTH = 10

const prefix = sf`
  :host {
    display: flex;
    flex-direction: row;
    height: 100%;
  }

  :host.resizing {
    cursor: ew-resize;
  }

  :host > * {
    height: 100%;
    flex-grow: 0;
    flex-shrink: 0;
    overflow: auto;
  }

  :host > .divider {
    background: #404040;
    width: 10px;
    height: 100%;
    cursor: ew-resize;
    flex-shrink: 0;
    flex-grow: 0;
  }

  :host > .divider:hover {
    background: #848484;
  }
`

module.exports = component({
  model: {
    namespace: 'panelGroup',

    state: {
      selectedPanelIndex: null,
      panelSizes: null
    },

    reducers: {
      initPanelSizes: (state, { panelSizes }) =>
        update(state, { panelSizes: { $set: panelSizes } }),

      resizeGroup: (state, { width }) => {
        const { panelSizes } = state
        const totalWidth = _.reduce(panelSizes, (sum, width) => sum + width, 0)
        const newPanelSizes = _.map(panelSizes, (panelWidth) => (panelWidth / totalWidth) * width)

        return update(state, {
          panelSizes: { $set: newPanelSizes }
        })
      },

      selectPanel: (state, { panelIndex }) => {
        return update(state, {
          selectedPanelIndex: { $set: panelIndex }
        })
      },

      resizePanel: (state, { position }) => {
        const { panelSizes, selectedPanelIndex } = state

        if (selectedPanelIndex === null) {
          return state
        }

        const size = panelSizes[selectedPanelIndex]
        const offset = _.reduce(panelSizes.slice(0, selectedPanelIndex), (sum, size) => sum + size, 0)
        const newSize = _.clamp(position - offset, 0, size + panelSizes[selectedPanelIndex + 1])
        const sizeChange = newSize - size

        return update(state, {
          panelSizes: {
            [selectedPanelIndex]: { $set: newSize },
            [selectedPanelIndex + 1]: { $set: panelSizes[selectedPanelIndex + 1] - sizeChange }
          }
        })
      }
    }
  },

  view: ({
    panelSizes, selectedPanelIndex, panelViews,
    initPanelSizes, resizeGroup, selectPanel, resizePanel
  }) => {
    let panelsHtml, windowResizeHandler

    // skip rendering of panelViews on first render, because we need to know the size of the container first
    if (panelSizes !== null) {
      // add divider elements between panels
      panelsHtml = _(panelViews)
        .map((panelHtml, index) => [
          html`<div class="panel" style="width: ${panelSizes[index]}px">${panelHtml}</div>`,
          html`<div class="divider" onmousedown=${() => selectPanel({ panelIndex: index })}></div>`
        ])
        .flatten()
        .value()
        .slice(0, -1) // omit divider after last panel
    }

    const className = classNames(prefix, {
      resizing: selectedPanelIndex !== null
    })

    return html`
      <div class="${className}"
           onload=${init}
           onunload=${unload}
           onmousemove=${(evt) => resizePanel({ position: evt.clientX - ((selectedPanelIndex + 0.5) * DIVIDER_WIDTH) })}
           onmouseleave=${() => selectPanel({ panelIndex: null })}
           onmouseup=${() => selectPanel({ panelIndex: null })}>
        ${panelsHtml}
      </div>
    `

    function init (panelsContainer) {
      const initialPanelSizes = getInitialPanelSizes(panelsContainer, panelViews)

      windowResizeHandler = () =>
        resizeGroup({ width: getPanelsTotalWidth(panelsContainer, panelViews.length) })

      if (panelSizes === null) {
        initPanelSizes({ panelSizes: initialPanelSizes })
      } else {
        // call resize if panelSizes has been preset, because panelsContainer width might have changed
        windowResizeHandler()
      }

      window.addEventListener('resize', windowResizeHandler)
    }

    function unload () {
      window.removeEventListener('resize', windowResizeHandler)
    }
  }
})

function getInitialPanelSizes (panelsContainer, panelViews) {
  const panelWidth = getPanelsTotalWidth(panelsContainer, panelViews.length) / panelViews.length
  return _.map(panelViews, () => panelWidth)
}

// returns width of container, subtracting the width of divider
function getPanelsTotalWidth (panelsContainer, numberOfPanels) {
  return (panelsContainer.getBoundingClientRect().width - ((numberOfPanels - 1) * DIVIDER_WIDTH))
}
