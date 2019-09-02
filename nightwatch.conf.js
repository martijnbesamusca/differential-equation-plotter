const firefox = require('./tests/config/firefox.json');
const chrome = require('./tests/config/chrome.json');

module.exports = (function(settings) {
    settings.test_workers = false;
    return settings;
})(chrome);
