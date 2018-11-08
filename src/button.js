import Component from './component';
import Element from './element';
import Icon from './icon';
import { createStyle } from './dom/dom';

export default function Button(options = {}) {
  let {
    icon,
    state = 'initial',
    text = ''
  } = options;
  const {
    cls = '',
    methods = {},
    data = {},
    iconCls = '',
    iconStyle = {},
    click,
    style: styleSettings,
    textCls = '',
    validStates = ['initial', 'active', 'disabled', 'loading']
  } = options;

  let buttonEl;
  const style = createStyle(styleSettings);
  const iconComponent = icon ? Icon({
    icon,
    cls: iconCls,
    style: iconStyle
  }) : '';
  const textMarkup = text ? Element({
    cls: textCls,
    innerHTML: text,
    tagName: 'span'
  }).render() : '';

  const getState = () => state;

  const setState = function setState(newState) {
    if (newState !== state && validStates.indexOf(newState) > -1) {
      if (state === 'initial') {
        buttonEl.classList.add(newState);
      } else if (newState === 'initial') {
        buttonEl.classList.remove(state);
      } else {
        buttonEl.classList.remove(state);
        buttonEl.classList.add(newState);
      }
      state = newState;
      if (state in methods) {
        methods[state].call(this, buttonEl);
      }
    }
  };

  const getInnerHTML = () => {
    if (iconComponent) {
      return `${textMarkup}${iconComponent.render()}`;
    }
    return textMarkup;
  };

  const onChange = function onChange(evt) {
    if (evt.state) {
      setState(evt.state);
    }
    if (evt.text) {
      text = evt.text;
    }
    if (evt.icon) {
      icon = evt.icon;
      iconComponent.setIcon(icon);
    }
    if (evt.text || evt.icon) {
      this.dispatch('update');
    }
  };

  const onUpdate = function onUpdate() {
    const el = document.getElementById(this.getId());
    el.innerHTML = getInnerHTML();
  };

  return Component({
    data,
    getState,
    onInit() {
      this.on('change', onChange.bind(this));
      this.on('update', onUpdate.bind(this));
    },
    onRender() {
      buttonEl = document.getElementById(this.getId());
      if (click) {
        this.on('click', click.bind(this));
        this.on('clear', () => {
          this.un('click', click.bind(this));
        });
      }
      buttonEl.addEventListener('click', (e) => {
        this.dispatch('click');
        e.preventDefault();
      });
      if (validStates.indexOf(state) > 0) {
        buttonEl.classList.add(state);
      }
    },
    render: function render() {
      return `<button id="${this.getId()}" class="${cls}" style="${style}">
                ${getInnerHTML()}
              </button>`;
    },
    setIcon(newIcon) {
      if (iconComponent) {
        iconComponent.setIcon(newIcon);
      }
    },
    setState
  });
}
