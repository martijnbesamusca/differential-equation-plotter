const spawn = require("child_process").spawn;
const fs = require('fs');

module.exports = {
  "Generate comparison cartesian graphs": function(browser) {
    const funcName = 'bla';
    let resultHTML = '';

    const pythonProcess = spawn('python', ['tests/python/reference.py', funcName]);
    pythonProcess.on('exit', ret => {
      console.log(`Ran python with return value ${ret}`);
    });
    pythonProcess.stdout.on('data', data => {
      console.log(data.toString());
    });

    browser.resizeWindow(1280, 800);
    const main = browser.page.main();
    const tabMenu = main.section.tabMenu;
    const equations = main.section.equations;

    main.navigate();
    // tabMenu.click("@functions");
    equations.setCartesian(String.raw`x^2`, String.raw`\sin (y)`);
    browser.waitForElementVisible('body');
    browser.pause(1000);
    browser.saveScreenshot(`tests/comparison/img/${funcName}_dodep.png`);

    resultHTML += `
    <img src="img/${funcName}_dodep.png">
    <img src="img/${funcName}_matplotlib.png">`;

    fs.readFile('tests/comparison/index.html', 'utf8', (err, data) => {
      if (err) return console.log(err);
      const result = data.replace(/<div class="generated">(?:.*\n?)*<\/div>/, `<div class="generated">${resultHTML}</div>`);
      fs.writeFile('tests/comparison/index.html', result, 'utf8',  (err) => {if (err) console.log(err)});
    });
  }
};
