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
          setCartesian: function(dx, dy, settings) {
            this.api.execute(
              function(dxString, dyString, settings) {
                localStorage.setItem(
                  "settings:dxString",
                  JSON.stringify(dxString)
                );
                localStorage.setItem(
                  "settings:dyString",
                  JSON.stringify(dyString)
                );
                localStorage.setItem("settings:ODEType", JSON.stringify(0));
                localStorage.setItem(
                  "settings:viewbox.x.min",
                  JSON.stringify(settings.minX)
                );
                localStorage.setItem(
                  "settings:viewbox.x.max",
                  JSON.stringify(settings.maxX)
                );
                localStorage.setItem(
                  "settings:viewbox.y.min",
                  JSON.stringify(settings.minY)
                );
                localStorage.setItem(
                  "settings:viewbox.y.max",
                  JSON.stringify(settings.maxY)
                );
              },
              [dx, dy, settings]
            );
            this.api.refresh();
          },

          setValueMathField(selector, value) {
            const keys = this.api.Keys;
            this.click(selector);
            this.api.keys([
              keys.CONTROL,
              "a",
              keys.NULL,
              keys.DELETE,
              ...value.split("")
            ]);
          }
        }
      ]
    }
  },
  elements: {}
};
