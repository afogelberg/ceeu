import Component from './component';
import cuid from './utils/cuid';
import { createStyle } from './dom/dom';

export default function Collapse(options = {}) {
  let {
    expanded = false
  } = options;
  const {
    cls = '',
    collapseX = true,
    collapseY = true,
    contentComponent,
    headerComponent,
    data = {},
    style: styleSettings
  } = options;

  const style = createStyle(styleSettings);
  const toggleEvent = 'collapse:toggle';
  const containerId = cuid();
  let collapseEl;
  let containerEl;
  let contentEl;

  const expand = function expand() {
    expanded = true;
    if (collapseY) {
      const height = contentEl.scrollHeight;
      console.log(height);
      containerEl.style.height = `${height}px`;
    }
    if (collapseX) {
      const width = contentEl.scrollWidth;
      containerEl.style.width = `${width}px`;
    }
  };

  const collapse = function collapse() {
    expanded = false;
    const height = 0;
    const width = 0;
    if (collapseY) containerEl.style.height = `${height}px`;
    if (collapseX) containerEl.style.width = `${width}px`;
  };

  const toggle = function toggle(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if (expanded) {
      this.collapse();
      return;
    }
    expand();
    this.dispatch(toggleEvent);
  };

  return Component({
    collapse,
    data,
    expand,
    onInit() {
      if (headerComponent && contentComponent) {
        this.addComponent(headerComponent);
        this.addComponent(contentComponent);
      } else {
        throw new Error('Header or content component is missing in collapse');
      }
    },
    onRender() {
      collapseEl = document.getElementById(this.getId());
      collapseEl.addEventListener(toggleEvent, this.toggle.bind(this));
      containerEl = document.getElementById(containerId);
      contentEl = document.getElementById(contentComponent.getId());
      this.dispatch('render');

      if (expanded) {
        this.expand();
      } else {
        this.collapse();
      }
    },
    render: function render() {
      return `<div id="${this.getId()}" class="collapse ${cls}" style="${style}">
                ${headerComponent.render()}
                <div id="${containerId}" class="collapse-container">
                  ${contentComponent.render()}
                </div>
              </div>`;
    },
    toggle
  });
}
