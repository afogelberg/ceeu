import Component from './component';
import cuid from './utils/cuid';
import { createStyle } from './dom/dom';

// Inspired by animated-clip: https://github.com/GoogleChromeLabs/ui-element-samples/tree/gh-pages/animated-clip

export default function Collapse(options = {}) {
  let {
    expanded = false
  } = options;
  const {
    cls = '',
    collapseX = true,
    collapseY = true,
    easeCls = 'cu-collapse-ease',
    contentComponent,
    headerComponent,
    origin = 'top-left',
    data = {},
    style: styleSettings,
    duration = 200
  } = options;

  const style = createStyle(styleSettings);
  const frameTime = 1000 / 60;
  const nFrames = Math.round(duration / frameTime);
  const xCollapse = collapseX ? 0 : 1;
  const yCollapse = collapseY ? 0 : 1;
  const toggleEvent = 'collapse:toggle';
  const outerId = cuid();
  const innerId = cuid();
  let animate = false;
  let collapseEl;
  let outerEl;
  let innerEl;

  const applyAnimation = function applyAnimation() {
    outerEl.classList.remove('expanded');
    outerEl.classList.remove('collapsed');
    innerEl.classList.remove('expanded');
    innerEl.classList.remove('collapsed');

    // Force a recalc styles here so the classes take hold.
    // eslint-disable-next-line no-unused-expressions
    window.getComputedStyle(outerEl).transform;

    if (expanded) {
      outerEl.classList.add('expanded');
      innerEl.classList.add('expanded');
      return;
    }
    outerEl.classList.add('collapsed');
    innerEl.classList.add('collapsed');
  };

  const activate = function activate() {
    outerEl.classList.add('active');
    animate = true;
  };

  const collapse = function collapse() {
    expanded = false;

    outerEl.style.transform = `scale(${xCollapse},${yCollapse})`;
    innerEl.style.transform = 'scale(1, 1)';

    if (!animate) {
      return;
    }
    applyAnimation();
  };

  const expand = function expand() {
    expanded = true;
    outerEl.style.transform = 'scale(1, 1)';
    innerEl.style.transform = 'scale(1, 1)';

    if (!animate) {
      return;
    }
    applyAnimation();
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
    return 1 - ((1 - clampV) ** pow);
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
    let collapseEase = document.querySelector(`.${easeCls}`);
    if (collapseEase) {
      return collapseEase;
    }

    collapseEase = document.createElement('style');
    collapseEase.classList.add(`${easeCls}`);

    const outerExpandAnimation = [];
    const innerExpandAnimation = [];
    const outerCollapseAnimation = [];
    const innerCollapseAnimation = [];

    const percentIncrement = 100 / nFrames;

    for (let i = 0; i <= nFrames; i += 1) {
      const step = ease(i / nFrames).toFixed(5);
      const percentage = (i * percentIncrement).toFixed(5);
      const startX = xCollapse;
      const startY = yCollapse;
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
        outerAnimation: outerExpandAnimation,
        innerAnimation: innerExpandAnimation
      });

      // Collapse animation.
      append({
        percentage,
        step,
        startX: 1,
        startY: 1,
        endX: xCollapse,
        endY: yCollapse,
        outerAnimation: outerCollapseAnimation,
        innerAnimation: innerCollapseAnimation
      });
    }

    collapseEase.textContent = `
    @keyframes outerExpandAnimation {
      ${outerExpandAnimation.join('')}
    }
    @keyframes innerExpandAnimation {
      ${innerExpandAnimation.join('')}
    }
    @keyframes outerCollapseAnimation {
      ${outerCollapseAnimation.join('')}
    }
    @keyframes innerCollapseAnimation {
      ${innerCollapseAnimation.join('')}
    }`;

    document.head.appendChild(collapseEase);
    return collapseEase;
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
        this.addComponent(contentComponent);
      } else {
        throw new Error('Header or content component is missing in collapse');
      }
    },
    onRender() {
      collapseEl = document.getElementById(this.getId());
      collapseEl.addEventListener(toggleEvent, this.toggle.bind(this));
      outerEl = document.getElementById(outerId);
      innerEl = document.getElementById(innerId);
      this.dispatch('render');
      createEaseAnimations();

      if (expanded) {
        this.expand();
      } else {
        this.collapse();
      }
      this.activate();
    },
    render: function render() {
      return `<div id="${this.getId()}" class="collapse ${cls}" style="${style}">
                ${headerComponent.render()}
                <div id="${outerId}" class="collapse-outer ${origin}">
                  <div id="${innerId}" class="collapse-inner ${origin}">
                    ${contentComponent.render()}
                  </div>
                </div>
              </div>`;
    },
    toggle
  });
}
