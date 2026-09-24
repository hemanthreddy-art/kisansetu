const fs = require('fs');
const path = require('path');

const transPath = path.resolve('src/i18n/translations.ts');
let code = fs.readFileSync(transPath, 'utf8');

// 1. In netRealisation interface, remove accidental Hindi literal block:
const badHindiBlock = `      storageScientificChawl: "वैज्ञानिक प्याज भंडारण",
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
`;

if (code.includes(badHindiBlock)) {
  code = code.replace(badHindiBlock, '');
}

// 2. In voice interface, add the 7 keys if not present
const voiceIfaceTarget = `    queryOffers: string;
    queryTxns: string;
  };

}`;

const voiceIfaceReplacement = `    queryOffers: string;
    queryTxns: string;
    typeQueryPlaceholder: string;
    askKisanSetu: string;
    confirmActionTitle: string;
    confirmActionPrompt: string;
    confirmButton: string;
    cancelButton: string;
    unrecognizedHelp: string;
  };

}`;

if (code.includes(voiceIfaceTarget)) {
  code = code.replace(voiceIfaceTarget, voiceIfaceReplacement);
}

fs.writeFileSync(transPath, code, 'utf8');
console.log('Cleaned and aligned translation interface.');
