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
    contentCls = '',
    data = {},
    style: styleSettings,
    tagName = 'div'
  } = options;

  const style = createStyle(styleSettings);
  const toggleEvent = 'collapse:toggle';
  const collapseEvent = 'collapse:collapse';
  const containerId = cuid();
  let collapseEl;
  let containerEl;
  let contentEl;

  // Restore auto size after transition
  const onTransitionEnd = function onTransitionEnd() {
    containerEl.removeEventListener('transitionend', onTransitionEnd);
    if (collapseY) containerEl.style.height = null;
    if (collapseX) containerEl.style.width = null;
  };

  const expand = function expand() {
    expanded = true;
    collapseEl.classList.add('expanded');
    const newHeight = contentEl.scrollHeight;
    const newWidth = contentEl.scrollHeight;
    if (collapseY) containerEl.style.height = `${newHeight}px`;
    if (collapseX) containerEl.style.width = `${newWidth}px`;
    containerEl.addEventListener('transitionend', onTransitionEnd);
  };

  const collapse = function collapse() {
    expanded = false;
    const collapseSize = 0;
    collapseEl.classList.remove('expanded');
    const currentHeight = contentEl.scrollHeight;
    const currentWidth = contentEl.scrollWidth;
    const elementTransition = containerEl.style.transition;
    containerEl.style.transition = '';

    requestAnimationFrame(() => {
      if (collapseY) containerEl.style.height = `${currentHeight}px`;
      if (collapseX) containerEl.style.width = `${currentWidth}px`;
      containerEl.style.transition = elementTransition;

      requestAnimationFrame(() => {
        containerEl.style.height = `${collapseSize}px`;
      });
    });
  };

  const toggle = function toggle(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if (expanded) {
      this.collapse();
    } else {
      this.expand();
    }
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
      collapseEl.addEventListener(collapseEvent, this.collapse.bind(this));
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
      return `<${tagName} id="${this.getId()}" class="collapse ${cls}" style="${style}">
                ${headerComponent.render()}
                <div id="${containerId}" class="collapse-container ${contentCls}" style="height: 0;">
                  ${contentComponent.render()}
                </div>
              </${tagName}>`;
    },
    toggle
  });
}
