const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'i18n', 'translations.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Interface
const interfaceTarget = '    availTransporters: string;\n    };';
const interfaceReplacement = `    availTransporters: string;
    amountYouReceive: string;
    estAmountYouReceive: string;
    supplyThisCrop: string;
    ownTransportOption: string;
    bookTransporter: string;
    bestNetRealisation: string;
    estDeductionsNotice: string;
    };`;

if (!content.includes(interfaceTarget)) {
  console.error('Interface target not found');
  process.exit(1);
}
content = content.replace(interfaceTarget, interfaceReplacement);

// 2. en
const enTarget = '      availTransporters: "Available Verified Transporters",\n    },';
const enReplacement = `      availTransporters: "Available Verified Transporters",
      amountYouReceive: "Amount You Receive",
      estAmountYouReceive: "Estimated Amount You Receive",
      supplyThisCrop: "Supply This Crop",
      ownTransportOption: "Deliver myself / Arrange own vehicle (₹0 Transport)",
      bookTransporter: "Book KisanSetu Transporter",
      bestNetRealisation: "Best Net Realisation",
      estDeductionsNotice: "Estimated amount after expected transport and applicable deductions. Not a guaranteed payout until an offer is accepted.",
    },`;

if (!content.includes(enTarget)) {
  console.error('EN target not found');
  process.exit(1);
}
content = content.replace(enTarget, enReplacement);

// 3. mr
const mrTarget = '      availTransporters: "उपलब्ध प्रमाणित वाहतूकदार",\n    },';
const mrReplacement = `      availTransporters: "उपलब्ध प्रमाणित वाहतूकदार",
      amountYouReceive: "तुम्हाला मिळणारी निव्वळ रक्कम",
      estAmountYouReceive: "अंदाजे मिळणारी रक्कम",
      supplyThisCrop: "हा शेतमाल पुरवा",
      ownTransportOption: "स्वतःची वाहतूक व्यवस्था / फार्म-गेट डिलिव्हरी (₹0 वाहतूक खर्च)",
      bookTransporter: "किसानसेतू प्रमाणित वाहतूकदार निवडा",
      bestNetRealisation: "सर्वोत्तम निव्वळ प्राप्ती",
      estDeductionsNotice: "अपेक्षित वाहतूक आणि इतर कपातीनंतरची अंदाजे रक्कम. खरेदीदाराची बोली स्वीकारल्यानंतर अंतिम देयक निश्चित होईल.",
    },`;

if (!content.includes(mrTarget)) {
  console.error('MR target not found');
  process.exit(1);
}
content = content.replace(mrTarget, mrReplacement);

// 4. te
const teTarget = '      availTransporters: "అందుబాటులో ఉన్న ధృవీకరించబడిన రవాణాదారులు",\n    },';
const teReplacement = `      availTransporters: "అందుబాటులో ఉన్న ధృవీకరించబడిన రవాణాదారులు",
      amountYouReceive: "మీకు అందే నికర మొత్తం",
      estAmountYouReceive: "అంచనా వేసిన రాబడి మొత్తం",
      supplyThisCrop: "ఈ పంటను సరఫరా చేయండి",
      ownTransportOption: "సొంత రవాణా / ఫారమ్-గేట్ డెలివరీ (₹0 రవాణా ఖర్చు)",
      bookTransporter: "కిసాన్‌సేతు రవాణాదారుని ఎంచుకోండి",
      bestNetRealisation: "ఉత్తమ నికర రాబడి",
      estDeductionsNotice: "రవాణా మరియు తగ్గింపుల తర్వాత అంచనా వేసిన మొత్తం. ఆఫర్ ఆమోదించబడే వరకు ఇది హామీ ఇవ్వబడిన మొత్తం కాదు.",
    },`;

if (!content.includes(teTarget)) {
  console.error('TE target not found');
  process.exit(1);
}
content = content.replace(teTarget, teReplacement);

// 5. hi
const hiTarget = '      availTransporters: "उपलब्ध सत्यापित ट्रांसपोर्टर",\n    },';
const hiReplacement = `      availTransporters: "उपलब्ध सत्यापित ट्रांसपोर्टर",
      amountYouReceive: "आपको मिलने वाली शुद्ध राशि",
      estAmountYouReceive: "अनुमानित मिलने वाली राशि",
      supplyThisCrop: "यह फसल आपूर्ति करें",
      ownTransportOption: "स्वयं का परिवहन / फार्म-गेट डिलीवरी (₹0 भाड़ा)",
      bookTransporter: "किसानसेतु ट्रांसपोर्टर चुनें",
      bestNetRealisation: "सर्वोत्तम शुद्ध प्राप्ति",
      estDeductionsNotice: "अपेक्षित परिवहन और कटौती के बाद अनुमानित राशि। खरीदार का प्रस्ताव स्वीकार होने तक यह गारंटीकृत भुगतान नहीं है।",
    },`;

if (!content.includes(hiTarget)) {
  console.error('HI target not found');
  process.exit(1);
}
content = content.replace(hiTarget, hiReplacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected dual Net Realisation translations across all 4 locales!');
