const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const transPath = path.resolve('src/i18n/translations.ts');
let code = fs.readFileSync(transPath, 'utf8');

// 1. Remove duplicate interface entries if present
const keyBlock = `    storageScientificChawl: string;
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

// Deduplicate in interface
const firstIfaceIdx = code.indexOf(keyBlock);
if (firstIfaceIdx !== -1) {
  const secondIfaceIdx = code.indexOf(keyBlock, firstIfaceIdx + keyBlock.length);
  if (secondIfaceIdx !== -1) {
    code = code.slice(0, secondIfaceIdx) + code.slice(secondIfaceIdx + keyBlock.length);
  }
}

// 2. Check hi netRealisation
const hiIdx = code.indexOf('  hi: {');
const hiSvfIdx = code.indexOf('storageViewFacilities:', hiIdx);
const hiLineEnd = code.indexOf('\n', hiSvfIdx);

const hiNetRealisationValues = `      storageScientificChawl: "वैज्ञानिक प्याज भंडारण",
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

if (!code.slice(hiIdx, hiIdx + 60000).includes('storageScientificChawl: "वैज्ञानिक प्याज भंडारण"')) {
  code = code.slice(0, hiLineEnd + 1) + hiNetRealisationValues + code.slice(hiLineEnd + 1);
}

// Remove any accidentally injected hiNetRealisationValues in en section
const enIdx = code.indexOf('  en: {');
const mrIdx = code.indexOf('  mr: {');
if (code.slice(enIdx, mrIdx).includes('storageScientificChawl: "वैज्ञानिक प्याज भंडारण"')) {
  code = code.replace(hiNetRealisationValues, '');
  // re-insert into hi
  const newHiIdx = code.indexOf('  hi: {');
  const newHiSvf = code.indexOf('storageViewFacilities:', newHiIdx);
  const newHiLineEnd = code.indexOf('\n', newHiSvf);
  code = code.slice(0, newHiLineEnd + 1) + hiNetRealisationValues + code.slice(newHiLineEnd + 1);
}

fs.writeFileSync(transPath, code, 'utf8');
console.log('Fixed translations file.');
