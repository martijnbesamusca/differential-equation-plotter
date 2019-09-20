const spawn = require("child_process").spawn;
const fs = require("fs");
const tests = require("./comparisonCollection.js");

function runPython(funcName, settings) {
  const pythonProcess = spawn("python", [
    "tests/python/reference.py",
    `tests/comparison/img/${funcName}_matplotlib.png`,
    settings.dx.replace(/\\/g, ""),
    settings.dy.replace(/\\/g, ""),
    settings.minX,
    settings.maxX,
    settings.minY,
    settings.maxY
  ]);
  pythonProcess.on("exit", ret => {
    console.log(`Ran python with return value ${ret}`);
  });
  pythonProcess.stdout.on("data", data => {
    console.log(data.toString());
  });
  pythonProcess.stderr.on("data", data => {
    console.error(data.toString());
  });
}

module.exports = {
  "Generate comparison cartesian graphs": function(browser) {
    let resultHTML = "";

    for (const [funcName, settings] of Object.entries(tests)) {
      runPython(funcName, settings);

      browser.resizeWindow(1280, 800);
      const main = browser.page.main();
      const tabMenu = main.section.tabMenu;
      const equations = main.section.equations;

      main.navigate();
      console.log(settings);
      equations.setCartesian(settings.dx, settings.dy, settings);
      browser.waitForElementVisible("body");
      browser.pause(500);
      browser.saveScreenshot(`tests/comparison/img/${funcName}_dodep.png`);

      resultHTML += `
    <img src="img/${funcName}_dodep.png">
    <img src="img/${funcName}_matplotlib.png">`;
    }

    fs.readFile("tests/comparison/index.html", "utf8", (err, data) => {
      if (err) return console.log(err);
      const result = data.replace(
        /<div class="generated">(?:.*\n?)*<\/div>/,
        `<div class="generated">${resultHTML}</div>`
      );
      fs.writeFile("tests/comparison/index.html", result, "utf8", err => {
        if (err) console.log(err);
      });
    });
  }
};
