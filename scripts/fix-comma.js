const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/i18n/translations.ts');
let text = fs.readFileSync(file, 'utf8');
text = text.replace(
  '"noDisputesFound": "कोई सक्रिय विवाद नहीं है।"\r\n      "reportIssueBtn"',
  '"noDisputesFound": "कोई सक्रिय विवाद नहीं है。",\r\n      "reportIssueBtn"'
);
text = text.replace(
  '"noDisputesFound": "कोई सक्रिय विवाद नहीं है。"\n      "reportIssueBtn"',
  '"noDisputesFound": "कोई सक्रिय विवाद नहीं है。",\n      "reportIssueBtn"'
);
fs.writeFileSync(file, text, 'utf8');
console.log('Fixed comma successfully!');
