const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const transPath = path.resolve('src/i18n/translations.ts');
let content = fs.readFileSync(transPath, 'utf8');

// 1. Interface keys for netRealisation
const netRealisationInterfaceKeys = `    storageScientificChawl: string;
    filterByCrop: string;
    allDistricts: string;
    environment: string;
    recommendedDuration: string;
    suitableForYourCrop: string;
    sellNowOption: string;
    holding15d: string;
    holding30d: string;
    holding60d: string;
    holding90d: string;
    highestEstimatedOption: string;
    shrinkageLoss: string;
    storageNotEconomic: string;
    advisoryPriceNotice: string;
`;

// 2. Interface keys for voice
const voiceInterfaceKeys = `    typeQueryPlaceholder: string;
    askKisanSetu: string;
    confirmActionTitle: string;
    confirmActionPrompt: string;
    confirmButton: string;
    cancelButton: string;
    unrecognizedHelp: string;
`;

// Values for netRealisation
const netRealisationValues = {
  en: `      storageScientificChawl: "Scientific Onion Storage",
      filterByCrop: "Filter by Crop",
      allDistricts: "All Districts",
      environment: "Storage Atmosphere",
      recommendedDuration: "Recommended Duration",
      suitableForYourCrop: "Suitable for Selected Crop",
      sellNowOption: "Sell Now (Immediate Mandi Sale)",
      holding15d: "Store 15 Days",
      holding30d: "Store 30 Days",
      holding60d: "Store 60 Days",
      holding90d: "Store 90 Days",
      highestEstimatedOption: "★ Highest Estimated Return",
      shrinkageLoss: "Estimated Moisture/Spoilage Loss",
      storageNotEconomic: "Storage Not Economic — Sell Now",
      advisoryPriceNotice: "Future price projections are seasonal market estimates, not financial guarantees. Actual prices and shrinkage depend on crop moisture and mandi dynamics.",
`,
  mr: `      storageScientificChawl: "वैज्ञानिक कांदा चाळ",
      filterByCrop: "पिकानुसार फिल्टर",
      allDistricts: "सर्व जिल्हे",
      environment: "साठवणूक वातावरण",
      recommendedDuration: "शिफारस केलेला कालावधी",
      suitableForYourCrop: "निवडलेल्या पिकासाठी योग्य",
      sellNowOption: "आत्ताच विक्री (थेट बाजार समिती भाव)",
      holding15d: "१५ दिवस साठवणूक",
      holding30d: "३० दिवस साठवणूक",
      holding60d: "६० दिवस साठवणूक",
      holding90d: "९० दिवस साठवणूक",
      highestEstimatedOption: "★ सर्वाधिक अंदाजित नफा",
      shrinkageLoss: "अंदाजित घट व नासाडी",
      storageNotEconomic: "साठवणूक फायदेशीर नाही — आत्ताच विका",
      advisoryPriceNotice: "भविष्यातील भावांचे अंदाज हे हंगामी बाजार स्थितीवर आधारित आहेत, हमी नाही. प्रत्यक्ष भाव व घट ही पिकाची प्रत व बाजारावर अवलंबून असते.",
`,
  te: `      storageScientificChawl: "శాస్త్రీయ ఉల్లిపాయ నిల్వ",
      filterByCrop: "పంట ద్వారా ఫిల్టర్",
      allDistricts: "అన్ని జిల్లాలు",
      environment: "నిల్వ వాతావరణం",
      recommendedDuration: "సిఫార్సు చేయబడిన వ్యవధి",
      suitableForYourCrop: "ఎంచుకున్న పంటకు అనుకూలం",
      sellNowOption: "ఇప్పుడే అమ్మండి (తక్షణ మార్కెట్ అమ్మకం)",
      holding15d: "15 రోజులు నిల్వ",
      holding30d: "30 రోజులు నిల్వ",
      holding60d: "60 రోజులు నిల్వ",
      holding90d: "90 రోజులు నిల్వ",
      highestEstimatedOption: "★ అత్యధిక అంచనా రాబడి",
      shrinkageLoss: "అంచనా తేమ/పాడైపోయే నష్టం",
      storageNotEconomic: "నిల్వ చేయడం లాభదాయకం కాదు — ఇప్పుడే అమ్మండి",
      advisoryPriceNotice: "భవిష్యత్ ధరల అంచనాలు మార్కెట్ సీజన్ ఆధారంగా ఉంటాయి, గ్యారెంటీ కాదు. వాస్తవ ధరలు పంట తేమ మరియు మార్కెట్‌పై ఆధారపడి ఉంటాయి.",
`,
  hi: `      storageScientificChawl: "वैज्ञानिक प्याज भंडारण",
      filterByCrop: "फसल अनुसार फिल्टर",
      allDistricts: "सभी जिले",
      environment: "भंडारण वातावरण",
      recommendedDuration: "अनुशंसित अवधि",
      suitableForYourCrop: "चयनित फसल हेतु उपयुक्त",
      sellNowOption: "अभी बेचें (तत्काल मंडी बिक्री)",
      holding15d: "15 दिन भंडारण",
      holding30d: "30 दिन भंडारण",
      holding60d: "60 दिन भंडारण",
      holding90d: "90 दिन भंडारण",
      highestEstimatedOption: "★ उच्चतम अनुमानित लाभ",
      shrinkageLoss: "अनुमानित नमी व सड़न नुकसान",
      storageNotEconomic: "भंडारण आर्थिक रूप से उपयुक्त नहीं — अभी बेचें",
      advisoryPriceNotice: "भविष्य के मूल्य अनुमान मौसमी मंडी रुझानों पर आधारित हैं, वित्तीय गारंटी नहीं। वास्तविक मूल्य और नमी नुकसान फसल की गुणवत्ता पर निर्भर करते हैं।",
`,
};

