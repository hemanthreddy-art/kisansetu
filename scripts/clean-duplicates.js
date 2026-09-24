const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/i18n/translations.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  'tabComplaints: "Complaints & Issues",\r\n      tabComplaints: "Complaints & Issues",',
  'tabComplaints: "Complaints & Issues",'
);
text = text.replace(
  'tabComplaints: "Complaints & Issues",\n      tabComplaints: "Complaints & Issues",',
  'tabComplaints: "Complaints & Issues",'
);

text = text.replace(
  'tabComplaints: "तक्रारी व वाद",\r\n      tabComplaints: "तक्रारी व वाद",',
  'tabComplaints: "तक्रारी व वाद",'
);
text = text.replace(
  'tabComplaints: "तक्रारी व वाद",\n      tabComplaints: "तक्रारी व वाद",',
  'tabComplaints: "तक्रारी व वाद",'
);

text = text.replace(
  'tabComplaints: "ఫిర్యాదులు మరియు సమస్యలు",\r\n      tabComplaints: "ఫిర్యాదులు మరియు సమస్యలు",',
  'tabComplaints: "ఫిర్యాదులు మరియు సమస్యలు",'
);
text = text.replace(
  'tabComplaints: "ఫిర్యాదులు మరియు సమస్యలు",\n      tabComplaints: "ఫిర్యాదులు మరియు సమస్యలు",',
  'tabComplaints: "ఫిర్యాదులు మరియు సమస్యలు",'
);

text = text.replace(
  'tabComplaints: "शिकायतें एवं विवाद",\r\n      tabComplaints: "शिकायतें एवं विवाद",',
  'tabComplaints: "शिकायतें एवं विवाद",'
);
text = text.replace(
  'tabComplaints: "शिकायतें एवं विवाद",\n      tabComplaints: "शिकायतें एवं विवाद",',
  'tabComplaints: "शिकायतें एवं विवाद",'
);

fs.writeFileSync(file, text, 'utf8');
console.log('Successfully cleaned duplicate tabComplaints entries!');
