import Component from './component';
import Element from './element';
import { createStyle } from './dom/dom';

export default function Collapse(options = {}) {
  let {
    expanded = false
  } = options;
  const {
    cls = '',
    easeCls = 'cu-collapse-ease',
    contentComponent,
    headerComponent,
    data = {},
    style: styleSettings,
    duration = 200,
    frameTime = 1000 / 60
  } = options;

  const style = createStyle(styleSettings);
  const nFrames = Math.round(duration / frameTime);
  const toggleEvent = 'collapse:toggle';
  let animate = false;
  let collapsed;
  let collapseEl;
  let headerEl;
  let contentEl;

  const applyAnimation = function applyAnimation({ expand }) {
    headerEl.classList.remove('expanded');
    headerEl.classList.remove('collapsed');
    contentEl.classList.remove('expanded');
    contentEl.classList.remove('collapsed');

    // Force a recalc styles here so the classes take hold.
    window.getComputedStyle(headerEl).transform;

    if (expand) {
      collapseEl.classList.add('expanded');
      contentEl.classList.add('expanded');
      return;
    }

    collapseEl.classList.add('collapsed');
    contentEl.classList.add('collapsed');
  };

  const calculateScales = function calculateScales() {
    const collapsedRect = headerEl.getBoundingClientRect();
    const expandedRect = collapseEl.getBoundingClientRect();

    collapsed = {
      x: collapsedRect.width / expandedRect.width,
      y: collapsedRect.height / expandedRect.height
    };
  };

  const activate = function activate() {
    collapseEl.classList.add('active');
    animate = true;
  };

  const collapse = function collapse() {
    if (!expanded) {
      return;
    }
    expanded = false;

    const { x, y } = collapsed;
    const invX = 1 / x;
    const invY = 1 / y;

    collapseEl.style.transform = `scale(${x}, ${y})`;
    contentEl.style.transform = `scale(${invX}, ${invY})`;

    if (animate) {
      return;
    }
    applyAnimation({ expand: false });
  };

  const expand = function expand() {
    if (expanded) {
      return;
    }
    expanded = true;
    collapseEl.style.transform = 'scale(1, 1)';
    contentEl.style.transform = 'scale(1, 1)';

    if (!animate) {
      return;
    }
    applyAnimation({ expand: true });
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

  const clamp = function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  };

  const ease = function ease(v, pow = 4) {
    const clampV = clamp(v, 0, 1);
    return 1 - Math.pow(1 - clampV, pow);
  };

  const append = function append({
    percentage,
    step,
    startX,
    startY,
    endX,
    endY,
    outerAnimation,
    innerAnimation
  } = {}) {
    const xScale = (startX + ((endX - startX) * step)).toFixed(5);
    const yScale = (startY + ((endY - startY) * step)).toFixed(5);

    const invScaleX = (1 / xScale).toFixed(5);
    const invScaleY = (1 / yScale).toFixed(5);

    outerAnimation.push(`
      ${percentage}% {
        transform: scale(${xScale}, ${yScale});
      }`);

    innerAnimation.push(`
      ${percentage}% {
        transform: scale(${invScaleX}, ${invScaleY});
      }`);
  };

  const createEaseAnimations = function createEaseAnimations() {
    let menuEase = document.querySelector(`.${easeCls}`);
    if (menuEase) {
      return menuEase;
    }

    menuEase = document.createElement('style');
    menuEase.classList.add(`${easeCls}`);

    const menuExpandAnimation = [];
    const menuExpandContentsAnimation = [];
    const menuCollapseAnimation = [];
    const menuCollapseContentsAnimation = [];

    const percentIncrement = 100 / nFrames;

    nFrames.forEach((i) => {
      const step = ease(i / nFrames).toFixed(5);
      const percentage = (i * percentIncrement).toFixed(5);
      const startX = collapsed.x;
      const startY = collapsed.y;
      const endX = 1;
      const endY = 1;

      // Expand animation.
      append({
        percentage,
        step,
        startX,
        startY,
        endX,
        endY,
        outerAnimation: menuExpandAnimation,
        innerAnimation: menuExpandContentsAnimation
      });

      // Collapse animation.
      append({
        percentage,
        step,
        startX: 1,
        startY: 1,
        endX: collapsed.x,
        endY: collapsed.y,
        outerAnimation: menuCollapseAnimation,
        innerAnimation: menuCollapseContentsAnimation
      });
    });

    menuEase.textContent = `
    @keyframes menuExpandAnimation {
      ${menuExpandAnimation.join('')}
    }
    @keyframes menuExpandContentsAnimation {
      ${menuExpandContentsAnimation.join('')}
    }
    @keyframes menuCollapseAnimation {
      ${menuCollapseAnimation.join('')}
    }
    @keyframes menuCollapseContentsAnimation {
      ${menuCollapseContentsAnimation.join('')}
    }`;

    document.head.appendChild(menuEase);
    return menuEase;
  };

  return Component({
    activate,
    collapse,
    data,
    expand,
    onInit() {
      this.expand.bind(this);
      this.collapse.bind(this);
      this.toggle.bind(this);
      if (headerComponent && contentComponent) {
        this.addComponent(headerComponent);
        // this.addComponent(contentComponent);
      } else {
        throw new Error('Header or content component is missing in collapse');
      }
    },
    onRender() {
      collapseEl = document.getElementById(this.getId());
      collapseEl.addEventListener(toggleEvent, this.toggle);
      this.dispatch('render');
      headerEl = document.getElementById(headerComponent.getId());
      contentEl = document.getElementById(contentComponent.getId());
      calculateScales();
      createEaseAnimations();
    },
    render: function render() {
      return `<div id="${this.getId()}">
                ${headerComponent.render()}
                ${contentComponent.render()}
              </div>`;
    },
    toggle
  });
}
