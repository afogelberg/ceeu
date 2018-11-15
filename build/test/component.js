var app = function app() { 

  var Buttons = function Buttons() {
    var btn1;
    return cu.Component({
      onInit() {
        btn1 = cu.Button({
          click: () => { alert('click')},
          cls: 'bg-primary text-white rounded',
          text: 'Button'
        });
        this.addComponent(btn1);
      },
      onRender: function onRender() {
        this.dispatch('render');
      },
      render: function render() {
        return `${btn1.render()}`
      }
    });
  };

  var buttons;

  var Collapse = function Collapse() {
    var headerCmp = cu.Component({
      onRender: function onRender() {
        var headerEl = document.getElementById(this.getId);
        console.log(headerEl);
        headerEl.addEventListener('click', function(e) {
          var customEvt = new CustomEvent('collapse:toggle', {
            bubbles: true
          });
          headerEl.dispatchEvent(customEvt);
        });
      },
      render: function render() {
        var id = this.getId();
        return '<div id="' + id + '" class="collapse-header">Header</div>'
      }
    });
    var contentCmp = cu.Component({
      render: function render() {
        var id = this.getId();
        return '<div id="' + id + '"class="collapse-content">Content</div>';
      }
    });    
    return cu.Collapse({
      contentComponent: contentCmp,
      headerComponent: headerCmp
    });
  };  

  var collapse;

  return cu.Component({
    onInit() {
      buttons = Buttons();
      this.addComponent(buttons);
      collapse = Collapse();
      this.addComponent(collapse);      
    },
    render: function render() {
      var target = document.querySelector('.app');
      var template = `<div class="padding-large">
                        <div>
                          <h5>Button examples</h5>
                          ${buttons.render()}
                          <br><br>
                          <h5>Collapse example</h5>
                          ${collapse.render()}                          
                        </div>
                      </div>`;
      var el = cu.dom.html(template);
      target.appendChild(el);
      this.dispatch('render');
    }
  });
};

app().render();