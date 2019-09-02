module.exports = {
  url: "http://localhost:8080/",
  sections: {
    tabMenu: {
      selector: ".menu",
      index: 0,
      elements: {
        functions: "[title=functions]",
        settings: "[title=settings]",
        importExport: '[title="export/import"]'
      }
    },
    equations: {
      selector: ".tab",
      index: 0,
      elements: {
        // Menu buttons
        cartesian: "[title=cartesian]",
        matrix: "[title=matrix]",
        polar: "[title=polar]",
        // input boxes
        inputDX: {
          selector: ".mathfield",
          index: 0
        },
        inputDY: {
          selector: ".mathfield",
          index: 1
        },
        // apply buttons
        applyCartesian: {
          selector: ".applyButton",
          index: 0
        }
      },
      commands: [
        {
          setCartesian: function (dx, dy) {
            this.api.execute(function (dxString, dyString) {
              localStorage.setItem('settings:dxString', JSON.stringify(dxString));
              localStorage.setItem('settings:dyString', JSON.stringify(dyString));
              localStorage.setItem('settings:ODEType', JSON.stringify(0));
            }, [dx, dy]);
            this.api.refresh();
            // this.click('@cartesian');

            // this.setValueMathField('@inputDX' , dx);
            // this.setValueMathField('@inputDY' , dy);
            //
            // this.click('@applyCartesian');
          },

          setValueMathField(selector, value) {
            const keys = this.api.Keys;
            this.click(selector);
            this.api.keys([keys.CONTROL, 'a', keys.NULL, keys.DELETE, ...value.split('')]);
          }
        }
      ],
    }
  },
  elements: {
  }
};