// Values for voice
const voiceValues = {
  en: `    typeQueryPlaceholder: "Or type your question here (e.g. 'Show my crops', 'Find buyers')...",
    askKisanSetu: "Ask KisanSetu",
    confirmActionTitle: "Confirmation Required",
    confirmActionPrompt: "You are about to execute a consequential action. Please confirm to proceed:",
    confirmButton: "Confirm Action",
    cancelButton: "Cancel",
    unrecognizedHelp: "I didn't understand that. You can say or type:",
`,
  mr: `    typeQueryPlaceholder: "किंवा आपला प्रश्न येथे टाईप करा (उदा. 'माझी पिके दाखवा', 'खरेदीदार शोधा')...",
    askKisanSetu: "किसानसेतूला विचारा",
    confirmActionTitle: "पुष्टीकरण आवश्यक आहे",
    confirmActionPrompt: "आपण एक महत्त्वपूर्ण कृती करणार आहात. कृपया पुढे जाण्यासाठी पुष्टी करा:",
    confirmButton: "पुष्टी करा",
    cancelButton: "रद्द करा",
    unrecognizedHelp: "मला हे समजले नाही. आपण पुढीलप्रमाणे विचारू किंवा टाईप करू शकता:",
`,
  te: `    typeQueryPlaceholder: "లేదా మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి (ఉదా. 'నా పంటలను చూపించు', 'కొనుగోలుదారులను వెతకండి')...",
    askKisanSetu: "కిసాన్‌సేతును అడగండి",
    confirmActionTitle: "ధృవీకరణ అవసరం",
    confirmActionPrompt: "మీరు ఒక ముఖ్యమైన చర్యను అమలు చేయబోతున్నారు. దయచేసి కొనసాగించడానికి నిర్ధారించండి:",
    confirmButton: "నిర్ధారించండి",
    cancelButton: "రద్దు చేయండి",
    unrecognizedHelp: "నాకు అర్థం కాలేదు. మీరు ఇలా అడగవచ్చు లేదా టైప్ చేయవచ్చు:",
`,
  hi: `    typeQueryPlaceholder: "या अपना प्रश्न यहाँ लिखें (जैसे 'मेरी फसलें दिखाओ', 'खरीदार खोजें')...",
    askKisanSetu: "किसानसेतु से पूछें",
    confirmActionTitle: "पुष्टिकरण आवश्यक है",
    confirmActionPrompt: "आप एक महत्वपूर्ण कार्रवाई करने वाले हैं। कृपया आगे बढ़ने के लिए पुष्टि करें:",
    confirmButton: "पुष्टि करें",
    cancelButton: "रद्द करें",
    unrecognizedHelp: "मुझे समझ नहीं आया। आप इस प्रकार बोल या लिख सकते हैं:",
`,
};

// Insert into TranslationDictionary interface
if (!content.includes('storageScientificChawl: string;')) {
  content = content.replace(
    /storageViewFacilities: string;\n/,
    `storageViewFacilities: string;\n${netRealisationInterfaceKeys}`
  );
}

if (!content.includes('typeQueryPlaceholder: string;')) {
  content = content.replace(
    /queryTxns: string;\n  \};/,
    `queryTxns: string;\n${voiceInterfaceKeys}  };`
  );
}

// Insert into locales (en, mr, te, hi)
for (const loc of ['en', 'mr', 'te', 'hi']) {
  if (!content.includes(`storageScientificChawl: "${netRealisationValues[loc].match(/storageScientificChawl: "([^"]+)"/)[1]}"`)) {
    // Find netRealisation in this locale
    const locIdx = content.indexOf(`  ${loc}: {`);
    const nrIdx = content.indexOf('netRealisation: {', locIdx);
    const svfIdx = content.indexOf('storageViewFacilities:', nrIdx);
    const lineEnd = content.indexOf('\n', svfIdx);
    content = content.slice(0, lineEnd + 1) + netRealisationValues[loc] + content.slice(lineEnd + 1);
  }

  if (!content.includes(`typeQueryPlaceholder: "${voiceValues[loc].match(/typeQueryPlaceholder: "([^"]+)"/)[1]}"`)) {
    const locIdx = content.indexOf(`  ${loc}: {`);
    const vIdx = content.indexOf('voice: {', locIdx);
    const qTxIdx = content.indexOf('queryTxns:', vIdx);
    const lineEnd = content.indexOf('\n', qTxIdx);
    content = content.slice(0, lineEnd + 1) + voiceValues[loc] + content.slice(lineEnd + 1);
  }
}

fs.writeFileSync(transPath, content, 'utf8');
console.log('Successfully injected translations.');
