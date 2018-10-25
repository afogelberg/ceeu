import Component from './component';
import Button from './button';
import Element from './element';
import { createStyle, html } from './dom/dom';

export default function Sidenav(options = {}) {
  const {
    backIcon = '#ic_chevron_left_24px',
    cls: clsOption = '',
    components = [],
    style: styleSettings
  } = options;

  const style = createStyle(styleSettings);
  const cls = `${clsOption} sidenav`;

  let first;
  let secondary;
  let sidenavEl;
  let firstEl;
  let secondaryEl;
  let secondaryTitle = '';

  let firstContainer;
  let backButton;
  let header;
  let secondaryContainer;

  const refreshHeight = function refreshHeight() {
    if (sidenavEl.classList.contains('unfolded')) {
      const height = secondaryEl.scrollHeight;
      sidenavEl.style.height = `${height}px`;
    } else {
      const height = firstEl.scrollHeight;
      sidenavEl.style.height = `${height}px`;
    }
  };

  const setFirst = function setFirst(component) {
    if (first) {
      firstContainer.removeComponent(first);
    }
    const el = document.getElementById(first.getId());
    first = component;
    firstContainer.addComponent(first);
    const newEl = html(first.render());
    el.parentNode.replaceChild(newEl, el);
    firstContainer.dispatch('render');
    return first;
  };

  const setSecondary = function setSecondary(component) {
    if (secondary) {
      secondaryContainer.removeComponent(secondary);
      secondaryTitle = component.title ? component.title : '';
      secondary = component;
      secondaryContainer.addComponent(secondary);
      secondaryEl.innerHTML = secondaryContainer.renderSecondary();
      secondaryContainer.dispatch('render');
      return secondary;
    }
    secondaryTitle = component.title ? component.title : '';
    secondary = component;
    secondaryContainer.addComponent(secondary);
    return secondary;
  };

  const unfold = function unfold() {
    sidenavEl.classList.add('unfolded');
    const height = secondaryEl.scrollHeight;
    sidenavEl.style.height = `${height}px`;
  };

  const fold = function fold() {
    sidenavEl.classList.remove('unfolded');
    const height = firstEl.scrollHeight;
    sidenavEl.style.height = `${height}px`;
  };

  return Component({
    fold,
    onInit() {
      firstContainer = Element({
        cls: 'first'
      });
      backButton = Button({
        cls: 'icon-smaller padding-small',
        icon: backIcon,
        click() {
          fold();
        }
      });
      header = Component({
        onRender() {
          const labelEl = document.getElementById(this.getId());
          labelEl.addEventListener('click', (e) => {
            backButton.dispatch('click');
            e.preventDefault();
          });
        },
        render() {
          const labelCls = 'text-small grow pointer no-select padding-y-small text-weight-bold';
          return `<div id="${this.getId()}" class="${labelCls}">${secondaryTitle}</div>`;
        }
      });
      secondaryContainer = Component({
        onInit() {
          this.addComponent(backButton);
          this.addComponent(header);
        },
        onRender() {
          this.dispatch('render');
        },
        renderSecondary() {
          return `<div class="flex column">
                    <div class="flex row padding-y-small align-center no-grow">${backButton.render()}${header.render()}</div>
                    <div class="divider horizontal"></div>
                    ${secondary.render()}
                  </div>`;
        },
        render() {
          return `<div id="${this.getId()}" class="secondary">
                    ${this.renderSecondary()}
                  </div>`;
        }
      });

      this.addComponent(firstContainer);
      this.addComponent(secondaryContainer);

      if (components.length === 2) {
        firstContainer.addComponent(components[0]);
        this.setSecondary(components[1]);
        firstContainer.on('change', refreshHeight);
      }
    },
    onRender() {
      firstEl = document.getElementById(firstContainer.getId());
      secondaryEl = document.getElementById(secondaryContainer.getId());
      sidenavEl = document.getElementById(this.getId());
      const height = firstEl.scrollHeight;
      sidenavEl.style.height = `${height}px`;
      this.dispatch('render');
    },
    unfold,
    refreshHeight,
    render() {
      return `<div id="${this.getId()}" class="${cls}" style="${style}">
                ${firstContainer.render()}
                ${secondaryContainer.render()}
              </div>`;
    },
    setFirst,
    setSecondary
  });
}
