'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  Send,
  CheckCircle2,
  XCircle,
  Compass,
} from 'lucide-react';

/**
 * Prototype voice assistant: purely informational and navigational.
 * Never executes financial commitments, offer acceptances, or status mutations without explicit visual confirmation.
 */
export type VoiceIntent =
  | 'MARKET_PRICE'
  | 'BEST_MANDI_PRICE'
  | 'STORE_VS_SELL'
  | 'STORAGE_OPTIONS'
  | 'FIND_BUYER'
  | 'NET_REALISATION'
  | 'FIND_TRANSPORT'
  | 'VIEW_OFFERS'
  | 'VIEW_TRANSACTIONS'
  | 'NAVIGATE_CROPS'
  | 'NAVIGATE_STORAGE'
  | 'NAVIGATE_CALCULATOR'
  | 'NAVIGATE_DELIVERIES'
  | 'NAVIGATE_DEMANDS'
  | 'NAVIGATE_COMPLAINTS'
  | 'SELL_CROP'
  | 'SELL_WORKFLOW'
  | 'CROP_STATUS_INFO'
  | 'OFFER_WORKFLOW'
  | 'TRANSPORT_DAMAGE'
  | 'DISPUTE_INFO'
  | 'QUALITY_ASSESSMENT_INFO'
  | 'PAYMENT_ESCROW_INFO'
  | 'PLATFORM_INFO'
  | 'CONSEQUENTIAL_ACTION'
  | 'HELP'
  | 'UNRECOGNIZED';

export interface VoiceResult {
  intent: VoiceIntent;
  title: string;
  responseText: string;
  actionLabel?: string;
  actionUrl?: string;
  icon?: React.ReactNode;
  details?: Array<{ label: string; value: string }>;
  isConsequential?: boolean;
  requiresConfirmation?: boolean;
  confirmationWarning?: string;
  confirmedActionUrl?: string;
  detectedLanguage?: string;
}

export function parseFarmerIntent(text: string, locale: string): VoiceResult {
  const q = text.toLowerCase().trim();

  // Multi-Language Script & Keyword Detection
  // Supports English ('en'), Marathi ('mr'), Telugu ('te'), and Hindi ('hi')
  let detectedLang = 'en';

  if (/[\u0C00-\u0C7F]/.test(text)) {
    // Telugu Unicode block
    detectedLang = 'te';
  } else if (/[\u0900-\u097F]/.test(text)) {
    // Devanagari script: differentiate Marathi vs Hindi
    const hasMarathiChars = /[\u0933]/.test(text); // 'ळ'
    const mrKeywords = [
      'माझी', 'माझे', 'माझा', 'माझ्या', 'पिके', 'पीक', 'माल', 'तक्रार', 'तक्रारी',
      'वाहतूक', 'साठवणूक', 'उघडा', 'दाखवा', 'नफा', 'भाडे', 'मिळाले', 'नाहीत',
      'करा', 'कांदा', 'गूळ', 'विक्री', 'विका', 'शेतमाल', 'आहे', 'कसे', 'काय',
      'मदत', 'खरेदीदार', 'पडताळणी', 'चाळ', 'गोदामे', 'सर्वोच्च', 'सांगा', 'नाही',
      'गहू', 'टोमॅटो', 'सोयाबीन', 'बटाटा', 'द्राक्षे', 'दर', 'भाव', 'किती', 'कोठे', 'कुठे',
      'आत्ता', 'नुकसान', 'कमी', 'गुणवत्ता', 'विकू', 'नंतर', 'स्थिती'
    ];
    const hiKeywords = [
      'मेरी', 'मेरा', 'मेरे', 'फसलें', 'फसल', 'शिकायत', "शिकायतें",
      'परिवहन', 'भंडारण', 'खोलें', 'दिखाओ', 'दिखाइए', 'मुनाफा', 'मिला', 'नहीं',
      'करें', 'प्याज', 'गुड़', 'बेचें', 'बिक्री', 'है', 'कैसे', 'क्या',
      'मदद', 'सौदा', 'सौदे', 'खरीदार', 'सत्यापित', 'चाली', 'उच्चतम', 'बताओ',
      'गेहूं', 'टमाटर', 'सोयाबीन', 'आलू', 'अंगूर', 'भाव', 'कितना', 'कहाँ', 'कहा',
      'अभी', 'नुकसान', 'खराब', 'कम', 'मूल्यांकन', 'बाद', 'स्थिति', 'चाहिए'
    ];

    let mrScore = hasMarathiChars ? 3 : 0;
    let hiScore = 0;
    for (let i = 0; i < mrKeywords.length; i++) {
      if (q.indexOf(mrKeywords[i]) !== -1) mrScore++;
    }
    for (let i = 0; i < hiKeywords.length; i++) {
      if (q.indexOf(hiKeywords[i]) !== -1) hiScore++;
    }

    if (mrScore > hiScore) {
      detectedLang = 'mr';
    } else if (hiScore > mrScore) {
      detectedLang = 'hi';
    } else if (locale === 'mr') {
      detectedLang = 'mr';
    } else if (locale === 'hi') {
      detectedLang = 'hi';
    } else {
      detectedLang = 'mr';
    }
  } else if (/[a-zA-Z]/.test(text)) {
    // English or Romanized/Transliterated
    const hiTranslit = ['mera', 'meri', 'mere', 'kya', 'hai', 'kaise', 'bhav', 'kaha', 'kahan', 'kitna', 'kare', 'tamatar', 'pyaz', 'gehu', 'paisa', 'kharab', 'beche'];
    const mrTranslit = ['majha', 'majhi', 'kasa', 'kashi', 'aahe', 'sanga', 'kanda', 'gahuk', 'bhav', 'kuthe', 'vikava', 'nuksan'];
    let hiTrCount = 0;
    let mrTrCount = 0;
    for (let i = 0; i < hiTranslit.length; i++) {
      if (q.indexOf(hiTranslit[i]) !== -1) hiTrCount++;
    }
    for (let i = 0; i < mrTranslit.length; i++) {
      if (q.indexOf(mrTranslit[i]) !== -1) mrTrCount++;
    }
    if (hiTrCount > 0 && hiTrCount >= mrTrCount) {
      detectedLang = 'hi';
    } else if (mrTrCount > 0) {
      detectedLang = 'mr';
    } else {
      detectedLang = 'en';
    }
  } else if (locale === 'mr' || locale === 'te' || locale === 'hi') {
    detectedLang = locale;
  } else {
    detectedLang = 'en';
  }

  const respLocale = detectedLang;

  // 1. CONSEQUENTIAL ACTION DETECTION (Strict Safety: Requires Explicit Farmer Visual Confirmation)
  const isDirectPaymentDispute =
    q.indexOf('payment problem') !== -1 ||
    q.indexOf('report a payment problem') !== -1 ||
    q.indexOf('report payment problem') !== -1 ||
    q.indexOf('payment issue') !== -1 ||
    q.indexOf('report payment issue') !== -1 ||
    q.indexOf('report an issue') !== -1 ||
    q.indexOf('file a complaint') !== -1 ||
    q.indexOf('file complaint') !== -1 ||
    q.indexOf('raise dispute') !== -1 ||
    q.indexOf('money not received') !== -1 ||
    q.indexOf('payment not received') !== -1 ||
    q.indexOf('पैसे मिळाले नाहीत') !== -1 ||
    q.indexOf('पेमेंट समस्या') !== -1 ||
    q.indexOf('पेमेंट मिळाले नाही') !== -1 ||
    q.indexOf('तक्रार नोंदवा') !== -1 ||
    q.indexOf('समस्या नोंदवा') !== -1 ||
    q.indexOf('तक्रार करा') !== -1 ||
    q.indexOf('नाకు చెల్లింపు రాలేదు') !== -1 ||
    q.indexOf('చెల్లింపు రాలేదు') !== -1 ||
    q.indexOf('చెల్లింపు సమస్య') !== -1 ||
    q.indexOf('ఫిర్యాదు చేయండి') !== -1 ||
    q.indexOf('సమస్యను నివేదించండి') !== -1 ||
    q.indexOf('मुझे भुगतान नहीं मिला') !== -1 ||
    q.indexOf('भुगतान नहीं मिला') !== -1 ||
    q.indexOf('भुगतान समस्या') !== -1 ||
    q.indexOf('शिकायत दर्ज करें') !== -1 ||
    q.indexOf('समस्या दर्ज करें') !== -1 ||
    q.indexOf('पैसे नहीं मिले') !== -1;

  const isAcceptOffer =
    (q.indexOf('accept offer') !== -1 ||
     q.indexOf('स्वीकार करा') !== -1 ||
     q.indexOf('स्वीकार') !== -1 ||
     q.indexOf('ఆఫర్ అంగీకరించు') !== -1 ||
     q.indexOf('అంగీకరించు') !== -1 ||
     q.indexOf('ऑफर स्वीकार') !== -1 ||
     q.indexOf('स्वीकार करें') !== -1) &&
    q.indexOf('after') === -1 &&
    q.indexOf('नंतर') === -1 &&
    q.indexOf('తర్వాత') === -1 &&
    q.indexOf('बाद') === -1 &&
    q.indexOf('what happens') === -1;

  const isBookTransport =
    (q.indexOf('book transport') !== -1 ||
     q.indexOf('वाहतूक बुक') !== -1 ||
     q.indexOf('गाडी बुक') !== -1 ||
     q.indexOf('రవాణా బుక్') !== -1 ||
     q.indexOf('ट्रांसपोर्ट बुक') !== -1 ||
     q.indexOf('गाड़ी बुक') !== -1) &&
    !/\bhow\b/.test(q) &&
    q.indexOf('कसे') === -1 &&
    q.indexOf('कशी') === -1 &&
    q.indexOf('ఎలా') === -1 &&
    q.indexOf('कैसे') === -1;

  const isPublishCrop =
    q.indexOf('publish crop') !== -1 ||
    q.indexOf('पिक प्रकाशित') !== -1 ||
    q.indexOf('लॉट प्रकाशित') !== -1;

  if (isDirectPaymentDispute || isAcceptOffer || isBookTransport || isPublishCrop) {
    let targetUrl = '/lots';
    let actionTitle = 'Action Confirmation Required';
    let warningText = 'You are requesting a consequential operation. For your protection, KisanSetu requires explicit visual confirmation before executing.';
    let btnLabel = 'Confirm & Proceed';

    if (isDirectPaymentDispute) {
      targetUrl = '/farmer?tab=COMPLAINTS';
      actionTitle =
        respLocale === 'mr'
          ? 'तक्रार नोंदणी पुष्टी'
          : respLocale === 'te'
          ? 'ఫిర్యాదు నమోదు నిర్ధారణ'
          : respLocale === 'hi'
          ? 'शिकायत दर्ज करने की पुष्टि'
          : 'Grievance Filing Confirmation';
      warningText =
        respLocale === 'mr'
          ? 'तुम्ही व्यापार व्यवहार किंवा पेमेंट संदर्भात अधिकृत तक्रार नोंदवण्याची विनंती केली आहे. कृपया पुष्टी करा.'
          : respLocale === 'te'
          ? 'మీరు చెల్లింపు లేదా వ్యాపార లావాదేవీపై అధికారిక ఫిర్యాదు నమోదు చేయాలని అభ్యర్థించారు. దయచేసి నిర్ధారించండి.'
          : respLocale === 'hi'
          ? 'आपने भुगतान अथवा व्यापार सौदे पर आधिकारिक शिकायत दर्ज करने का अनुरोध किया है। कृपया पुष्टि करें।'
          : 'You are initiating a formal grievance regarding a trade transaction or payment. Please verify and confirm to proceed.';
      btnLabel =
        respLocale === 'mr'
          ? 'पुष्टी करा व तक्रार उघडा'
          : respLocale === 'te'
          ? 'నిర్ధారించి ఫిర్యాదు తెరవండి'
          : respLocale === 'hi'
          ? 'पुष्टि करें और शिकायत खोलें'
          : 'Confirm & Open Complaint';
    } else if (isBookTransport) {
      targetUrl = '/transporter';
      actionTitle =
        respLocale === 'mr'
          ? 'वाहतूक बुकिंग पुष्टी'
          : respLocale === 'te'
          ? 'రవాణా బుకింగ్ నిర్ధారణ'
          : respLocale === 'hi'
          ? 'परिवहन बुकिंग पुष्टि'
          : 'Transport Booking Confirmation';
      warningText =
        respLocale === 'mr'
          ? 'तुम्ही शेतीमालासाठी व्यावसायिक वाहतूक बुक करण्याची विनंती केली आहे. कृपया पुष्टी करा.'
          : respLocale === 'te'
          ? 'మీరు రవాణా బుకింగ్ అభ్యర్థించారు. దయచేసి కొనసాగడానికి నిర్ధారించండి.'
          : respLocale === 'hi'
          ? 'आपने उपज के लिए व्यावसायिक परिवहन बुक करने का अनुरोध किया है। कृपया पुष्टि करें।'
          : 'You requested commercial transport booking for your produce. Please verify and confirm to proceed.';
      btnLabel =
        respLocale === 'mr'
          ? 'पुष्टी करा व पुढे जा'
          : respLocale === 'te'
          ? 'నిర్ధారించి కొనసాగండి'
          : respLocale === 'hi'
          ? 'पुष्टि करें और आगे बढ़ें'
          : 'Confirm & Proceed';
    } else {
      actionTitle =
        respLocale === 'mr'
          ? 'ऑफर स्वीकृती पुष्टी'
          : respLocale === 'te'
          ? 'ఆఫర్ ఆమోదం నిర్ధారణ'
          : respLocale === 'hi'
          ? 'ऑफर स्वीकृति पुष्टि'
          : 'Offer Acceptance Confirmation';
      warningText =
        respLocale === 'mr'
          ? 'तुम्ही खरेदीदाराची व्यापारी ऑफर स्वीकारण्याची विनंती केली आहे. ही कायदेशीर वचनबद्धता असल्याने स्पष्ट पुष्टी आवश्यक आहे.'
          : respLocale === 'te'
          ? 'మీరు కొనుగోలుదారు ఆఫర్‌ను అంగీకరించాలని కోరారు. ఇది అధికారిక నిబద్ధత కాబట్టి స్పష్టమైన నిర్ధారణ అవసరం.'
          : respLocale === 'hi'
          ? 'आपने खरीदार का व्यापार ऑफर स्वीकार करने का अनुरोध किया है। आधिकारिक प्रतिबद्धता हेतु स्पष्ट पुष्टि आवश्यक है।'
          : 'You requested to accept a trade offer. This creates a commercial contract and requires explicit confirmation.';
      btnLabel =
        respLocale === 'mr'
          ? 'पुष्टी करा व पुढे जा'
          : respLocale === 'te'
          ? 'నిర్ధారించి కొనసాగండి'
          : respLocale === 'hi'
          ? 'पुष्टि करें और आगे बढ़ें'
          : 'Confirm & Proceed';
    }

    const responseText =
      targetUrl === '/farmer?tab=COMPLAINTS'
        ? (respLocale === 'mr'
            ? 'तक्रार नोंदवण्यासाठी स्पष्ट पुष्टी आवश्यक आहे. तपशील तपासून तक्रार पोर्टल उघडण्यासाठी पुष्टी करा.'
            : respLocale === 'te'
            ? 'ఫిర్యాదు నమోదు చేయడానికి స్పష్టమైన నిర్ధారణ అవసరం. దయచేసి సమీక్షించి కొనసాగడానికి నిర్ధారించండి.'
            : respLocale === 'hi'
            ? 'शिकायत दर्ज करने हेतु स्पष्ट पुष्टि आवश्यक है। कृपया विवरण की समीक्षा करें और पुष्टि करें।'
            : 'Filing a formal dispute requires your explicit confirmation. Please review and confirm to proceed to the complaint portal.')
        : (respLocale === 'mr'
            ? 'ही एक महत्त्वपूर्ण कृती आहे ज्यासाठी तुमची स्पष्ट पुष्टी आवश्यक आहे. कृपया तपशील तपासा आणि पुढे जाण्यासाठी पुष्टी करा.'
            : respLocale === 'te'
            ? 'ఇది ముఖ్యమైన చర్య, దీనికి మీ స్పష్టమైన నిర్ధారణ అవసరం. దయచేసి వివరాలను సమీక్షించి, కొనసాగడానికి నిర్ధారించండి.'
            : respLocale === 'hi'
            ? 'यह एक महत्वपूर्ण कार्य है जिसके लिए आपकी स्पष्ट पुष्टि आवश्यक है। कृपया विवरण की समीक्षा करें और पुष्टि करें।'
            : 'This is a consequential action requiring your explicit visual confirmation. Please review the details and click confirm to proceed.');

    return {
      intent: 'CONSEQUENTIAL_ACTION',
      title: actionTitle,
      responseText: responseText,
      isConsequential: true,
      requiresConfirmation: true,
      confirmationWarning: warningText,
      confirmedActionUrl: targetUrl,
      actionLabel: btnLabel,
      actionUrl: targetUrl,
      detectedLanguage: detectedLang,
      details: [
        { label: 'Safety Level', value: 'High • Explicit User Authorization Required' },
        { label: 'Action Type', value: targetUrl === '/farmer?tab=COMPLAINTS' ? 'Grievance Filing' : targetUrl === '/transporter' ? 'Logistics Booking' : 'Offer Acceptance' },
        { label: 'Destination', value: targetUrl },
      ],
    };
  }

  // ----------------------------------------------------
  // GENERAL KISANSETU AI ASSISTANT: PRIORITIZED DOMAIN QUERIES
  // ----------------------------------------------------

  // Q1: BEST MANDI PRICE QUERY
  const isBestPriceQuery =
    (q.indexOf('best') !== -1 ||
     q.indexOf('highest') !== -1 ||
     q.indexOf('which mandi') !== -1 ||
     q.indexOf('which market') !== -1 ||
     q.indexOf('सर्वोत्तम') !== -1 ||
     q.indexOf('सर्वोच्च') !== -1 ||
     q.indexOf('सर्वात जास्त') !== -1 ||
     q.indexOf('कोणत्या मंडी') !== -1 ||
     q.indexOf('कोणत्या बाजारात') !== -1 ||
     q.indexOf('ఉత్తమ') !== -1 ||
     q.indexOf('అత్యధిక') !== -1 ||
     q.indexOf('ఏ మార్కెట్') !== -1 ||
     q.indexOf('सबसे अच्छा') !== -1 ||
     q.indexOf('सबसे ज्यादा') !== -1 ||
     q.indexOf('उच्चतम') !== -1 ||
     q.indexOf('किस मंडी') !== -1) &&
    (q.indexOf('price') !== -1 ||
     q.indexOf('rate') !== -1 ||
     q.indexOf('bhav') !== -1 ||
     q.indexOf('भाव') !== -1 ||
     q.indexOf('दर') !== -1 ||
     q.indexOf('ధర') !== -1 ||
     q.indexOf('मंडी') !== -1 ||
     q.indexOf('market') !== -1 ||
     q.indexOf('onion') !== -1 ||
     q.indexOf('कांदा') !== -1 ||
     q.indexOf('प्याज') !== -1);

  if (isBestPriceQuery) {
    let cropName = 'Onion';
    let bestMandi = 'Pimpalgaon Baswant APMC';
    let bestPrice = '₹2,220 / Qtl';
    let compTextEn = "Pimpalgaon Baswant APMC currently offers the highest onion price at ₹2,220 / Qtl (range ₹1,900 - ₹2,480), compared to Lasalgaon at ₹2,150 / Qtl, Pune Market Yard at ₹2,100 / Qtl, and Solapur at ₹1,950 / Qtl.";
    let compTextMr = 'पिंपळगाव बसवंत एपीएमसीमध्ये सध्या कांद्याला सर्वोच्च भाव ₹२,२२० प्रति क्विंटल मिळत आहे (कक्षा ₹१,९०० - ₹२,४८०). लासलगावमध्ये ₹२,१५०, पुण्यात ₹२,१०० आणि सोलापूरमध्ये ₹१,९५० भाव आहे.';
    let compTextTe = 'పింపల్‌గావ్ బస్వంత్ మార్కెట్‌లో ప్రస్తుతం ఉల్లిపాయకు అత్యధిక ధర క్వింటాల్‌కు ₹2,220 (పరిధి ₹1,900 - ₹2,480) లభిస్తోంది. లసల్‌గావ్‌లో ₹2,150, పూణేలో ₹2,100 మరియు సోలాపూర్‌లో ₹1,950 ఉంది.';
    let compTextHi = 'पिंपलगांव बसवंत एपीएमसी में वर्तमान में प्याज का सबसे अच्छा भाव ₹२,२२० प्रति क्विंटल है (दायरा ₹१,९०० - ₹२,४८०)। लासलगांव में ₹२,१५०, पुणे में ₹२,१०० और सोलापूर में ₹१,९५० है।';

    if (q.indexOf('tomato') !== -1 || q.indexOf('टोमॅटो') !== -1 || q.indexOf('టమోటా') !== -1 || q.indexOf('टमाटर') !== -1) {
      cropName = 'Tomato';
      bestMandi = 'Narayangaon APMC';
      bestPrice = '₹1,680 / Qtl';
      compTextEn = 'Narayangaon APMC offers the best tomato price at ₹1,680 / Qtl, compared to Pune Market Yard at ₹1,600 / Qtl and Nashik APMC at ₹1,550 / Qtl.';
      compTextMr = 'नारायणगाव एपीएमसीमध्ये टोमॅटोला सर्वोच्च भाव ₹१,६८० प्रति क्विंटल मिळत आहे, तर पुणे मार्केट यार्डमध्ये ₹१,६०० आणि नाशिकमध्ये ₹१,५५० भाव आहे.';
      compTextTe = 'నారాయణగావ్ మార్కెట్‌లో టమోటాకు అత్యుత్తమ ధర క్వింటాల్‌కు ₹1,680 లభిస్తోంది, పూణేలో ₹1,600 మరియు నాసిక్‌లో ₹1,550 గా ఉంది.';
      compTextHi = 'नारायणगांव एपीएमसी में टमाटर का सर्वोत्तम भाव ₹१,६८० प्रति क्विंटल है, जबकि पुणे में ₹१,६०० और नासिक में ₹१,५५० है।';
    } else if (q.indexOf('wheat') !== -1 || q.indexOf('गहू') !== -1 || q.indexOf('గోధుమ') !== -1 || q.indexOf('गेहूं') !== -1) {
      cropName = 'Wheat';
      bestMandi = 'Kalyan APMC';
      bestPrice = '₹2,850 / Qtl';
      compTextEn = 'Kalyan APMC offers the highest wheat price at ₹2,850 / Qtl, compared to Pune APMC at ₹2,780 / Qtl and Nagpur at ₹2,720 / Qtl.';
      compTextMr = 'कल्याण एपीएमसीमध्ये गव्हाला सर्वोच्च भाव ₹२,८५० प्रति क्विंटल मिळत आहे, तर पुणे एपीएमसीमध्ये ₹२,७८० आणि नागपूरमध्ये ₹२,७२० भाव आहे.';
      compTextTe = 'కల్యాణ్ మార్కెట్‌లో గోధుమలకు అత్యధిక ధర క్వింటాల్‌కు ₹2,850 లభిస్తోంది, పూణేలో ₹2,780 మరియు నాగపూర్‌లో ₹2,720 గా ఉంది.';
      compTextHi = 'कल्याण एपीएमसी में गेहूं का सर्वोत्तम भाव ₹२,८५० प्रति क्विंटल है, जबकि पुणे में ₹२,७८० और नागपुर में ₹२,७२० है।';
    } else if (q.indexOf('soybean') !== -1 || q.indexOf('सोयाबीन') !== -1 || q.indexOf('సోయాబీన్') !== -1) {
      cropName = 'Soybean';
      bestMandi = 'Latur APMC';
      bestPrice = '₹4,650 / Qtl';
      compTextEn = 'Latur APMC leads with the best soybean price at ₹4,650 / Qtl, beating Akola at ₹4,580 / Qtl and Nanded at ₹4,520 / Qtl.';
      compTextMr = 'लातूर एपीएमसीमध्ये सोयाबीनला सर्वाधिक ₹४,६५० प्रति क्विंटल भाव मिळत आहे, अकोला (₹४,५८०) व नांदेड (₹४,५२०) पेक्षा जास्त आहे.';
      compTextTe = 'లాతూర్ మార్కెట్‌లో సోయాబీన్‌కు అత్యధిక ధర క్వింటాల్‌కు ₹4,650 లభిస్తోంది, అకోలా (₹4,580) కంటే ఎక్కువ.';
      compTextHi = 'लातूर एपीएमसी में सोयाबीन का सर्वोत्तम भाव ₹४,६५० प्रति क्विंटल है, जो अकोला (₹४,५८०) से अधिक है।';
    }

    const responseText =
      respLocale === 'mr' ? compTextMr : respLocale === 'te' ? compTextTe : respLocale === 'hi' ? compTextHi : compTextEn;

    return {
      intent: 'BEST_MANDI_PRICE',
      title: respLocale === 'mr' ? 'सर्वोत्तम मंडी भाव तुलना' : respLocale === 'te' ? 'ఉత్తమ మార్కెట్ ధరల పోలిక' : respLocale === 'hi' ? 'सर्वोत्तम मंडी भाव तुलना' : 'Best Mandi Price Comparison',
      responseText: responseText,
      actionLabel: respLocale === 'mr' ? 'मंडी दर पहा' : respLocale === 'te' ? 'మార్కెట్ ధరలు చూడండి' : respLocale === 'hi' ? 'मंडी भाव देखें' : 'View Mandi Price Board',
      actionUrl: '/markets',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Top Paying Mandi', value: bestMandi },
        { label: 'Highest Modal Price', value: bestPrice },
        { label: 'Commodity', value: cropName },
      ],
    };
  }

  // Q2: STORE VS SELL DECISION & 30 DAYS HOLDING ECONOMICS
  const isStoreVsSellQuery =
    ((q.indexOf('store') !== -1 || q.indexOf('storage') !== -1 || q.indexOf('साठव') !== -1 || q.indexOf('चाळ') !== -1 || q.indexOf('నిల్వ') !== -1 || q.indexOf('भंडार') !== -1) &&
     (q.indexOf('sell') !== -1 || q.indexOf('विका') !== -1 || q.indexOf('विकू') !== -1 || q.indexOf('అమ్మ') !== -1 || q.indexOf('बेच') !== -1)) ||
    q.indexOf('30 day') !== -1 ||
    q.indexOf('30 days') !== -1 ||
    q.indexOf('३० दिवस') !== -1 ||
    q.indexOf('30 రోజు') !== -1 ||
    q.indexOf('३० दिन') !== -1 ||
    q.indexOf('30 din') !== -1;

  if (isStoreVsSellQuery) {
    let responseText = '';
    if (q.indexOf('tomato') !== -1 || q.indexOf('टोमॅटो') !== -1 || q.indexOf('టమోటా') !== -1 || q.indexOf('टमाटर') !== -1) {
      responseText =
        respLocale === 'mr'
          ? 'टोमॅटो अत्यंत नाशवंत (आयुर्मान ३-७ दिवस) असल्याने सामान्य गोदामात ३० दिवस साठवता येत नाही; तो सडेल. आजच्या ₹१,६०० प्रति क्विंटल भावाने थेट विक्री करणे किंवा प्रक्रिया उद्योगांना पुरवणे हाच योग्य निर्णय आहे.'
          : respLocale === 'te'
          ? 'టమోటా త్వరగా పాడయ్యే పంట (3-7 రోజులు మాత్రమే నిల్వ ఉంటుంది). సాధారణ గిడ్డంగులలో 30 రోజులు నిల్వ చేయడం సాధ్యం కాదు. నేటి మార్కెట్ ధర ₹1,600 వద్ద వెంటనే విక్రయించడం మంచిది.'
          : respLocale === 'hi'
          ? 'टमाटर शीघ्र नाशवान फसल है (जीवनकाल ३-७ दिन)। सामान्य गोदाम में ३० दिन भंडारित करना संभव नहीं है, सड़न हो जाएगी। आज के ₹१,६०० भाव पर तुरंत बेचना या प्रोसेसिंग खरीदार को देना ही सही है।'
          : "Tomato is highly perishable (shelf life 3-7 days) and cannot be stored in standard warehouses for 30 days without spoiling. Selling now at today's market price (~₹1,600/Qtl) or directly to food processors is recommended.";
    } else {
      responseText =
        respLocale === 'mr'
          ? 'तुमचा कांदा प्रत A/B चा आणि चांगला वाळलेला असल्यास ३० दिवस चाळीत साठवणे फायदेशीर आहे. साठवणूक खर्च महिना ₹६५ प्रति क्विंटल व २.५% वजन घट येते, तर आवक कमी झाल्यावर भावात ₹३०० ते ₹५०० ची वाढ अपेक्षित आहे. आर्द्रता जास्त असल्यास आजच विकावे.'
          : respLocale === 'te'
          ? 'మీ ఉల్లిపాయ గ్రేడ్ A/B నాణ్యత కలిగి ఉంటే, 30 రోజులు గిడ్డంగిలో నిల్వ చేయడం లాభదాయకం. నిల్వ ఖర్చు నెలకు క్వింటాల్‌కు ₹65 కాగా, రాబోయే రోజుల్లో ధర క్వింటాల్‌కు ₹300-₹500 పెరిగే అవకాశం ఉంది. తేమ ఎక్కువ ఉంటే వెంటనే అమ్మండి.'
          : respLocale === 'hi'
          ? 'यदि आपका प्याज ग्रेड A/B का और अच्छी तरह सूखा है, तो ३० दिन चाली में भंडारित करना आर्थिक रूप से बेहतर है। भंडारण खर्च लगभग ₹६५/क्विंटल/माह और २.५% वजन घट है, जबकि आगामी दिनों में भाव ₹३००–₹५०० बढ़ने का अनुमान है।'
          : "If your onion is Grade A/B with low moisture, storing for 30 days in a ventilated chawl is economically viable. Storage costs approx ₹65/Qtl/month with ~2.5% natural shrinkage, while lean-season prices are projected to rise by ₹300–₹500/Qtl. If moisture is high (>14%), sell immediately at today's ₹2,150–₹2,220/Qtl to avoid rotting.";
    }

    return {
      intent: 'STORE_VS_SELL',
      title: respLocale === 'mr' ? 'साठवणूक विरुद्ध विक्री निर्णय' : respLocale === 'te' ? 'నిల్వ vs విక్రయం నిర్ణయం' : respLocale === 'hi' ? 'भंडारण बनाम बिक्री विश्लेषण' : 'Store vs Sell Economic Analysis',
      responseText: responseText,
      actionLabel: respLocale === 'mr' ? 'गोदामे व नफा कॅल्क्युलेटर' : respLocale === 'te' ? 'గిడ్డంగులు & కాలిక్యులేటర్' : respLocale === 'hi' ? 'गोदाम व मुनाफा कैलकुलेटर' : 'Compare Holding Returns',
      actionUrl: '/storage',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Storage Cost', value: '₹60 - ₹75 / Quintal / Month' },
        { label: 'Expected Price Upside', value: '+₹300 to +₹500 / Quintal' },
        { label: 'Decision Recommendation', value: 'Store dry Grade A/B; Sell high moisture lots now' },
      ],
    };
  }

  // Q3: CROP SPECIFIC STORAGE OPTIONS (Wheat, Tomato, etc.)
  const isStorageOptionsQuery =
    (q.indexOf('where') !== -1 ||
     q.indexOf('option') !== -1 ||
     q.indexOf('options') !== -1 ||
     q.indexOf('कहाँ') !== -1 ||
     q.indexOf('कहा') !== -1 ||
     q.indexOf('कोठे') !== -1 ||
     q.indexOf('कुठे') !== -1 ||
     q.indexOf('ఎక్కడ') !== -1 ||
     q.indexOf('पर्याय') !== -1 ||
     q.indexOf('ఎంపిక') !== -1 ||
     q.indexOf('विकल्प') !== -1) &&
    (q.indexOf('storage') !== -1 ||
     q.indexOf('store') !== -1 ||
     q.indexOf('साठव') !== -1 ||
     q.indexOf('गोदाम') !== -1 ||
     q.indexOf('निల్వ') !== -1 ||
     q.indexOf('గిడ్డంగి') !== -1 ||
     q.indexOf('भंडार') !== -1);

  if (isStorageOptionsQuery) {
    let cropName = 'Produce';
    let responseText = '';
    const actionUrl = '/storage';

    if (q.indexOf('wheat') !== -1 || q.indexOf('गहू') !== -1 || q.indexOf('గోధుమ') !== -1 || q.indexOf('गेहूं') !== -1) {
      cropName = 'Wheat';
      responseText =
        respLocale === 'mr'
          ? 'गहू ६ ते १२ महिन्यांसाठी महाराष्ट्रातील डब्ल्यूडीआरए प्रमाणित गोदामांमध्ये (उदा. एमएसडब्ल्यूसी नाशिक, सीडब्ल्यूसी पुणे) सुरक्षित साठवता येतो. येथे आर्द्रता नियंत्रण, कीड नियंत्रण आणि ७५% बँक तारण कर्जासाठी ई-एनडब्ल्यूआर पावती मिळते.'
          : respLocale === 'te'
          ? 'గోధుమలను మహారాష్ట్రలోని WDRA గుర్తింపు పొందిన గిడ్డంగులలో (MSWC నాసిక్, CWC పూణే) 6 నుండి 12 నెలల వరకు భద్రపరుచుకోవచ్చు. ఇవి 75% బ్యాంక్ రుణం కోసం e-NWR రశీదును కూడా అందిస్తాయి.'
          : respLocale === 'hi'
          ? 'गेहूं को ६ से १२ महीनों के लिए महाराष्ट्र के डब्ल्यूडीआरए प्रमाणित वैज्ञानिक गोदामों (जैसे MSWC नासिक, CWC पुणे) में सुरक्षित भंडारित किया जा सकता है। यहाँ ई-एनडब्ल्यूआर रसीद पर ७५% बैंक ऋण सुविधा भी उपलब्ध है।'
          : 'Wheat can be stored safely for 6 to 12 months in WDRA-licensed scientific warehouses across Maharashtra (e.g. MSWC Nashik, CWC Pune, Solapur Warehouse). Facilities maintain moisture <11%, fumigation against weevils, and issue electronic Negotiable Warehouse Receipts (e-NWR) eligible for 75% bank pledge financing.';
    } else if (q.indexOf('tomato') !== -1 || q.indexOf('टोमॅटो') !== -1 || q.indexOf('టమోటా') !== -1 || q.indexOf('टमाटर') !== -1) {
      cropName = 'Tomato';
      responseText =
        respLocale === 'mr'
          ? 'टोमॅटो अत्यंत नाशवंत असल्याने सामान्य कोरड्या गोदामात साठवता येत नाही. यासाठी १०-१२°C तापमान आणि ९०-९५% आर्द्रता असलेले नियंत्रित शीतगृह आवश्यक आहे किंवा किसानसेतूवरून थेट प्रक्रिया उद्योगांना (ABC Foods) तत्काळ विक्री करावी.'
          : respLocale === 'te'
          ? 'టమోటా త్వరగా పాడయ్యే పంట (3-7 రోజుల జీవితకాలం). సాధారణ గిడ్డంగులు సరిపోవు. దీనికి 10-12°C కోల్డ్ స్టోరేజ్ అవసరం లేదా ABC Foods వంటి ప్రాసెసింగ్ కొనుగోలుదారులకు నేరుగా విక్రయించాలి.'
          : respLocale === 'hi'
          ? 'टमाटर शीघ्र नाशवान फसल है (३-७ दिन)। सामान्य सूखे गोदाम उपयुक्त नहीं हैं। इसके लिए १०-१२°C तापमान वाले कोल्ड स्टोरेज की आवश्यकता होती है या किसानसेतु से तुरंत प्रोसेसिंग खरीदारों (ABC Foods) को बेचना चाहिए।'
          : 'Tomato is highly perishable (shelf life 3-7 days). Standard dry warehouses are not suitable. Tomato requires cold storage at 10–12°C and 90–95% relative humidity to extend life up to 2-3 weeks, or immediate direct sale to food processors like ABC Foods via KisanSetu.';
    } else {
      cropName = 'Produce';
      responseText =
        respLocale === 'mr'
          ? 'नाशिक, पुणे, लासलगाव, सोलापूरसह महाराष्ट्रात १५ डब्ल्यूडीआरए प्रमाणित गोदामे उपलब्ध आहेत. कांद्यासाठी हवेशीर चाळी आणि धान्यासाठी वैज्ञानिक गोदामे उपलब्ध आहेत.'
          : respLocale === 'te'
          ? 'నాసిక్, పూణే, లసల్‌గావ్‌తో సహా మహారాష్ట్ర అంతటా 15 WDRA-ధృవీకరించబడిన గిడ్డంగులు మరియు ఉల్లిపాయల నిల్వ కేంద్రాలు అందుబాటులో ఉన్నాయి.'
          : respLocale === 'hi'
          ? 'नासिक, पुणे, लासलगांव सहित महाराष्ट्र भर में १५ डब्ल्यूडीआरए प्रमाणित गोदाम एवं प्याज चाली उपलब्ध हैं। अनाज के लिए वैज्ञानिक गोदाम उपलब्ध हैं।'
          : 'Found 15 WDRA-certified storage facilities across Maharashtra including cold storages and onion chawls across Nashik, Pune, and Solapur corridors.';
    }

    return {
      intent: 'STORAGE_OPTIONS',
      title: respLocale === 'mr' ? cropName + ' साठवणूक पर्याय' : respLocale === 'te' ? cropName + ' నిల్వ ఎంపికలు' : respLocale === 'hi' ? cropName + ' भंडारण विकल्प' : cropName + ' Storage Options',
      responseText: responseText,
      actionLabel: respLocale === 'mr' ? 'प्रमाणित गोदामे शोधा' : respLocale === 'te' ? 'గిడ్డంగులను అన్వేషించండి' : respLocale === 'hi' ? 'प्रमाणित गोदाम खोजें' : 'Browse Certified Warehouses',
      actionUrl: actionUrl,
      detectedLanguage: detectedLang,
      details: [
        { label: 'WDRA Warehouses', value: '15 Across 8 Maharashtra Districts' },
        { label: 'Financing', value: 'e-NWR Bank Pledge Loans (up to 75% value)' },
        { label: 'Corridors', value: 'Nashik, Pune, Solapur, Ahmednagar' },
      ],
    };
  }

  // Q4: HOW MUCH WILL I RECEIVE AFTER TRANSPORT CHARGES / WHAT IS NET REALISATION
  const isNetRealisationExplQuery =
    q.indexOf('net realisation') !== -1 ||
    q.indexOf('after transport charges') !== -1 ||
    q.indexOf('after transport') !== -1 ||
    q.indexOf('transport charge') !== -1 ||
    q.indexOf('transport charges') !== -1 ||
    q.indexOf('वाहतूक खर्च') !== -1 ||
    q.indexOf('రవాణా ఖర్చు') !== -1 ||
    q.indexOf('परिवहन खर्च') !== -1 ||
    q.indexOf('वाहतूक वजा') !== -1 ||
    q.indexOf('हातात किती') !== -1 ||
    q.indexOf('हाथ में कितना') !== -1 ||
    q.indexOf('निव्वळ प्राप्ती म्हणजे काय') !== -1 ||
    q.indexOf('निకర రాబడి అంటే ఏమిటి') !== -1 ||
    q.indexOf('शुद्ध प्राप्ति क्या है') !== -1;

  if (isNetRealisationExplQuery) {
    const responseText =
      respLocale === 'mr'
        ? 'निव्वळ प्राप्ती म्हणजे सर्व कपातींनंतर शेतकऱ्याच्या हातात मिळणारी प्रत्यक्ष रक्कम: एकूण किंमत उणे (वाहतूक भाडे + १.०५% बाजार शुल्क + ₹५० वजन शुल्क + ₹१५ प्रति क्विंटल हमाली). ८० क्विंटल कांद्यासाठी ₹२,४२० भावाने एकूण ₹१,९३,६०० पैकी वाहतूक व सेस वजा जाता ₹१,९१,२०० हातात मिळतात.'
        : respLocale === 'te'
        ? 'నికర రాబడి అంటే రవాణా మరియు మార్కెట్ ఛార్జీలు తీసివేసిన తర్వాత మీకు లభించే అసలు మొత్తం: స్థూల ధర మైనస్ (రవాణా ఖర్చు + 1.05% మార్కెట్ రుసుము + ₹50 తూకం రుసుము + హమాలీ). 80 క్వింటాళ్ల ఉల్లిపాయకు ₹2,420 చొప్పున ₹1,93,600 లో ఖర్చులు పోను మీకు ₹1,91,200 లభిస్తుంది.'
        : respLocale === 'hi'
        ? 'शुद्ध प्राप्ति सभी कटौतियों के बाद किसान को मिलने वाली वास्तविक रकम है: सकल भाव माइनस (परिवहन भाड़ा + १.०५% मंडी सेस + ₹५० तौल शुल्क + ₹१५/क्विंटल हमाली)। ८० क्विंटल प्याज पर ₹२,४२० भाव से ₹१,९३,६०० में सभी खर्चे काटकर आपको ₹१,९१,२०० (₹२,३९०/क्विंटल) प्राप्त होते हैं।'
        : 'Net Realisation is your actual in-hand take-home earnings calculated as: Gross Quoted Price MINUS (Transport Freight + APMC Cess of 1.05% + Weighment Fee of ₹50 + Handling/Hamali of ₹15/Qtl). For an 80 Qtl onion lot at ₹2,420/Qtl (Gross ₹1,93,600), after ₹1,350 local transport and statutory fees, your take-home amount is ₹1,91,200 (₹2,390/Qtl).';

    return {
      intent: 'NET_REALISATION',
      title: respLocale === 'mr' ? 'निव्वळ प्राप्ती व खर्च कपात' : respLocale === 'te' ? 'నికర రాబడి & రవాణా తగ్గింపులు' : respLocale === 'hi' ? 'शुद्ध प्राप्ति एवं परिवहन कटौती' : 'Net Realisation & Transport Deductions',
      responseText: responseText,
      actionLabel: respLocale === 'mr' ? 'कॅल्क्युलेटर उघडा' : respLocale === 'te' ? 'కాలిక్యులేటర్‌ను తెరవండి' : respLocale === 'hi' ? 'कैलकुलेटर खोलें' : 'Open Net Realisation Calculator',
      actionUrl: '/calculator',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Formula', value: 'Gross Price - Transport - 1.05% APMC Fee - Handling' },
        { label: 'Example (80 Qtl Onion)', value: 'Gross ₹1,93,600 -> Net ₹1,91,200 in bank' },
        { label: 'Benefit', value: 'Zero hidden commission; 100% transparent net discovery' },
      ],
    };
  }

  // Q5: HOW DO I SELL MY CROP / SELL WORKFLOW
  const isSellWorkflowQuery =
    (/\bhow\b/.test(q) || q.indexOf('कसा') !== -1 || q.indexOf('कसे') !== -1 || q.indexOf('कशी') !== -1 || q.indexOf('ఎలా') !== -1 || q.indexOf('कैसे') !== -1 || q.indexOf('तरीका') !== -1) &&
    (q.indexOf('sell') !== -1 || q.indexOf('विकू') !== -1 || q.indexOf('विकाय') !== -1 || q.indexOf('అమ్మ') !== -1 || q.indexOf('बेच') !== -1);

  if (isSellWorkflowQuery) {
    const responseText =
      respLocale === 'mr'
        ? 'किसानसेतूवर शेतमाल विकण्याचे ४ सोपे टप्पे: १. "+ शेतमाल विका" बटणावर क्लिक करून पिकाचे नाव व प्रमाण भरा. २. एआय गुणवत्ता पडताळणीसाठी ३ फोटो अपलोड करा. ३. सत्यापित खरेदीदारांच्या ऑफर्स तपासा. ४. सर्वोत्तम ऑफर स्वीकारून एस्क्रो सुरक्षित पेमेंट आणि वाहतूक लॉक करा.'
        : respLocale === 'te'
        ? 'కిసాన్‌సేతులో పంటను విక్రయించడానికి 4 దశలు: 1. "+ పంటను అమ్మండి" పై క్లిక్ చేసి వివరాలు నమోదు చేయండి. 2. AI నాణ్యత తనిఖీ కోసం 3 ఫోటోలను అప్‌లోడ్ చేయండి. 3. కొనుగోలుదారుల ఆఫర్లను చూడండి. 4. ఉత్తమ ఆఫర్‌ను అంగీకరించి ఎస్క్రో చెల్లింపు మరియు రవాణాను లాక్ చేయండి.'
        : respLocale === 'hi'
        ? 'किसानसेतु पर फसल बेचने के ४ आसान चरण: १. "+ फसल बेचें" पर क्लिक करके फसल का नाम व मात्रा दर्ज करें। २. एआई गुणवत्ता जांच हेतु ३ फोटो अपलोड करें। ३. सत्यापित खरीदारों के ऑफर देखें। ४. सर्वोत्तम ऑफर स्वीकार कर सुरक्षित एस्क्रो भुगतान और परिवहन बुक करें।'
        : 'Selling your crop on KisanSetu involves 4 transparent steps: 1. Click "+ Sell My Crop" and enter commodity and quantity. 2. Upload 3 photos of your lot for instant AI quality assessment. 3. Browse matching buyers and receive binding digital offers. 4. Accept the best offer to lock 100% escrow payment and book verified transport.';

    return {
      intent: 'SELL_WORKFLOW',
      title: respLocale === 'mr' ? 'शेतमाल विक्री प्रक्रिया' : respLocale === 'te' ? 'పంట విక్రయ విధానం' : respLocale === 'hi' ? 'फसल बिक्री प्रक्रिया' : 'How to Sell Produce Workflow',
      responseText: responseText,
      actionLabel: respLocale === 'mr' ? 'शेतमाल विका' : respLocale === 'te' ? 'పంటను అమ్మండి' : respLocale === 'hi' ? 'फसल बेचें' : 'Start Crop Listing',
      actionUrl: '/farmer',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Step 1', value: 'Create Lot with Commodity & Quantity' },
        { label: 'Step 2', value: 'Upload Photos for AI Visual Grading' },
        { label: 'Step 3', value: 'Receive & Negotiate Verified Buyer Offers' },
        { label: 'Step 4', value: 'Accept Offer & Dispatch with Escrow Protection' },
      ],
    };
  }

  // Q6: EXPLAIN CROP STATUS
  const isCropStatusQuery =
    q.indexOf('crop status') !== -1 ||
    q.indexOf('lot status') !== -1 ||
    (q.indexOf('status') !== -1 && (q.indexOf('explain') !== -1 || q.indexOf('mean') !== -1 || q.indexOf('अर्थ') !== -1 || q.indexOf('म्हणजे') !== -1 || q.indexOf('అర్థం') !== -1 || q.indexOf('मतलब') !== -1)) ||
    q.indexOf('पिकाची स्थिती') !== -1 ||
    q.indexOf('पिकांची स्थिती') !== -1 ||
    q.indexOf('पिकाची माहिती') !== -1 ||
    q.indexOf('పంట స్థితి') !== -1 ||
    q.indexOf('ఫసల్ కి స్థితి') !== -1 ||
    q.indexOf('फसल की स्थिति') !== -1 ||
    q.indexOf('फसल स्थिति') !== -1;

  if (isCropStatusQuery) {
    const responseText =
      respLocale === 'mr'
        ? 'तुमच्या शेतीमालाचे टप्पे: AVAILABLE म्हणजे माल बाजारात खरेदीदारांसाठी उपलब्ध आहे; OFFER_ACCEPTED म्हणजे खरेदीदाराने एस्क्रोमध्ये पैसे जमा केले आहेत; TRANSPORT_BOOKED म्हणजे गाडी नियोजित झाली आहे; IN_TRANSIT म्हणजे माल रस्त्यात आहे; DELIVERED झाल्यावर २४ तासांत पैसे खात्यात जमा होतात.'
        : respLocale === 'te'
        ? 'మీ పంట స్థితి దశలు: AVAILABLE అంటే పంట మార్కెట్లో అందుబాటులో ఉంది; OFFER_ACCEPTED అంటే కొనుగోలుదారు ఎస్క్రోలో డబ్బు జమ చేశారు; TRANSPORT_BOOKED అంటే రవాణా వాహనం కేటాయించబడింది; IN_TRANSIT అంటే ప్రయాణంలో ఉంది; DELIVERED తర్వాత చెల్లింపు విడుదల అవుతుంది.'
        : respLocale === 'hi'
        ? 'आपकी फसल के स्थिति चरण: AVAILABLE यानी फसल खरीदारों के लिए सूचीबद्ध है; OFFER_ACCEPTED यानी खरीदार ने एस्क्रो में भुगतान जमा कर दिया है; TRANSPORT_BOOKED यानी ट्रक बुक हो चुका है; IN_TRANSIT यानी माल मार्ग में है; DELIVERED के बाद २४ घंटे में भुगतान बैंक में ट्रांसफर होता है।'
        : 'Your crop lot goes through clear status milestones: AVAILABLE means your harvest is listed for buyers; OFFER_ACCEPTED means a buyer committed and deposited escrow; TRANSPORT_BOOKED means a logistics truck is scheduled; IN_TRANSIT means goods are moving with live GPS; DELIVERED triggers release of escrow payment to your bank.';

    return {
      intent: 'CROP_STATUS_INFO',
      title: respLocale === 'mr' ? 'पीक स्थिती स्पष्टीकरण' : respLocale === 'te' ? 'పంట స్థితి వివరణ' : respLocale === 'hi' ? 'फसल स्थिति स्पष्टीकरण' : 'Crop Lot Status Lifecycle',
      responseText: responseText,
      actionLabel: respLocale === 'mr' ? 'माझी पिके पहा' : respLocale === 'te' ? 'నా పంటలను చూడండి' : respLocale === 'hi' ? 'मेरी फसलें देखें' : 'View My Crops & Status',
      actionUrl: '/farmer',
      detectedLanguage: detectedLang,
      details: [
        { label: 'AVAILABLE', value: 'Active on marketplace receiving buyer offers' },
        { label: 'OFFER_ACCEPTED', value: '100% Escrow deposited by buyer' },
        { label: 'IN_TRANSIT / DELIVERED', value: 'Real-time GPS tracking -> Auto-payout release' },
      ],
    };
  }

  // Q7: WHAT HAPPENS AFTER BUYER ACCEPTS OFFER
  const isOfferWorkflowQuery =
    (q.indexOf('after') !== -1 || q.indexOf('नंतर') !== -1 || q.indexOf('తర్వాత') !== -1 || q.indexOf('बाद') !== -1) &&
    (q.indexOf('accept') !== -1 || q.indexOf('स्वीकार') !== -1 || q.indexOf('అంగీక') !== -1) &&
    (q.indexOf('offer') !== -1 || q.indexOf('ऑफर') !== -1 || q.indexOf('ఆఫర్') !== -1);

  if (isOfferWorkflowQuery) {
    const responseText =
      respLocale === 'mr'
        ? 'ऑफर स्वीकारल्यानंतर: १. डिजिटल खरेदी-विक्री करार तयार होतो. २. खरेदीदार किसानसेतू एस्क्रो खात्यात १००% रक्कम जमा करतो. ३. वाहतूक बुकिंगसाठी लॉजिस्टिक्स विनंती तयार होते. ४. मालाची पोहोच पावती (Gate Pass) मिळाल्यावर २४ तासांत पैसे थेट तुमच्या बँक खात्यात वर्ग केले जातात.'
        : respLocale === 'te'
        ? 'ఆఫర్ అంగీకరించిన తర్వాత: 1. డిజిటల్ ఒప్పందం రూపొందించబడుతుంది. 2. కొనుగోలుదారు 100% మొత్తాన్ని కిసాన్‌సేతు ఎస్క్రో ఖాతాలో జమ చేస్తారు. 3. రవాణా బుకింగ్ అభ్యర్థన సృష్టించబడుతుంది. 4. డెలివరీ రసీదు తర్వాత 24 గంటల్లో మీ బ్యాంక్ ఖాతాకు డబ్బు బదిలీ అవుతుంది.'
        : respLocale === 'hi'
        ? 'ऑफर स्वीकार होने के बाद: १. डिजिटल बिक्री अनुबंध बनता है। २. खरीदार किसानसेतु एस्क्रो खाते में १००% राशि जमा करता है। ३. परिवहन बुकिंग के लिए लॉजिस्टिक्स अनुरोध तैयार होता है। ४. माल की डिलीवरी और गेट पास मिलने पर २४ घंटे में बैंक खाते में सीधा भुगतान जमा होता है।'
        : 'Once an offer is accepted: 1. A digitally sealed sale agreement is generated. 2. The buyer deposits 100% purchase funds into KisanSetu tripartite escrow. 3. A logistics dispatch request is created to book verified transport. 4. Upon delivery and gate pass sign-off, escrow funds are transferred directly to your bank account within 24 hours.';

    return {
      intent: 'OFFER_WORKFLOW',
      title: respLocale === 'mr' ? 'ऑफर स्वीकृतीनंतरची प्रक्रिया' : respLocale === 'te' ? 'ఆఫర్ ఆమోదం తర్వాతి ప్రక్రియ' : respLocale === 'hi' ? 'ऑफर स्वीकृति उपरांत प्रक्रिया' : 'Post-Offer Acceptance Workflow',
      responseText: responseText,
      actionLabel: respLocale === 'mr' ? 'सक्रिय ऑफर्स पहा' : respLocale === 'te' ? 'యాక్టివ్ ఆఫర్లను చూడండి' : respLocale === 'hi' ? 'सक्रिय ऑफर देखें' : 'View Active Offers',
      actionUrl: '/lots',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Milestone 1', value: 'Legally binding digital trade contract generated' },
        { label: 'Milestone 2', value: '100% buyer escrow funds locked in advance' },
        { label: 'Milestone 3', value: 'Logistics pickup and e-Gate Pass generation' },
      ],
    };
  }

  // Q8: HOW CAN I BOOK TRANSPORT
  const isHowBookTransportQuery =
    (/\bhow\b/.test(q) || q.indexOf('कशी') !== -1 || q.indexOf('कसे') !== -1 || q.indexOf('ఎలా') !== -1 || q.indexOf('कैसे') !== -1) &&
    (q.indexOf('transport') !== -1 || q.indexOf('वाहतूक') !== -1 || q.indexOf('రవాణా') !== -1 || q.indexOf('परिवहन') !== -1 || q.indexOf('गाडी') !== -1 || q.indexOf('गाड़ी') !== -1);

  if (isHowBookTransportQuery) {
    const responseText =
      respLocale === 'mr'
        ? 'वाहतूक बुक करण्यासाठी: लॉजिस्टिक्स विभागात (/transporter) जा, शेताचा पत्ता आणि पोहोच ठिकाण निवडा, मालाचे वजन (उदा. ६ टन आयशर) टाका, पारदर्शक भाडे तपासा आणि पुष्टी करा. जीपीएस ट्रॅकिंगसह अधिकृत वाहन चालक नियुक्त केला जाईल.'
        : respLocale === 'te'
        ? 'రవాణా బుక్ చేయడానికి: లాజిస్టిక్స్ పోర్టల్‌కు వెళ్లండి (/transporter), పికప్ మరియు డ్రాప్ ప్రదేశాలను నమోదు చేయండి, వాహనాన్ని (6 టన్నులు లేదా 16 టన్నులు) ఎంచుకోండి, స్థిరమైన ధరను సమీక్షించి ధృవీకరించండి. GPS ఉన్న వాహనం కేటాయించబడుతుంది.'
        : respLocale === 'hi'
        ? 'परिवहन बुक करने के लिए: लॉजिस्टिक्स अनुभाग (/transporter) पर जाएं, खेत का पता और गंतव्य दर्ज करें, वाहन क्षमता (जैसे ६ टन आयशर) चुनें, पारदर्शी किराया जांचें और पुष्टि करें। जीपीएस युक्त सत्यापित वाहन चालक आवंटित किया जाएगा।'
        : 'To book transport: Navigate to the Logistics portal (/transporter), enter your farm pickup location and target destination (APMC or buyer warehouse), select cargo weight (e.g. 6-Ton Eicher or 16-Ton Taurus), review the fixed transparent freight rate, and confirm. A verified driver with GPS tracking will be assigned.';

    return {
      intent: 'FIND_TRANSPORT',
      title: respLocale === 'mr' ? 'वाहतूक बुकिंग मार्गदर्शक' : respLocale === 'te' ? 'రవాణా బుకింగ్ గైడ్' : respLocale === 'hi' ? 'परिवहन बुकिंग मार्गदर्शन' : 'Transport Booking Guide',
      responseText: responseText,
      actionLabel: respLocale === 'mr' ? 'वाहतूक पोर्टल उघडा' : respLocale === 'te' ? 'రవాణా పోర్టల్ తెరవండి' : respLocale === 'hi' ? 'परिवहन पोर्टल खोलें' : 'Open Transport Logistics',
      actionUrl: '/transporter',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Step 1', value: 'Specify Farm Pickup & Destination' },
        { label: 'Step 2', value: 'Select Vehicle Capacity (6T Eicher, 16T Taurus)' },
        { label: 'Step 3', value: 'Lock Transparent Per-Km Tariff & Driver Assignment' },
      ],
    };
  }

  // Q9: CROP DAMAGED DURING TRANSPORT
  const isDamageQuery =
    q.indexOf('damage') !== -1 ||
    q.indexOf('damaged') !== -1 ||
    q.indexOf('loss') !== -1 ||
    q.indexOf('नुकसान') !== -1 ||
    q.indexOf('खराब') !== -1 ||
    q.indexOf('పాడై') !== -1 ||
    q.indexOf('దెబ్బ') !== -1;

  if (isDamageQuery) {
    const responseText =
      respLocale === 'mr'
        ? 'वाहतुकीत मालाचे नुकसान झाल्यास: १. माल उतरवण्यापूर्वी खराब मालाचे स्पष्ट फोटो काढा. २. तत्काळ "तक्रारी व समस्या" टॅबमध्ये (/farmer?tab=COMPLAINTS) जाऊन "वाहतूक नुकसान" नोंदवा. ३. किसानसेतू एस्क्रो पेमेंट तात्काळ फ्रीझ करते आणि एमएसएएमबी अधिकारी पंचनामा करून विम्याद्वारे नुकसानभरपाई निश्चित करतात.'
        : respLocale === 'te'
        ? 'రవాణాలో పంట దెబ్బతింటే: 1. దింపే ముందు దెబ్బతిన్న పంట స్పష్టమైన ఫోటోలు తీయండి. 2. వెంటనే "ఫిర్యాదులు" ట్యాబ్‌లో (/farmer?tab=COMPLAINTS) "రవాణా నష్టం" నివేదించండి. 3. ఎస్క్రో నిధులు నిలిపివేయబడతాయి మరియు అధికారి పరిశీలించి భీమా పరిహారం అందిస్తారు.'
        : respLocale === 'hi'
        ? 'परिवहन के दौरान फसल खराब होने पर: १. माल उतारने से पहले खराब उपज की स्पष्ट फोटो लें। २. तुरंत "शिकायतें" टैब में (/farmer?tab=COMPLAINTS) जाकर "परिवहन नुकसान" दर्ज करें। ३. किसानसेतु एस्क्रो भुगतान तुरंत रोक देता है और एमएसएएमबी अधिकारी जांच कर बीमा द्वारा मुआवजा दिलाते हैं।'
        : 'If your crop is damaged in transit: 1. Take clear timestamped photos of the damaged produce before unloading. 2. Immediately open "Complaints & Issues" (/farmer?tab=COMPLAINTS) and file a "Transit Damage" claim. 3. KisanSetu freezes the escrow funds automatically while an MSAMB grievance officer evaluates transporter liability and initiates insurance compensation.';

    return {
      intent: 'TRANSPORT_DAMAGE',
      title: respLocale === 'mr' ? 'वाहतूक नुकसान निवारण' : respLocale === 'te' ? 'రవాణా నష్ట పరిహార మార్గదర్శి' : respLocale === 'hi' ? 'परिवहन नुकसान समाधान' : 'In-Transit Damage Protection & Claims',
      responseText: responseText,
      actionLabel: respLocale === 'mr' ? 'तक्रार निवारण डेस्क' : respLocale === 'te' ? 'ఫిర్యాదుల విభాగం' : respLocale === 'hi' ? 'शिकायत निवारण डेस्क' : 'Open Transit Dispute Desk',
      actionUrl: '/farmer?tab=COMPLAINTS',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Step 1', value: 'Capture Timestamped Unloading Photos' },
        { label: 'Step 2', value: 'File Transit Damage under Complaints & Issues' },
        { label: 'Protection', value: 'Escrow Frozen & Official MSAMB Inspection Assigned' },
      ],
    };
  }

  // Q10: WHAT IF BUYER GIVES LESS MONEY / HOW DO I RAISE A COMPLAINT
  const isDisputeInfoQuery =
    q.indexOf('less money') !== -1 ||
    q.indexOf('gives less') !== -1 ||
    q.indexOf('paid less') !== -1 ||
    q.indexOf('underpaid') !== -1 ||
    q.indexOf('underpayment') !== -1 ||
    q.indexOf('कमी पैसे') !== -1 ||
    q.indexOf('तక్కువ డబ్బు') !== -1 ||
    q.indexOf('कम पैसे') !== -1 ||
    q.indexOf('कम पैसा') !== -1 ||
    q.indexOf('kam paise') !== -1 ||
    ((/\bhow\b/.test(q) || q.indexOf('कशी') !== -1 || q.indexOf('कसे') !== -1 || q.indexOf('ఎలా') !== -1 || q.indexOf('कैसे') !== -1 || q.indexOf('तरीका') !== -1) &&
     (q.indexOf('complaint') !== -1 || q.indexOf('dispute') !== -1 || q.indexOf('तक्रार') !== -1 || q.indexOf('ఫిర్యాదు') !== -1 || q.indexOf('शिकायत') !== -1));

  if (isDisputeInfoQuery) {
    const responseText =
      respLocale === 'mr'
        ? 'खरेदीदार परस्पर पैसे कापू शकत नाही, कारण गाडी निघण्यापूर्वीच कराराची १००% रक्कम किसानसेतू एस्क्रो खात्यात सुरक्षित जमा असते. खरेदीदाराने विनाकारण कपात केल्यास किंवा तक्रार नोंदवण्यासाठी "तक्रारी व समस्या" विभागात जा (/farmer?tab=COMPLAINTS), पुरावे जोडा; एमएसएएमबी अधिकारी २४ तासांत निर्णय देतील.'
        : respLocale === 'te'
        ? 'కొనుగోలుదారు మీ చెల్లింపును ఏకపక్షంగా తగ్గించలేరు, ఎందుకంటే 100% మొత్తం కిసాన్‌సేతు ఎస్క్రోలో లాక్ చేయబడుతుంది. కొనుగోలుదారు తక్కువ డబ్బు ఇవ్వడానికి ప్రయత్నిస్తే లేదా ఫిర్యాదు చేయడానికి "ఫిర్యాదులు" ట్యాబ్‌కు వెళ్లి (/farmer?tab=COMPLAINTS) ఆధారాలు సమర్పించండి. అధికారి పరిష్కరిస్తారు.'
        : respLocale === 'hi'
        ? 'खरीदार अपनी मर्जी से भुगतान में कटौती नहीं कर सकता, क्योंकि वाहन रवाना होने से पहले ही १००% राशि किसानसेतु एस्क्रो में सुरक्षित जमा होती है। शिकायत दर्ज करने के लिए "शिकायतें" टैब (/farmer?tab=COMPLAINTS) पर जाएं और प्रमाण अपलोड करें; एमएसएएमबी अधिकारी २४ घंटे में कार्रवाई करेंगे।'
        : 'Buyers cannot unilaterally cut your payout because 100% of agreed contract value is locked in KisanSetu tripartite escrow prior to truck dispatch. To raise a complaint or dispute an underpayment: Navigate to "Complaints & Issues" (/farmer?tab=COMPLAINTS), attach weighment slips or photos, and submit. An official MSAMB grievance officer evaluates the case within 24 hours.';

    return {
      intent: 'DISPUTE_INFO',
      title: respLocale === 'mr' ? 'तक्रार व पेमेंट संरक्षण' : respLocale === 'te' ? 'ఫిర్యాదు & చెల్లింపు రక్షణ' : respLocale === 'hi' ? 'शिकायत एवं भुगतान सुरक्षा' : 'Grievance & Payment Escrow Protection',
      responseText: responseText,
      actionLabel: respLocale === 'mr' ? 'तक्रार पोर्टल उघडा' : respLocale === 'te' ? 'ఫిర్యాదుల పోర్టల్ తెరవండి' : respLocale === 'hi' ? 'शिकायत पोर्टल खोलें' : 'Open Complaints & Issues',
      actionUrl: '/farmer?tab=COMPLAINTS',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Security', value: '100% Escrow Lock Prior to Dispatch' },
        { label: 'Mediation', value: 'Official MSAMB Grievance Officer within 24-48 hrs' },
        { label: 'Evidence', value: 'Photos & Official APMC Weighment Slips' },
      ],
    };
  }

  // Q11: AI QUALITY ASSESSMENT MEANING & CAN AI CHECK QUALITY FROM PHOTOS
  const isQualityInfoQuery =
    q.indexOf('ai quality') !== -1 ||
    q.indexOf('quality assessment') !== -1 ||
    q.indexOf('quality from photo') !== -1 ||
    q.indexOf('check quality') !== -1 ||
    q.indexOf('ai check') !== -1 ||
    q.indexOf('quality check') !== -1 ||
    q.indexOf('एआय गुणवत्ता') !== -1 ||
    q.indexOf('फोटोवरून गुणवत्ता') !== -1 ||
    q.indexOf('ai నాణ్యత') !== -1 ||
    q.indexOf('ఫోటోల ద్వారా ai') !== -1 ||
    q.indexOf('एआई गुणवत्ता') !== -1 ||
    q.indexOf('फोटो से गुणवत्ता') !== -1 ||
    q.indexOf('ai assess') !== -1;

  if (isQualityInfoQuery) {
    const responseText =
      respLocale === 'mr'
        ? 'किसानसेतू एआय गुणवत्ता तपासणी ३ कोनांतून काढलेल्या फोटोंवरून कॉम्प्युटर व्हिजनद्वारे कांदा व शेतीमालाचा रंग, आकारातील एकसारखेपणा आणि बाह्य दोष (काळे डाग, कोंब) तपासून प्राथमिक प्रत (A/B/C) ठरवते. अंतर्गत आर्द्रतेसाठी अधिकृत एमएसएएमबी निरीक्षक डिजिटल मीटरने प्रत्यक्ष पडताळणी करतात.'
        : respLocale === 'te'
        ? 'కిసాన్‌సేతు AI నాణ్యత అంచనా 3 కోణాల నుండి తీసిన ఫోటోలను విశ్లేషిస్తుంది. ఇది రంగు, సైజు ఏకరూపత మరియు కనిపించే లోపాలను తనిఖీ చేసి గ్రేడ్ (A/B/C) ను కేటాయిస్తుంది. లోపలి నాణ్యత మరియు తేమ శాతం కోసం MSAMB నాణ్యత ఇన్‌స్పెక్టర్ ప్రత్యక్షంగా తనిఖీ చేస్తారు.'
        : respLocale === 'hi'
        ? 'किसानसेतु का एआई गुणवत्ता मूल्यांकन ३ कोणों से ली गई तस्वीरों का कंप्यूटर विज़न से विश्लेषण करता है। यह फसल का रंग, आकार एकरूपता और बाहरी दोष (काले धब्बे, अंकुरण) मापकर प्राथमिक ग्रेड (A/B/C) निर्धारित करता है। आंतरिक नमी मापने के लिए अधिकृत निरीक्षक डिजिटल मीटर से जांच करते हैं।'
        : 'KisanSetu AI Quality Assessment uses deep computer vision to evaluate crop photos taken from 3 angles. It automatically measures surface color, bulb size uniformity, and visible defects (like cuts, rot, or sprouting) to assign preliminary Grade A, B, or C. For internal metrics (moisture % or Brix sweetness), a licensed MSAMB quality inspector conducts physical verification before dispatch.';

    return {
      intent: 'QUALITY_ASSESSMENT_INFO',
      title: respLocale === 'mr' ? 'एआय गुणवत्ता पडताळणी माहिती' : respLocale === 'te' ? 'AI నాణ్యత నిర్ధారణ సమాచారం' : respLocale === 'hi' ? 'एआई गुणवत्ता मूल्यांकन जानकारी' : 'AI Visual Quality Assessment Engine',
      responseText: responseText,
      actionLabel: respLocale === 'mr' ? 'पिके व गुणवत्ता पहा' : respLocale === 'te' ? 'పంట నాణ్యతను చూడండి' : respLocale === 'hi' ? 'फसल गुणवत्ता देखें' : 'Try AI Quality Check',
      actionUrl: '/lots',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Vision Model', value: '3-Angle Computer Vision Photo Assay' },
        { label: 'Metrics', value: 'Color, Size Uniformity, Visible Surface Defects' },
        { label: 'Physical Audit', value: 'Licensed MSAMB Inspector Moisture Check' },
      ],
    };
  }

  // Q12: WHAT DOES PAYMENT PROCESSING MEAN
  const isPaymentProcessingQuery =
    q.indexOf('payment processing') !== -1 ||
    q.indexOf("पेमेंट प्रोसेसिंग") !== -1 ||
    q.indexOf("చెల్లింపు ప్రాసెసింగ్") !== -1 ||
    q.indexOf("भुगतान प्रसंस्करण") !== -1;

  if (isPaymentProcessingQuery) {
    const responseText =
      respLocale === 'mr'
        ? '"पेमेंट प्रोसेसिंग" म्हणजे खरेदीदाराची रक्कम सुरक्षित एस्क्रो खात्यात जमा झाली आहे. खरेदीदाराने मालाची पोहोच पावती आणि गुणवत्ता तपासणी पूर्ण केल्यावर २४ तासांच्या आत रक्कम थेट तुमच्या बँक खात्यात जमा केली जाते.'
        : respLocale === 'te'
        ? '"చెల్లింపు ప్రాసెసింగ్" అంటే కొనుగోలుదారు నిధులు సురక్షితమైన ఎస్క్రో ఖాతాలో ఉన్నాయి. డెలివరీ గేట్ పాస్ మరియు నాణ్యత ధృవీకరణ పూర్తయిన 24 గంటల్లో నిధులు నేరుగా మీ బ్యాంక్ ఖాతాకు బదిలీ చేయబడతాయి.'
        : respLocale === 'hi'
        ? '"भुगतान प्रसंस्करण" (Payment Processing) का अर्थ है कि खरीदार का भुगतान सुरक्षित एस्क्रो खाते में जमा है। गंतव्य पर माल की डिलीवरी व गुणवत्ता सत्यापन होते ही २४ घंटे के भीतर राशि सीधे आपके बैंक खाते में ट्रांसफर कर दी जाती है।'
        : '"Payment Processing" means buyer funds are verified and held securely in a protected tripartite escrow account. Once the delivery gate pass is signed at the receiving warehouse and quality verified, funds are released directly to your bank account via RTGS/UPI within 24 hours.';

    return {
      intent: 'PAYMENT_ESCROW_INFO',
      title: respLocale === 'mr' ? 'पेमेंट प्रोसेसिंग व एस्क्रो सुरक्षा' : respLocale === 'te' ? 'చెల్లింపు ప్రాసెసింగ్ & ఎస్క్రో' : respLocale === 'hi' ? 'भुगतान प्रसंस्करण एवं एस्क्रो सुरक्षा' : 'Payment Processing & Escrow Security',
      responseText: responseText,
      actionLabel: respLocale === 'mr' ? 'व्यवहार पहा' : respLocale === 'te' ? 'లావాదేవీలు చూడండి' : respLocale === 'hi' ? 'सौदे देखें' : 'View Transactions',
      actionUrl: '/transactions',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Escrow Status', value: '100% Locked in Tripartite Trust' },
        { label: 'Disbursement', value: 'Auto-Credit within 24 hrs of Delivery Sign-off' },
      ],
    };
  }

  // Q13: HOW DOES KISANSETU WORK / PLATFORM INFO
  const isPlatformInfoQuery =
    q.indexOf('kisansetu work') !== -1 ||
    q.indexOf('how does kisansetu') !== -1 ||
    q.indexOf('how kisansetu') !== -1 ||
    q.indexOf('what is kisansetu') !== -1 ||
    q.indexOf('about kisansetu') !== -1 ||
    q.indexOf('किसानसेतू कसे कार्य') !== -1 ||
    q.indexOf('किसानसेतू काय आहे') !== -1 ||
    q.indexOf('కిసాన్‌సేతు ఎలా పనిచేస్తుంది') !== -1 ||
    q.indexOf('కిసాన్‌సేతు అంటే') !== -1 ||
    q.indexOf('किसानसेतु कैसे काम') !== -1 ||
    q.indexOf('किसानसेतु क्या है') !== -1;

  if (isPlatformInfoQuery) {
    const responseText =
      respLocale === 'mr'
        ? 'किसानसेतू हा महाराष्ट्र शासनाचा (SIH 26132) उपक्रम आहे जो शेतकऱ्यांना थेट खरेदीदार, प्रमाणित गोदामे आणि वाहतूकदारांशी जोडतो. हे पारदर्शक बाजार भाव, एआय गुणवत्ता तपासणी, निव्वळ नफा कॅल्क्युलेटर आणि सुरक्षित एस्क्रो पेमेंट पुरवून शेतकऱ्यांना दलालांपासून मुक्ती देते.'
        : respLocale === 'te'
        ? 'కిసాన్‌సేతు అనేది మహారాష్ట్ర ప్రభుత్వ చొరవ (SIH 26132), ఇది రైతులను ధృవీకరించబడిన కొనుగోలుదారులు, WDRA గిడ్డంగులు మరియు రవాణాతో నేరుగా కలుపుతుంది. ఇది పారదర్శక ధరలు, AI నాణ్యత తనిఖీ మరియు సురక్షిత ఎస్క్రో చెల్లింపులను అందిస్తుంది.'
        : respLocale === 'hi'
        ? 'किसानसेतु महाराष्ट्र सरकार की एक पहल (SIH 26132) है जो किसानों को सीधे सत्यापित खरीदारों, डब्ल्यूडीआरए प्रमाणित गोदामों और परिवहन से जोड़ती है। यह पारदर्शी मंडी भाव, एआई फोटो गुणवत्ता जांच और सुरक्षित एस्क्रो भुगतान प्रदान करती है।'
        : 'KisanSetu is a Government of Maharashtra initiative (SIH 26132) that directly links farmers with verified buyers, WDRA certified storage, and transport logistics. It provides transparent mandi prices, AI photo quality grading, net realization calculations, and locks payments in escrow to guarantee zero middleman exploitation.';

    return {
      intent: 'PLATFORM_INFO',
      title: respLocale === 'mr' ? 'किसानसेतू प्लॅटफॉर्म माहिती' : respLocale === 'te' ? 'కిసాన్‌సేతు ప్లాట్‌ఫారమ్ సమాచారం' : respLocale === 'hi' ? 'किसानसेतु प्लेटफॉर्म विवरण' : 'About KisanSetu Platform',
      responseText: responseText,
      actionLabel: respLocale === 'mr' ? 'मुख्य पृष्ठ पहा' : respLocale === 'te' ? 'హోమ్ పేజీని చూడండి' : respLocale === 'hi' ? 'मुख्य पृष्ठ देखें' : 'Explore Platform',
      actionUrl: '/',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Initiative', value: 'Govt of Maharashtra • SIH 26132' },
        { label: 'Core Pillars', value: 'Mandi Discovery, Storage, Logistics, Escrow' },
      ],
    };
  }

  // ----------------------------------------------------
  // CORE NAVIGATION & FEATURE INTENTS (PRESERVING TEST ASSERTIONS)
  // ----------------------------------------------------

  // 2. NAVIGATE_COMPLAINTS: Informational view of registered farmer complaints
  if (
    q.indexOf('complaint') !== -1 ||
    q.indexOf('dispute') !== -1 ||
    q.indexOf('grievance') !== -1 ||
    q.indexOf('तक्रार') !== -1 ||
    q.indexOf('तक्रारी') !== -1 ||
    q.indexOf('समस्या निवारण') !== -1 ||
    q.indexOf('ఫిర్యాదు') !== -1 ||
    q.indexOf("ఫిర్యాదులు") !== -1 ||
    q.indexOf('शिकायत') !== -1 ||
    q.indexOf("शिकायतें") !== -1
  ) {
    const responseText =
      respLocale === 'mr'
        ? 'तुमच्या नोंदणीकृत तक्रारी, पडताळणी स्थिती आणि अधिकार्यांचे निकाल दाखवत आहे.'
        : respLocale === 'te'
        ? 'మీ నమోదిత ఫిర్యాదులు, పరిశీలన స్థితి మరియు పరిష్కార నిర్ణయాలను చూపుతున్నాము.'
        : respLocale === 'hi'
        ? 'आपकी पंजीकृत शिकायतें, समीक्षा स्थिति एवं प्राधिकृत निर्णय दिखाए जा रहे हैं।'
        : 'Showing your registered complaints, evidence review status, and officer resolution notes.';

    return {
      intent: 'NAVIGATE_COMPLAINTS',
      title:
        respLocale === 'mr'
          ? 'तक्रारी व समस्या निवारण'
          : respLocale === 'te'
          ? 'ఫిర్యాదులు & సమస్యల పరిష్కారం'
          : respLocale === 'hi'
          ? 'शिकायतें एवं समस्या निवारण'
          : 'Complaints & Issues Hub',
      responseText: responseText,
      actionLabel:
        respLocale === 'mr'
          ? 'तक्रारी विभाग पहा'
          : respLocale === 'te'
          ? 'ఫిర్యాదుల విభాగం చూడండి'
          : respLocale === 'hi'
          ? 'शिकायत अनुभाग देखें'
          : 'View Complaints Tab',
      actionUrl: '/farmer?tab=COMPLAINTS',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Workflow', value: '5-Stage Resolution Tracking' },
        { label: 'Protection', value: 'Human Adjudication with Mandatory Notes' },
      ],
    };
  }

  // 3. SELL_CROP: Sell produce / Produce Listing
  if (
    q.indexOf('sell my crop') !== -1 ||
    q.indexOf('sell crop') !== -1 ||
    q.indexOf('sell crops') !== -1 ||
    q.indexOf('sell produce') !== -1 ||
    q.indexOf('sell harvest') !== -1 ||
    q.indexOf('sell my produce') !== -1 ||
    q.indexOf('list my crop') !== -1 ||
    q.indexOf('list crop') !== -1 ||
    q.indexOf('शेतमाल विका') !== -1 ||
    q.indexOf('पीक विका') !== -1 ||
    q.indexOf('माझे पीक विका') !== -1 ||
    q.indexOf('माल विका') !== -1 ||
    q.indexOf('शेतमाल विक्री') !== -1 ||
    q.indexOf('पिकांची विक्री') !== -1 ||
    q.indexOf('పంటను అమ్మండి') !== -1 ||
    q.indexOf('పంట అమ్మండి') !== -1 ||
    q.indexOf('నా పంటను అమ్మండి') !== -1 ||
    q.indexOf('పంట అమ్మకం') !== -1 ||
    q.indexOf('ధాన్యం అమ్మండి') !== -1 ||
    q.indexOf('फसल बेचें') !== -1 ||
    q.indexOf('मेरी फसल बेचें') !== -1 ||
    q.indexOf('उपज बेचें') !== -1 ||
    q.indexOf('फसल बेचो') !== -1 ||
    q.indexOf('माल बेचें') !== -1 ||
    q.indexOf('फसल की बिक्री') !== -1
  ) {
    const responseText =
      respLocale === 'mr'
        ? 'तुमचा शेतमाल विक्रीसाठी नोंदवण्यासाठी आणि एआय गुणवत्ता पडताळणीसह लिस्ट करण्यासाठी शेतकरी डॅशबोर्ड उघडत आहे.'
        : respLocale === 'te'
        ? 'AI నాణ్యతా ధృవీకరణతో మీ పంటను విక్రయించడానికి మరియు జాబితా చేయడానికి రైతు డ్యాష్‌బోర్డ్‌ను తెరుస్తున్నాము.'
        : respLocale === 'hi'
        ? 'एआई गुणवत्ता सत्यापन के साथ अपनी फसल को सूचीबद्ध करने एवं बेचने के लिए किसान डैशबोर्ड खोला जा रहा है।'
        : 'Opening your produce management dashboard to list and sell your crop with AI-verified quality.';

    return {
      intent: 'SELL_CROP',
      title:
        respLocale === 'mr'
          ? 'शेतमाल विक्री'
          : respLocale === 'te'
          ? 'పంట విక్రయం'
          : respLocale === 'hi'
          ? 'फसल बिक्री'
          : 'Sell Your Crop',
      responseText: responseText,
      actionLabel:
        respLocale === 'mr'
          ? 'शेतमाल विका'
          : respLocale === 'te'
          ? 'పంటను అమ్మండి'
          : respLocale === 'hi'
          ? 'फसल बेचें'
          : 'Sell Crop Now',
      actionUrl: '/farmer',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Feature', value: 'Produce Lot Creation & AI Visual Verification' },
        { label: 'Assistance', value: 'Market Linkage & Buyer Discovery' },
      ],
    };
  }

  // 4. NAVIGATE_DELIVERIES: In-transit dispatches & gate passes
  if (
    q.indexOf('my delivery') !== -1 ||
    q.indexOf('my deliveries') !== -1 ||
    q.indexOf('show my delivery') !== -1 ||
    q.indexOf('show my deliveries') !== -1 ||
    q.indexOf('show deliveries') !== -1 ||
    q.indexOf('deliveries') !== -1 ||
    q.indexOf('delivery status') !== -1 ||
    q.indexOf('dispatches') !== -1 ||
    q.indexOf('my dispatches') !== -1 ||
    q.indexOf('track delivery') !== -1 ||
    q.indexOf('where is my delivery') !== -1 ||
    q.indexOf('डिलिव्हरी') !== -1 ||
    q.indexOf('माझ्या डिलिव्हरी') !== -1 ||
    q.indexOf('माझी डिलिव्हरी') !== -1 ||
    q.indexOf('मेरी डिलीवरी') !== -1 ||
    q.indexOf('डिलीवरी') !== -1 ||
    q.indexOf('నా డెలివరీలు') !== -1 ||
    q.indexOf('నా డెలివరీ') !== -1 ||
    q.indexOf('డెలివరీ') !== -1
  ) {
    const responseText =
      respLocale === 'mr'
        ? 'तुमच्या सुरू असलेल्या डिलिव्हरी, थेट जीपीएस ट्रॅकिंग (GPS Tracking) आणि गेट पास दाखवत आहे.'
        : respLocale === 'te'
        ? 'మీ కొనసాగుతున్న డెలివరీలు, రియల్-టైమ్ GPS ట్రాకింగ్ మరియు గేట్ పాస్‌లను చూపుతున్నాము.'
        : respLocale === 'hi'
        ? 'आपकी सक्रिय फसल डिलीवरी, रियल-टाइम जीपीएस ट्रैकिंग (GPS Tracking) एवं गेट पास दिखाए जा रहे हैं।'
        : 'Showing your active crop Deliveries, in-transit dispatches, and real-time GPS tracking.';

    return {
      intent: 'NAVIGATE_DELIVERIES',
      title:
        respLocale === 'mr'
          ? 'डिलिव्हरी व वाहतूक ट्रॅकिंग'
          : respLocale === 'te'
          ? 'డెలివరీ & రవాణా ట్రాకింగ్'
          : respLocale === 'hi'
          ? 'डिलीवरी एवं परिवहन ट्रैकिंग'
          : 'Deliveries & Dispatches',
      responseText: responseText,
      actionLabel:
        respLocale === 'mr'
          ? 'डिलिव्हरी पहा'
          : respLocale === 'te'
          ? 'డెలివరీలను చూడండి'
          : respLocale === 'hi'
          ? 'डिलीवरी देखें'
          : 'View Deliveries Tab',
      actionUrl: '/farmer?tab=MY_DELIVERIES',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Active Dispatches', value: 'Real-time GPS & Inward Gate Pass' },
        { label: 'Section', value: 'Farmer Deliveries' },
      ],
    };
  }

  // 5. NAVIGATE_CROPS: Registered crops and active lots
  if (
    q.indexOf('my crop') !== -1 ||
    q.indexOf('my crops') !== -1 ||
    q.indexOf('my lot') !== -1 ||
    q.indexOf('my lots') !== -1 ||
    q.indexOf('my produce') !== -1 ||
    q.indexOf('show my crop') !== -1 ||
    q.indexOf('show my crops') !== -1 ||
    q.indexOf('show crops') !== -1 ||
    q.indexOf('show lots') !== -1 ||
    q.indexOf('open crops') !== -1 ||
    q.indexOf('माझी पिके') !== -1 ||
    q.indexOf('माझे पीक') !== -1 ||
    q.indexOf('माझा माल') !== -1 ||
    q.indexOf('शेतीमाल दाखवा') !== -1 ||
    q.indexOf('पिके दाखवा') !== -1 ||
    q.indexOf('पिके') !== -1 ||
    q.indexOf('मेरी फसलें') !== -1 ||
    q.indexOf('मेरी फसल') !== -1 ||
    q.indexOf('फसलें दिखाओ') !== -1 ||
    q.indexOf('फसल दिखाओ') !== -1 ||
    q.indexOf('फसलें') !== -1 ||
    q.indexOf('నా పంటలు') !== -1 ||
    q.indexOf('నా పంట') !== -1 ||
    q.indexOf('పంటలు చూపించు') !== -1 ||
    q.indexOf('పంటలను చూపించు') !== -1 ||
    q.indexOf('పంటలు') !== -1
  ) {
    const responseText =
      respLocale === 'mr'
        ? 'तुमची नोंदणीकृत पिके आणि सक्रिय शेतीमाल लॉट दाखवत आहे.'
        : respLocale === 'te'
        ? 'మీ నమోదిత పంటలు మరియు క్రియాశీల జాబితాలను చూపుతున్నాము.'
        : respLocale === 'hi'
        ? 'आपकी पंजीकृत फसलें और सक्रिय लॉट दिखाए जा रहे हैं।'
        : 'Showing your registered crops, active lots, and harvest listings.';

    return {
      intent: 'NAVIGATE_CROPS',
      title:
        respLocale === 'mr'
          ? 'माझी पिके'
          : respLocale === 'te'
          ? 'నా పంటలు'
          : respLocale === 'hi'
          ? 'मेरी फसलें'
          : 'My Crops & Lots',
      responseText: responseText,
      actionLabel:
        respLocale === 'mr'
          ? 'पिके डॅशबोर्ड उघडा'
          : respLocale === 'te'
          ? 'పంటల డ్యాష్‌బోర్డ్ తెరవండి'
          : respLocale === 'hi'
          ? 'फसल डैशबोर्ड खोलें'
          : 'Open Crops Dashboard',
      actionUrl: '/farmer',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Section', value: 'Farmer Produce Lots' },
        { label: 'Status', value: 'Curated Demo Lots Ready' },
      ],
    };
  }

  // 6. NAVIGATE_STORAGE: Storage facilities discovery & WDRA warehouses
  if (
    q.indexOf('onion storage') !== -1 ||
    q.indexOf('show storage') !== -1 ||
    q.indexOf('show onion storage') !== -1 ||
    q.indexOf('open storage') !== -1 ||
    q.indexOf('find storage') !== -1 ||
    q.indexOf('storage') !== -1 ||
    q.indexOf('warehouse') !== -1 ||
    q.indexOf('warehouses') !== -1 ||
    q.indexOf('chawl') !== -1 ||
    q.indexOf('cold storage') !== -1 ||
    q.indexOf('गोदाम') !== -1 ||
    q.indexOf('गोदामे') !== -1 ||
    q.indexOf('साठवणूक') !== -1 ||
    q.indexOf('कांदा साठवणूक') !== -1 ||
    q.indexOf('कांदा चाळ') !== -1 ||
    q.indexOf('चाळ') !== -1 ||
    q.indexOf('भंडारण') !== -1 ||
    q.indexOf('प्याज भंडारण') !== -1 ||
    q.indexOf('प्याज गोदाम') !== -1 ||
    q.indexOf('कोल्ड स्टोरेज') !== -1 ||
    q.indexOf('గిడ్డంగి') !== -1 ||
    q.indexOf('గిడ్డంగులు') !== -1 ||
    q.indexOf('ఉల్లిపాయ గిడ్డంగి') !== -1 ||
    q.indexOf('స్టోరేజ్') !== -1
  ) {
    const responseText =
      respLocale === 'mr'
        ? 'नाशिक, पुणे, लासलगावसह महाराष्ट्रातील १५ डब्ल्यूडीआरए प्रमाणित गोदामे आणि कांदा चाळी उपलब्ध आहेत.'
        : respLocale === 'te'
        ? 'నాసిక్, పూణే, లసల్‌గావ్‌తో సహా మహారాష్ట్ర అంతటా 15 WDRA-ధృవీకరించబడిన గిడ్డంగులు అందుబాటులో ఉన్నాయి.'
        : respLocale === 'hi'
        ? 'नासिक, पुणे, लासलगांव सहित महाराष्ट्र भर में १५ डब्ल्यूडीआरए प्रमाणित गोदाम एवं प्याज चाली उपलब्ध हैं।'
        : 'Found 15 WDRA-certified storage facilities across Maharashtra including cold storages and onion chawls.';

    return {
      intent: 'NAVIGATE_STORAGE',
      title:
        respLocale === 'mr'
          ? 'गोदाम व साठवणूक शोध'
          : respLocale === 'te'
          ? 'గిడ్డంగి & స్టోరేజ్ అన్వేషణ'
          : respLocale === 'hi'
          ? 'गोदाम व भंडारण खोज'
          : 'Storage Facilities Discovery',
      responseText: responseText,
      actionLabel:
        respLocale === 'mr'
          ? 'गोदामे पहा'
          : respLocale === 'te'
          ? 'గిడ్డంగులను చూడండి'
          : respLocale === 'hi'
          ? 'गोदाम देखें'
          : 'Explore Storage Facilities',
      actionUrl: '/storage',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Certified Facilities', value: '15 Across 8 Maharashtra Districts' },
        { label: 'Key Hubs', value: 'Nashik, Niphad, Lasalgaon, Pune, Solapur' },
        { label: 'Intelligence', value: 'Dynamic Store-vs-Sell Decision Support' },
      ],
    };
  }

  // 7. NAVIGATE_DEMANDS: Institutional buyer demands
  if (
    q.indexOf('buyer demand') !== -1 ||
    q.indexOf('buyer demands') !== -1 ||
    q.indexOf('show buyer demands') !== -1 ||
    q.indexOf('show demands') !== -1 ||
    q.indexOf('demands') !== -1 ||
    q.indexOf('खरेदीदार मागण्या') !== -1 ||
    q.indexOf('खरेदीदारांची मागणी') !== -1 ||
    q.indexOf('मागण्या दाखवा') !== -1 ||
    q.indexOf('मागण्या') !== -1 ||
    q.indexOf('డిమాండ్లు') !== -1 ||
    q.indexOf('కొనుగోలుదారు డిమాండ్లు') !== -1 ||
    q.indexOf('డిమాండ్లు చూపించు') !== -1 ||
    q.indexOf('खरीदार मांगें') !== -1 ||
    q.indexOf('खरीदारों की मांग') !== -1 ||
    q.indexOf('मांगें दिखाओ') !== -1 ||
    q.indexOf('मांगें') !== -1
  ) {
    const responseText =
      respLocale === 'mr'
        ? 'कांदा, टोमॅटो, सोयाबीन आणि द्राक्षांसाठी महाराष्ट्रातील सक्रिय खरेदीदार मागण्या उपलब्ध आहेत.'
        : respLocale === 'te'
        ? 'ఉల్లిపాయ, టమోటా, సోయాబీన్ మరియు ద్రాక్ష కోసం యాక్టివ్ కొనుగోలుదారు డిమాండ్లు అందుబాటులో ఉన్నాయి.'
        : respLocale === 'hi'
        ? 'प्याज, टमाटर, सोयाबीन और अंगूर के लिए सक्रिय खरीदार मांगें उपलब्ध हैं।'
        : 'Found active verified institutional buyer demands across Maharashtra for Onion, Tomato, Soybean and Grapes.';

    return {
      intent: 'NAVIGATE_DEMANDS',
      title:
        respLocale === 'mr'
          ? 'खरेदीदार मागण्या'
          : respLocale === 'te'
          ? 'కొనుగోలుదారు డిమాండ్లు'
          : respLocale === 'hi'
          ? 'खरीदार मांगें'
          : 'Institutional Buyer Demands',
      responseText: responseText,
      actionLabel:
        respLocale === 'mr'
          ? 'मागण्या पहा'
          : respLocale === 'te'
          ? 'డిమాండ్లను చూడండి'
          : respLocale === 'hi'
          ? 'मांगें देखें'
          : 'View Buyer Demands',
      actionUrl: '/farmer?tab=FIND_BUYERS',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Active Demands', value: 'Verified Processing & Export Buyers' },
        { label: 'Curated Lots', value: '13 Scenarios Ready for Matching' },
      ],
    };
  }

  // 8. NAVIGATE_CALCULATOR: Mandi price discovery & net realisation calculator
  if (
    q.indexOf('open calculator') !== -1 ||
    q.indexOf('show calculator') !== -1 ||
    q.indexOf('calculator') !== -1 ||
    q.indexOf('net profit calculator') !== -1 ||
    q.indexOf('profit calculator') !== -1 ||
    q.indexOf('कॅल्क्युलेटर') !== -1 ||
    q.indexOf('कैलकुलेटर') !== -1 ||
    q.indexOf('కాలిక్యులేటర్') !== -1
  ) {
    const responseText =
      respLocale === 'mr'
        ? 'निव्वळ नफा आणि मंडी भाव शोध कॅल्क्युलेटर उघडत आहे.'
        : respLocale === 'te'
        ? 'నికర రాబడి మరియు మార్కెట్ ధర కాలిక్యులేటర్‌ను తెరుస్తున్నాము.'
        : respLocale === 'hi'
        ? 'शुद्ध प्राप्ति एवं मंडी भाव कैलकुलेटर खोला जा रहा है।'
        : 'Opening the Net Realisation and Mandi Price Discovery Calculator.';

    return {
      intent: 'NAVIGATE_CALCULATOR',
      title:
        respLocale === 'mr'
          ? 'शुद्ध प्राप्ती कॅल्क्युलेटर'
          : respLocale === 'te'
          ? 'నికర రాబడి కాలిక్యులేటర్'
          : respLocale === 'hi'
          ? 'शुद्ध प्राप्ति कैलकुलेटर'
          : 'Net Realisation Calculator',
      responseText: responseText,
      actionLabel:
        respLocale === 'mr'
          ? 'कॅल्क्युलेटर उघडा'
          : respLocale === 'te'
          ? 'కాలిక్యులేటర్‌ను తెరవండి'
          : respLocale === 'hi'
          ? 'कैलकुलेटर खोलें'
          : 'Open Standalone Calculator',
      actionUrl: '/calculator',
      detectedLanguage: detectedLang,
      details: [
        { label: 'Engine', value: 'Net Realisation & Mandi Price Discovery' },
        { label: 'Deductions', value: 'APMC Cess, Transport, Handling, Weighment' },
      ],
    };
  }

  // 9. FIND_BUYER: Matching buyers discovery
  if (
    q.indexOf('find buyer') !== -1 ||
    q.indexOf('find buyers') !== -1 ||
    q.indexOf('show buyers') !== -1 ||
    q.indexOf('search buyers') !== -1 ||
    q.indexOf('buyer') !== -1 ||
    q.indexOf('buyers') !== -1 ||
    q.indexOf('sell') !== -1 ||
    q.indexOf('demand') !== -1 ||
    q.indexOf('खरेदीदार') !== -1 ||
    q.indexOf('विक्री') !== -1 ||
    q.indexOf('मागणी') !== -1 ||
    q.indexOf('కొనుగోలుదారు') !== -1 ||
    q.indexOf('కొనుగోలుదారులు') !== -1 ||
    q.indexOf('అమ్మకం') !== -1 ||
    q.indexOf('खरीदार') !== -1
  ) {
    const responseText =
      respLocale === 'mr'
        ? 'तुमच्या मालासाठी २ सक्रिय खरेदीदार उपलब्ध आहेत: ABC Foods (१०० क्विंटल मागणी) आणि सह्याद्री ॲग्रो.'
        : respLocale === 'te'
        ? 'మీ పంట కోసం 2 ధృవీకరించబడిన కొనుగోలుదారులు ఉన్నారు: ABC Foods మరియు Sahyadri Agro.'
        : respLocale === 'hi'
        ? 'आपकी फसल के लिए २ सत्यापित खरीदार उपलब्ध हैं: ABC Foods (१०० क्विंटल मांग) एवं सह्याद्री एग्रो।'
        : 'Found 2 verified matching buyers for your lot: ABC Foods (100 Qtl demand) and Sahyadri Agro.';

    return {
      intent: 'FIND_BUYER',
      title:
        respLocale === 'mr'
          ? 'थेट खरेदीदार मागणी'
          : respLocale === 'te'
          ? 'ప్రత్యక్ష కొనుగోలుదారు డిమాండ్'
          : respLocale === 'hi'
          ? 'सीधी खरीदार मांग'
          : 'Matching Buyers Discovery',
      responseText: responseText,
      actionLabel:
        respLocale === 'mr'
          ? 'खरेदीदार मागण्या पहा'
          : respLocale === 'te'
          ? 'కొనుగోలుదారు డిమాండ్లను చూడండి'
          : respLocale === 'hi'
          ? 'खरीदार मांगें देखें'
          : 'Explore Matching Buyers',
      actionUrl: '/buyer',
      detectedLanguage: detectedLang,
      details: [
        { label: respLocale === 'mr' ? 'प्रमुख खरेदीदार' : respLocale === 'te' ? 'ప్రధాన కొనుగోలుదారు' : respLocale === 'hi' ? 'प्रमुख खरीदार' : 'Top Buyer', value: 'ABC Foods Ltd (Verified FSSAI)' },
        { label: respLocale === 'mr' ? 'सक्रिय मागणी' : respLocale === 'te' ? 'యాక్టివ్ డిమాండ్' : respLocale === 'hi' ? 'सक्रिय मांग' : 'Active Demand', value: '100 Quintals (Nashik / Niphad)' },
        { label: respLocale === 'mr' ? 'ऑफर भाव' : respLocale === 'te' ? 'ఆఫర్ చేసిన ధర' : respLocale === 'hi' ? 'ऑफर भाव' : 'Offered Price', value: '₹2,420 / Qtl' },
      ],
    };
  }

  // 10. MARKET_PRICE (Strictly preserving test-voice-speech.js expected outputs)
  const isMarketPriceTrigger =
    q.indexOf('price') !== -1 ||
    q.indexOf('rate') !== -1 ||
    q.indexOf('mandi') !== -1 ||
    q.indexOf('bhav') !== -1 ||
    q.indexOf('भाव') !== -1 ||
    q.indexOf('दर') !== -1 ||
    q.indexOf('किंमत') !== -1 ||
    q.indexOf('ధర') !== -1 ||
    q.indexOf('రేటు') !== -1 ||
    q.indexOf('मंडी') !== -1 ||
    q.indexOf('रेट') !== -1 ||
    (
      (q.indexOf('potato') !== -1 || q.indexOf('बटाटा') !== -1 || q.indexOf('బంగాళాదుంప') !== -1 || q.indexOf('आलू') !== -1 ||
       q.indexOf('onion') !== -1 || q.indexOf('कांदा') !== -1 || q.indexOf('ఉల్లి') !== -1 || q.indexOf('प्याज') !== -1 ||
       q.indexOf('tomato') !== -1 || q.indexOf('टोमॅटो') !== -1 || q.indexOf('టమోటా') !== -1 || q.indexOf('టమాట') !== -1 || q.indexOf('टमाटर') !== -1 ||
       q.indexOf('wheat') !== -1 || q.indexOf('गहू') !== -1 || q.indexOf('गोధుम') !== -1 || q.indexOf('गेहूं') !== -1 ||
       q.indexOf('soybean') !== -1 || q.indexOf('सोयाबीन') !== -1 || q.indexOf('సోయాబీన్') !== -1) &&
      (q.indexOf('today') !== -1 || q.indexOf('आज') !== -1 || q.indexOf('నేడు') !== -1 || q.indexOf('cost') !== -1 || q.indexOf('किती') !== -1 || q.indexOf('ఎంత') !== -1 || q.indexOf('कितना') !== -1)
    );

  if (isMarketPriceTrigger) {
    const cropMandiPrices = JSON.parse(JSON.stringify({
      Onion: {
        defaultMandi: 'Lasalgaon APMC',
        defaultPrice: '₹2,150 / Qtl',
        mandis: {
          lasalgaon: '₹2,150 / Qtl',
          niphad: '₹2,180 / Qtl',
          nashik: '₹2,120 / Qtl',
          pune: '₹2,420 / Qtl',
          solapur: '₹2,200 / Qtl',
          vashi: '₹2,550 / Qtl',
          pimpalgaon: '₹2,220 / Qtl',
          ahmednagar: '₹2,180 / Qtl',
          jalgaon: '₹2,050 / Qtl',
          dhule: '₹2,080 / Qtl',
        },
      },
      Tomato: {
        defaultMandi: 'Pune Market Yard',
        defaultPrice: '₹1,600 / Qtl',
        mandis: {
          pune: '₹1,600 / Qtl',
          nashik: '₹1,580 / Qtl',
          narayangaon: '₹1,680 / Qtl',
          lasalgaon: '₹1,520 / Qtl',
          niphad: '₹1,500 / Qtl',
          vashi: '₹1,750 / Qtl',
          kolhapur: '₹1,620 / Qtl',
        },
      },
      Wheat: {
        defaultMandi: 'Kalyan APMC',
        defaultPrice: '₹2,850 / Qtl',
        mandis: {
          kalyan: '₹2,850 / Qtl',
          ahmednagar: '₹2,420 / Qtl',
          jalgaon: '₹2,390 / Qtl',
          dhule: '₹2,370 / Qtl',
          pune: '₹2,780 / Qtl',
          nagpur: '₹2,720 / Qtl',
          lasalgaon: '₹2,380 / Qtl',
          niphad: '₹2,350 / Qtl',
          solapur: '₹2,450 / Qtl',
          akola: '₹2,410 / Qtl',
        },
      },
      Soybean: {
        defaultMandi: 'Akola APMC',
        defaultPrice: '₹4,580 / Qtl',
        mandis: {
          akola: '₹4,580 / Qtl',
          kolhapur: '₹4,600 / Qtl',
          latur: '₹4,650 / Qtl',
          ahmednagar: '₹4,520 / Qtl',
          jalgaon: '₹4,500 / Qtl',
          dhule: '₹4,480 / Qtl',
          solapur: '₹4,540 / Qtl',
          nagpur: '₹4,560 / Qtl',
        },
      },
      Potato: {
        defaultMandi: 'Pune Market Yard',
        defaultPrice: '₹1,900 / Qtl',
        mandis: {
          pune: '₹1,900 / Qtl',
          nashik: '₹1,850 / Qtl',
          solapur: '₹1,780 / Qtl',
          vashi: '₹2,100 / Qtl',
          kolhapur: '₹1,820 / Qtl',
          nagpur: '₹1,880 / Qtl',
        },
      },
      Cotton: {
        defaultMandi: 'Dhule APMC',
        defaultPrice: '₹7,200 / Qtl',
        mandis: {
          dhule: '₹7,200 / Qtl',
          nagpur: '₹7,300 / Qtl',
          akola: '₹7,150 / Qtl',
          jalgaon: '₹7,180 / Qtl',
        },
      },
      Grapes: {
        defaultMandi: 'Sangli APMC',
        defaultPrice: '₹4,380 / Qtl',
        mandis: {
          sangli: '₹4,380 / Qtl',
          nashik: '₹4,200 / Qtl',
          niphad: '₹4,350 / Qtl',
          pune: '₹4,450 / Qtl',
        },
      },
      Pomegranate: {
        defaultMandi: 'Solapur APMC',
        defaultPrice: '₹8,900 / Qtl',
        mandis: {
          solapur: '₹8,900 / Qtl',
          pune: '₹9,200 / Qtl',
          sangli: '₹8,750 / Qtl',
          nashik: '₹8,600 / Qtl',
        },
      },
      Maize: {
        defaultMandi: 'Jalgaon APMC',
        defaultPrice: '₹2,020 / Qtl',
        mandis: {
          jalgaon: '₹2,020 / Qtl',
          dhule: '₹1,980 / Qtl',
          nashik: '₹2,000 / Qtl',
          pune: '₹2,080 / Qtl',
        },
      },
      Jaggery: {
        defaultMandi: 'Anakapalle Jaggery Mandi',
        defaultPrice: '₹3,850 / Qtl',
        mandis: {
          anakapalle: '₹3,850 / Qtl',
          kolhapur: '₹4,050 / Qtl',
          sangli: '₹3,950 / Qtl',
        },
      },
      Turmeric: {
        defaultMandi: 'Sangli APMC',
        defaultPrice: '₹13,800 / Qtl',
        mandis: {
          sangli: '₹13,800 / Qtl',
        },
      },
      'Rice / Paddy': {
        defaultMandi: 'Visakhapatnam APMC Yard',
        defaultPrice: '₹2,380 / Qtl',
        mandis: {
          vizag: '₹2,380 / Qtl',
          kolhapur: '₹2,420 / Qtl',
        },
      },
      'Raw Cashew': {
        defaultMandi: 'Palasa Cashew Terminal',
        defaultPrice: '₹11,400 / Qtl',
        mandis: {
          palasa: '₹11,400 / Qtl',
        },
      },
      'Arabica Coffee': {
        defaultMandi: 'Araku Valley Market',
        defaultPrice: '₹28,200 / Qtl',
        mandis: {
          araku: '₹28,200 / Qtl',
        },
      },
      'Red Chilli': {
        defaultMandi: 'Kakinada Agro Port Terminal',
        defaultPrice: '₹19,800 / Qtl',
        mandis: {
          kakinada: '₹19,800 / Qtl',
        },
      },
    }));

    let commodity = 'Onion';
    if (q.indexOf('onion') !== -1 || q.indexOf('कांदा') !== -1 || q.indexOf('कांद्या') !== -1 || q.indexOf('ఉల్లి') !== -1 || q.indexOf('प्याज') !== -1) {
      commodity = 'Onion';
    } else if (q.indexOf('potato') !== -1 || q.indexOf('बटाटा') !== -1 || q.indexOf('बटाटे') !== -1 || q.indexOf('बटाट्या') !== -1 || q.indexOf('బంగాళాదుంప') !== -1 || q.indexOf('ఆలూ') !== -1 || q.indexOf('आलू') !== -1) {
      commodity = 'Potato';
    } else if (q.indexOf('tomato') !== -1 || q.indexOf('टोमॅटो') !== -1 || q.indexOf('టమోటా') !== -1 || q.indexOf('టమాట') !== -1 || q.indexOf('टमाटर') !== -1) {
      commodity = 'Tomato';
    } else if (q.indexOf('wheat') !== -1 || q.indexOf('गहू') !== -1 || q.indexOf('गव्हा') !== -1 || q.indexOf('గోధుమ') !== -1 || q.indexOf('गेहूं') !== -1 || q.indexOf('गेहूँ') !== -1) {
      commodity = 'Wheat';
    } else if (q.indexOf('soybean') !== -1 || q.indexOf('सोयाबीन') !== -1 || q.indexOf('సోయాబీన్') !== -1 || q.indexOf('soya') !== -1) {
      commodity = 'Soybean';
    } else if (q.indexOf('cotton') !== -1 || q.indexOf('कापूस') !== -1 || q.indexOf('कापसा') !== -1 || q.indexOf('పత్తి') !== -1 || q.indexOf('कपास') !== -1) {
      commodity = 'Cotton';
    } else if (q.indexOf('grape') !== -1 || q.indexOf('grapes') !== -1 || q.indexOf('द्राक्षे') !== -1 || q.indexOf('द्राक्ष') !== -1 || q.indexOf('द्राక్ష') !== -1 || q.indexOf('अंगूर') !== -1) {
      commodity = 'Grapes';
    } else if (q.indexOf('pomegranate') !== -1 || q.indexOf('डाळिंब') !== -1 || q.indexOf('దానిమ్మ') !== -1 || q.indexOf('अनार') !== -1) {
      commodity = 'Pomegranate';
    } else if (q.indexOf('maize') !== -1 || /\bcorn\b/.test(q) || q.indexOf('मका') !== -1 || q.indexOf('మొక్కజొన్న') !== -1 || q.indexOf('मक्का') !== -1) {
      commodity = 'Maize';
    } else if (q.indexOf('jaggery') !== -1 || q.indexOf('गूळ') !== -1 || q.indexOf('गुळा') !== -1 || q.indexOf('బెల్లం') !== -1 || q.indexOf('गुड़') !== -1) {
      commodity = 'Jaggery';
    } else if (q.indexOf('turmeric') !== -1 || q.indexOf('हळद') !== -1 || q.indexOf('పసుపు') !== -1 || q.indexOf('हल्दी') !== -1) {
      commodity = 'Turmeric';
    } else if (/\brice\b/.test(q) || /\bpaddy\b/.test(q) || q.indexOf('भात') !== -1 || q.indexOf('వరి') !== -1 || q.indexOf('धान') !== -1) {
      commodity = 'Rice / Paddy';
    } else if (q.indexOf('cashew') !== -1 || q.indexOf('काजू') !== -1 || q.indexOf('జీడిపప్పు') !== -1) {
      commodity = 'Raw Cashew';
    } else if (q.indexOf('coffee') !== -1 || q.indexOf('कॉफ़ी') !== -1 || q.indexOf('कॉफी') !== -1 || q.indexOf('కాఫీ') !== -1) {
      commodity = 'Arabica Coffee';
    } else if (q.indexOf('chilli') !== -1 || q.indexOf('chili') !== -1 || q.indexOf('मिरची') !== -1 || q.indexOf('మిరప') !== -1 || q.indexOf('मिर्च') !== -1) {
      commodity = 'Red Chilli';
    }

    const mandiList = [
      { key: 'lasalgaon', name: 'Lasalgaon APMC', match: q.indexOf('lasalgaon') !== -1 || q.indexOf('लासलगाव') !== -1 || q.indexOf('లసల్‌గావ్') !== -1 },
      { key: 'niphad', name: 'Niphad APMC', match: q.indexOf('niphad') !== -1 || q.indexOf('निफाड') !== -1 || q.indexOf('నిఫాడ్') !== -1 },
      { key: 'nashik', name: 'Nashik APMC', match: q.indexOf('nashik') !== -1 || q.indexOf('नाशिक') !== -1 || q.indexOf('నాసిక్') !== -1 },
      { key: 'pune', name: 'Pune Market Yard', match: q.indexOf('pune') !== -1 || q.indexOf('पुणे') !== -1 || q.indexOf('पुण्यात') !== -1 || q.indexOf('పుణే') !== -1 || q.indexOf('పూణే') !== -1 },
      { key: 'ahmednagar', name: 'Ahmednagar APMC', match: q.indexOf('ahmednagar') !== -1 || q.indexOf('अहमदनगर') !== -1 || q.indexOf('అహ్మద్‌నగర్') !== -1 },
      { key: 'jalgaon', name: 'Jalgaon APMC', match: q.indexOf('jalgaon') !== -1 || q.indexOf('जळगाव') !== -1 || q.indexOf('జలగావ్') !== -1 },
      { key: 'solapur', name: 'Solapur APMC', match: q.indexOf('solapur') !== -1 || q.indexOf('sholapur') !== -1 || q.indexOf('सोलापूर') !== -1 || q.indexOf('సోలాపూర్') !== -1 || q.indexOf('షోలాపూర్') !== -1 },
      { key: 'sangli', name: 'Sangli APMC', match: q.indexOf('sangli') !== -1 || q.indexOf('सांगली') !== -1 || q.indexOf('సాంగ్లి') !== -1 },
      { key: 'kolhapur', name: 'Kolhapur APMC', match: q.indexOf('kolhapur') !== -1 || q.indexOf('कोल्हापूर') !== -1 || q.indexOf('కొల్హాపూర్') !== -1 },
      { key: 'dhule', name: 'Dhule APMC', match: q.indexOf('dhule') !== -1 || q.indexOf('धुळे') !== -1 || q.indexOf('ధులే') !== -1 },
      { key: 'akola', name: 'Akola APMC', match: q.indexOf('akola') !== -1 || q.indexOf('अकोला') !== -1 || q.indexOf('అకోలా') !== -1 },
      { key: 'vashi', name: 'Vashi APMC (Navi Mumbai)', match: q.indexOf('vashi') !== -1 || q.indexOf('navi mumbai') !== -1 || q.indexOf('वाशी') !== -1 || q.indexOf('వాశి') !== -1 },
      { key: 'nagpur', name: 'Nagpur Cotton Market', match: q.indexOf('nagpur') !== -1 || q.indexOf('नागपूर') !== -1 || q.indexOf('నాగ్‌పూర్') !== -1 },
      { key: 'kalyan', name: 'Kalyan APMC', match: q.indexOf('kalyan') !== -1 || q.indexOf('कल्याण') !== -1 || q.indexOf('కల్యాణ్') !== -1 },
      { key: 'narayangaon', name: 'Narayangaon APMC', match: q.indexOf('narayangaon') !== -1 || q.indexOf('नारायणगाव') !== -1 || q.indexOf('నారాయణగావ్') !== -1 },
      { key: 'latur', name: 'Latur APMC', match: q.indexOf('latur') !== -1 || q.indexOf('लातूर') !== -1 || q.indexOf('లాతూర్') !== -1 },
      { key: 'pimpalgaon', name: 'Pimpalgaon Baswant APMC', match: q.indexOf('pimpalgaon') !== -1 || q.indexOf('पिंपळगाव') !== -1 || q.indexOf('పింపల్‌గావ్') !== -1 },
      { key: 'anakapalle', name: 'Anakapalle Jaggery Mandi', match: q.indexOf('anakapalle') !== -1 || q.indexOf('अनकापल्ले') !== -1 || q.indexOf('అనకాపల్లి') !== -1 },
      { key: 'vizag', name: 'Visakhapatnam APMC Yard', match: q.indexOf('visakhapatnam') !== -1 || q.indexOf('vizag') !== -1 || q.indexOf('विशाखापट्टणम') !== -1 || q.indexOf('విశాఖపట్నం') !== -1 },
      { key: 'palasa', name: 'Palasa Cashew Terminal', match: q.indexOf('palasa') !== -1 || q.indexOf('पलासा') !== -1 || q.indexOf('పలాస') !== -1 },
      { key: 'araku', name: 'Araku Valley Market', match: q.indexOf('araku') !== -1 || q.indexOf('अराकू') !== -1 || q.indexOf('అరకు') !== -1 },
      { key: 'kakinada', name: 'Kakinada Agro Port Terminal', match: q.indexOf('kakinada') !== -1 || q.indexOf('काकिनाडा') !== -1 || q.indexOf('కాకినాడ') !== -1 },
    ];

    const detectedMandi = mandiList.find((m) => m.match);
    const profile = cropMandiPrices[commodity] || cropMandiPrices['Onion'];

    let market = profile.defaultMandi;
    let modalPrice = profile.defaultPrice;
    let isDataUnavailable = false;

    if (detectedMandi) {
      if (profile.mandis[detectedMandi.key]) {
        market = detectedMandi.name;
        modalPrice = profile.mandis[detectedMandi.key];
      } else {
        isDataUnavailable = true;
        market = detectedMandi.name;
      }
    }

    let responseText = '';
    if (isDataUnavailable) {
      responseText =
        respLocale === 'mr'
          ? market + ' मध्ये ' + commodity + ' साठी बाजार भाव माहिती सध्या उपलब्ध नाही.'
          : respLocale === 'te'
          ? market + ' లో ' + commodity + ' కోసం మార్కెట్ ధరల సమాచారం ప్రస్తుతం అందుబాటులో లేదు.'
          : respLocale === 'hi'
          ? market + ' में ' + commodity + ' के लिए मंडी भाव डाटा वर्तमान में उपलब्ध नहीं है।'
          : 'Market price data for ' + commodity + ' at ' + market + ' is currently unavailable.';
    } else {
      responseText =
        respLocale === 'mr'
          ? commodity + ' चा आजचा मॉडेल भाव ' + market + ' मध्ये ' + modalPrice + ' आहे.'
          : respLocale === 'te'
          ? market + ' లో ' + commodity + ' నేటి సగటు ధర ' + modalPrice + ' గా ఉంది.'
          : respLocale === 'hi'
          ? market + ' में ' + commodity + ' का आज का मॉडल भाव ' + modalPrice + ' है।'
          : "Today's modal price for " + commodity + " at " + market + " is " + modalPrice + ".";
    }

    return {
      intent: 'MARKET_PRICE',
      title:
        respLocale === 'mr'
          ? 'मंडी बाजार भाव तपासणी'
          : respLocale === 'te'
          ? 'మార్కెట్ ధరల తనిఖీ'
          : respLocale === 'hi'
          ? 'मंडी बाजार भाव जांच'
          : 'Mandi Market Price Check',
      responseText: responseText,
      actionLabel:
        respLocale === 'mr'
          ? 'सर्व मंडी भाव पहा'
          : respLocale === 'te'
          ? 'అన్ని మార్కెట్ ధరలను చూడండి'
          : respLocale === 'hi'
          ? 'सभी मंडी भाव देखें'
          : 'View All Mandi Prices',
      actionUrl: '/markets',
      detectedLanguage: detectedLang,
      details: [
        { label: respLocale === 'mr' ? 'जिंस' : respLocale === 'te' ? 'పంట' : respLocale === 'hi' ? 'जिंस' : 'Commodity', value: commodity },
        { label: respLocale === 'mr' ? 'मॉडेल भाव' : respLocale === 'te' ? 'మోడల్ ధర' : respLocale === 'hi' ? 'मॉडल भाव' : 'Modal Price', value: isDataUnavailable ? 'Data Unavailable' : modalPrice },
        { label: respLocale === 'mr' ? 'प्रमुख एपीएमसी' : respLocale === 'te' ? 'ప్రధాన మార్కెట్' : respLocale === 'hi' ? 'प्रमुख एपीएमसी' : 'Key APMC Mandi', value: market },
      ],
    };
  }

  // 11. NET_REALISATION (General profit query fallback)
  if (
    q.indexOf('net') !== -1 ||
    q.indexOf('realisation') !== -1 ||
    q.indexOf('profit') !== -1 ||
    q.indexOf('money') !== -1 ||
    q.indexOf('option') !== -1 ||
    q.indexOf('नफा') !== -1 ||
    q.indexOf('निव्वळ') !== -1 ||
    q.indexOf('प्राप्ती') !== -1 ||
    q.indexOf('पैसा') !== -1 ||
    q.indexOf('లాభం') !== -1 ||
    q.indexOf('నికర') !== -1 ||
    q.indexOf('ఆదాయం') !== -1 ||
    q.indexOf('शुद्ध') !== -1
  ) {
    const responseText =
      respLocale === 'mr'
        ? 'तुमच्या ८० क्विंटल कांद्यासाठी सर्वोच्च निव्वळ प्राप्ती ₹१,९१,२०० आहे (ABC Foods कडून, वाहतूक व हमाली वजा करून).'
        : respLocale === 'te'
        ? 'మీ 80 క్వింటాళ్ల ఉల్లిపాయకు అత్యధిక నికర రాబడి ₹1,91,200 (ABC Foods నుండి, రవాణా తీసివేసిన తర్వాత).'
        : respLocale === 'hi'
        ? 'आपके ८० क्विंटल प्याज के लिए उच्चतम शुद्ध प्राप्ति ₹१,९१,२०० है (ABC Foods द्वारा, परिवहन एवं हमाली घटाकर)।'
        : 'The highest reliable Net Realisation for your 80 Qtl onion lot is ₹1,91,200 from ABC Foods after transport and handling deductions.';

    return {
      intent: 'NET_REALISATION',
      title:
        respLocale === 'mr'
          ? 'निव्वळ नफा तुलना'
          : respLocale === 'te'
          ? 'నికర రాబడి పోలిక'
          : respLocale === 'hi'
          ? 'शुद्ध लाभ तुलना'
          : 'Net Realisation Comparison',
      responseText: responseText,
      actionLabel:
        respLocale === 'mr'
          ? 'शुद्ध प्राप्ती कॅल्क्युलेटर'
          : respLocale === 'te'
          ? 'నికర రాబడిని లెక్కించండి'
          : respLocale === 'hi'
          ? 'शुद्ध लाभ की गणना करें'
          : 'Open Net Realisation Engine',
      actionUrl: '/calculator',
      detectedLanguage: detectedLang,
      details: [
        { label: respLocale === 'mr' ? 'सर्वोत्तम पर्याय' : respLocale === 'te' ? 'ఉత్తమ విక్రయ ఎంపిక' : respLocale === 'hi' ? 'सर्वोत्तम विकल्प' : 'Best Selling Option', value: 'ABC Foods Direct Trade' },
        { label: respLocale === 'mr' ? 'एकूण भाव' : respLocale === 'te' ? 'స్థూల ధర' : respLocale === 'hi' ? 'सकल भाव' : 'Gross Quoted Price', value: '₹2,420 / Quintal' },
        { label: respLocale === 'mr' ? 'निश्चित शुद्ध नफा' : respLocale === 'te' ? 'నికర రాబడి' : respLocale === 'hi' ? 'निश्चित शुद्ध लाभ' : 'Locked Net Realisation', value: '₹1,91,200 (₹2,390/Qtl Take-Home)' },
      ],
    };
  }

  // 12. FIND_TRANSPORT
  if (
    q.indexOf('transport') !== -1 ||
    q.indexOf('truck') !== -1 ||
    q.indexOf('vehicle') !== -1 ||
    q.indexOf('logistics') !== -1 ||
    q.indexOf('वाहतूक') !== -1 ||
    q.indexOf('गाडी') !== -1 ||
    q.indexOf('ट्रक') !== -1 ||
    q.indexOf('రవాణా') !== -1 ||
    q.indexOf('లారీ') !== -1 ||
    q.indexOf('परिवहन') !== -1
  ) {
    const responseText =
      respLocale === 'mr'
        ? 'तुमच्या मार्गावर ३ सत्यापित वाहतूकदार उपलब्ध आहेत: सह्याद्री लॉजिस्टिक्स (६ टन आयशर) आणि किसान ट्रान्स फ्लीट.'
        : respLocale === 'te'
        ? 'మీ మార్గంలో 3 రవాణాదారులు అందుబాటులో ఉన్నారు: Sahyadri Logistics మరియు Kisan Trans.'
        : respLocale === 'hi'
        ? 'आपके रूट पर ३ सत्यापित ट्रांसपोर्टर उपलब्ध हैं: सह्याद्री लॉजिस्टिक्स (६ टन) एवं किसान ट्रांस।'
        : 'Found 3 verified transporters servicing your corridor: Sahyadri Logistics (6T Eicher) and Kisan Trans Fleet.';

    return {
      intent: 'FIND_TRANSPORT',
      title:
        respLocale === 'mr'
          ? 'वाहतूक व लॉजिस्टिक्स'
          : respLocale === 'te'
          ? 'రవాణా లాజిస్టిక్స్'
          : respLocale === 'hi'
          ? 'परिवहन लॉजिस्टिक्स'
          : 'Transport Logistics Matching',
      responseText: responseText,
      actionLabel:
        respLocale === 'mr'
          ? 'वाहतूक बुक करा'
          : respLocale === 'te'
          ? 'రవాణాను బుక్ చేయండి'
          : respLocale === 'hi'
          ? 'परिवहन बुक करें'
          : 'Book Transport Logistics',
      actionUrl: '/transporter',
      detectedLanguage: detectedLang,
      details: [
        { label: respLocale === 'mr' ? 'प्रमुख वाहतूकदार' : respLocale === 'te' ? 'ప్రధాన రవాణాదారు' : respLocale === 'hi' ? 'प्रमुख ट्रांसपोर्टर' : 'Top Transporter', value: 'Sahyadri Logistics (MH-15-EG-4421)' },
        { label: respLocale === 'mr' ? 'अंदाजित भाडे' : respLocale === 'te' ? 'అంచనా రవాణా ఖర్చు' : respLocale === 'hi' ? 'अनुमानित भाड़ा' : 'Estimated Freight', value: '₹1,350 (30 km local corridor)' },
        { label: respLocale === 'mr' ? 'वाहन प्रकार' : respLocale === 'te' ? 'వాహనం రకం' : respLocale === 'hi' ? 'वाहन प्रकार' : 'Vehicle Type', value: 'Eicher 6 Ton Open Body' },
      ],
    };
  }

  // 13. VIEW_OFFERS
  if (
    q.indexOf('offer') !== -1 ||
    q.indexOf('bid') !== -1 ||
    q.indexOf('proposal') !== -1 ||
    q.indexOf('ऑफर') !== -1 ||
    q.indexOf('बोली') !== -1 ||
    q.indexOf('ఆఫర్') !== -1 ||
    q.indexOf('ప్రతిపాదన') !== -1 ||
    q.indexOf('प्रस्ताव') !== -1
  ) {
    const responseText =
      respLocale === 'mr'
        ? 'तुमच्याकडे १ नवीन ऑफर प्रलंबित आहे: ABC Foods कडून ₹२,४२० प्रति क्विंटल दराने.'
        : respLocale === 'te'
        ? 'మీకు 1 పెండింగ్ ఆఫర్ ఉంది: ABC Foods నుండి క్వింటాల్‌కు ₹2,420 చొప్పున.'
        : respLocale === 'hi'
        ? 'आपके पास १ नया ऑफर लंबित है: ABC Foods से ₹२,४२० प्रति क्विंटल भाव पर।'
        : 'You have 1 pending offer: ABC Foods at ₹2,420/Quintal for your active onion lot.';

    return {
      intent: 'VIEW_OFFERS',
      title:
        respLocale === 'mr'
          ? 'खरेदीदार ऑफर्स'
          : respLocale === 'te'
          ? 'కొనుగోలుదారు ఆఫర్లు'
          : respLocale === 'hi'
          ? 'खरीदार ऑफर'
          : 'Incoming Buyer Offers',
      responseText: responseText,
      actionLabel:
        respLocale === 'mr'
          ? 'ऑफर्स तपासा'
          : respLocale === 'te'
          ? 'ఆఫర్లను సమీక్షించండి'
          : respLocale === 'hi'
          ? 'ऑफर की समीक्षा करें'
          : 'Review Incoming Offers',
      actionUrl: '/lots',
      detectedLanguage: detectedLang,
      details: [
        { label: respLocale === 'mr' ? 'खरेदीदार' : respLocale === 'te' ? 'కొనుగోలుదారు' : respLocale === 'hi' ? 'खरीदार' : 'Buyer', value: 'ABC Foods Ltd' },
        { label: respLocale === 'mr' ? 'ऑफर भाव' : respLocale === 'te' ? 'ఆఫర్ ధర' : respLocale === 'hi' ? 'ऑफर भाव' : 'Offered Price', value: '₹2,420 / Qtl' },
        { label: respLocale === 'mr' ? 'स्थिती' : respLocale === 'te' ? 'స్థితి' : respLocale === 'hi' ? 'स्थिति' : 'Status', value: 'Pending Farmer Action' },
      ],
    };
  }

  // 14. VIEW_TRANSACTIONS
  if (
    q.indexOf('transaction') !== -1 ||
    q.indexOf('trade') !== -1 ||
    q.indexOf('order') !== -1 ||
    q.indexOf('payment') !== -1 ||
    q.indexOf('व्यवहार') !== -1 ||
    q.indexOf('ऑर्डर') !== -1 ||
    q.indexOf('पैसे') !== -1 ||
    q.indexOf('లావాదేవీ') !== -1 ||
    q.indexOf('చెల్లింపు') !== -1 ||
    q.indexOf('सौदे') !== -1 ||
    q.indexOf('भुगतान') !== -1
  ) {
    const responseText =
      respLocale === 'mr'
        ? 'तुमचे अलीकडील व्यवहार सुरक्षित आहेत. डिलिव्हरी पूर्ण झाल्यावर बँक खात्यात थेट पेमेंट जमा होईल.'
        : respLocale === 'te'
        ? 'మీ ఇటీవలి లావాదేవీలు సురక్షితంగా ట్రాక్ చేయబడుతున్నాయి. డెలివరీ తర్వాత బ్యాంక్ ఖాతాకు చెల్లింపు జమ చేయబడుతుంది.'
        : respLocale === 'hi'
        ? 'आपके हाल के सौदे सुरक्षित रूप से ट्रैक किए जा रहे हैं। डिलीवरी सत्यापन के बाद बैंक खाते में भुगतान जमा होगा।'
        : 'Your active trade transactions are tracked securely with milestone escrow protection.';

    return {
      intent: 'VIEW_TRANSACTIONS',
      title:
        respLocale === 'mr'
          ? 'व्यवहार व पेमेंट ट्रॅकिंग'
          : respLocale === 'te'
          ? 'లావాదేవీ & చెల్లింపు ట్రాకింగ్'
          : respLocale === 'hi'
          ? 'सौदा व भुगतान ट्रैकिंग'
          : 'Transaction & Payment Tracking',
      responseText: responseText,
      actionLabel:
        respLocale === 'mr'
          ? 'सर्व व्यवहार पहा'
          : respLocale === 'te'
          ? 'అన్ని లావాదేవీలను చూడండి'
          : respLocale === 'hi'
          ? 'सभी सौदे देखें'
          : 'View All Transactions',
      actionUrl: '/transactions',
      detectedLanguage: detectedLang,
      details: [
        { label: respLocale === 'mr' ? 'सक्रिय व्यवहार' : respLocale === 'te' ? 'యాక్టివ్ లావాదేవీ' : respLocale === 'hi' ? 'सक्रिय सौदा' : 'Active Transaction', value: 'TXN-2026-0001 (ABC Foods)' },
        { label: respLocale === 'mr' ? 'डिलिव्हरी स्थिती' : respLocale === 'te' ? 'డెలివరీ స్థితి' : respLocale === 'hi' ? 'डिलीवरी स्थिति' : 'Delivery Status', value: 'In-Transit / Delivered' },
        { label: respLocale === 'mr' ? 'पेमेंट टप्पा' : respLocale === 'te' ? 'చెల్లింపు మైలురాయి' : respLocale === 'hi' ? 'भुगतान चरण' : 'Payment Milestone', value: 'Demo Escrow Verified' },
      ],
    };
  }

  // 15. HELP
  if (
    q.indexOf('help') !== -1 ||
    q.indexOf('मदत') !== -1 ||
    q.indexOf('సహాయం') !== -1 ||
    q.indexOf('మద్దతు') !== -1 ||
    q.indexOf('मदद') !== -1
  ) {
    const responseText =
      respLocale === 'mr'
        ? 'मी किसानसेतू आवाज सहाय्यक आहे. तुम्ही मला बाजार भाव, खरेदीदार, वाहतूक किंवा निव्वळ नफ्याबद्दल विचारू शकता.'
        : respLocale === 'te'
        ? 'నేను కిసాన్ సేతు వాయిస్ అసిస్టెంట్‌ని. మీరు నన్ను మార్కెట్ ధరలు, కొనుగోలుదారులు, రవాణా లేదా నికర లాభం గురించి అడగవచ్చు.'
        : respLocale === 'hi'
        ? 'मैं किसानसेतु वॉयस सहायक हूँ। आप मुझसे मंडी भाव, खरीदार, परिवहन या शुद्ध मुनाफे के बारे में पूछ सकते हैं।'
        : 'I am KisanSetu Voice Assistant. You can ask me about market prices, buyers, transport, offers, or net profit calculations.';

    return {
      intent: 'HELP',
      title: 'KisanSetu Voice Help',
      responseText: responseText,
      detectedLanguage: detectedLang,
      details: [
        { label: 'Ask Prices', value: '"What is today\'s onion price?"' },
        { label: 'Ask Best Mandi', value: '"Which mandi has the best onion price?"' },
        { label: 'Ask Storage', value: '"Should I sell my onion now or store it?"' },
        { label: 'Ask Buyers', value: '"Find buyers for my onion."' },
        { label: 'Ask Net Profit', value: '"What is net realisation?"' },
      ],
    };
  }

  // 16. Fallback (UNRECOGNIZED) - Strict matching for test-voice-speech.js
  const fallbackResponse =
    respLocale === 'mr'
      ? 'मी बाजार भाव, खरेदीदार, निव्वळ नफा, वाहतूक, ऑफर्स आणि व्यवहारांबद्दल मदत करू शकतो.'
      : respLocale === 'te'
      ? 'నేను మార్కెట్ ధరలు, కొనుగోలుదారులు, నికర రాబడి, రవాణా, ఆఫర్లు మరియు లావాదేవీల గురించి సహాయం చేయగలను.'
      : respLocale === 'hi'
      ? 'मैं मंडी भाव, खरीदार, शुद्ध प्राप्ति, परिवहन, ऑफर्स एवं सौदों में मदद कर सकता हूँ।'
      : 'I can help with market prices, buyers, net realisation, transport, offers and transactions.';

  return {
    intent: 'UNRECOGNIZED',
    title: 'Voice Query',
    responseText: fallbackResponse,
    detectedLanguage: detectedLang,
    details: [
      { label: 'Suggested', value: 'Ask: "What is today\'s onion price?"' },
      { label: 'Suggested', value: 'Ask: "Which mandi has the best onion price?"' },
      { label: 'Suggested', value: 'Ask: "Should I sell now or store for 30 days?"' },
      { label: 'Suggested', value: 'Ask: "How much will I receive after transport charges?"' },
    ],
  };
}

export function FarmerVoiceAssistant() {
  const router = useRouter();
  const { locale, t } = useLanguage();

  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voiceInputLocale, setVoiceInputLocale] = useState<string | null>(null);

  interface ISpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onresult: ((event: { results: Array<Array<{ transcript: string }>> }) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
  }

  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Map application locale to browser speech locale
  const getSpeechLocale = useCallback(() => {
    switch (locale) {
      case 'mr':
        return 'mr-IN';
      case 'te':
        return 'te-IN';
      case 'hi':
        return 'hi-IN';
      default:
        return 'en-IN';
    }
  }, [locale]);

  const getEffectiveSpeechLocale = useCallback(() => {
    if (voiceInputLocale) return voiceInputLocale;
    return getSpeechLocale();
  }, [voiceInputLocale, getSpeechLocale]);

  // Try to find the best available matching browser voice for the selected locale
  const getBestVoice = useCallback((localeCode: string): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const cleanTarget = localeCode.toLowerCase().replace('_', '-');
    const targetPrefix = cleanTarget.split('-')[0];

    // 1. Exact match e.g. 'mr-in', 'hi-in', 'te-in', 'en-in'
    const exact = voices.find(
      (v) => v.lang.toLowerCase().replace('_', '-') === cleanTarget
    );
    if (exact) return exact;

    // 2. Prefix match e.g. 'mr', 'hi', 'te', 'en'
    const prefixMatch = voices.find((v) =>
      v.lang.toLowerCase().replace('_', '-').startsWith(targetPrefix)
    );
    if (prefixMatch) return prefixMatch;

    // 3. Indian English fallback if regional Indian language voice is absent in browser
    const indianEnglish = voices.find(
      (v) => v.lang.toLowerCase().replace('_', '-') === 'en-in'
    );
    if (indianEnglish) return indianEnglish;

    // 4. Default voice or first voice
    return voices.find((v) => v.default) || voices[0] || null;
  }, []);

  const handleReadAloud = useCallback(
    (textToSpeak: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      try {
        // Prevent overlapping speech: cancel previous speech before speaking new response
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        // Dynamically detect spoken text language for authentic TTS pronunciation
        let targetSpeechLocale = getSpeechLocale();
        if (/[\u0C00-\u0C7F]/.test(textToSpeak)) {
          targetSpeechLocale = 'te-IN';
        } else if (/[\u0900-\u097F]/.test(textToSpeak)) {
          if (/[\u0933]/.test(textToSpeak) || /(?:चा|ची|चे|आहे|आहेत|पिके|गोदामे|तक्रारी|तक्रार|विका|मिळाले)/.test(textToSpeak)) {
            targetSpeechLocale = 'mr-IN';
          } else if (locale === 'mr') {
            targetSpeechLocale = 'mr-IN';
          } else {
            targetSpeechLocale = 'hi-IN';
          }
        } else if (/[a-zA-Z]/.test(textToSpeak)) {
          targetSpeechLocale = 'en-IN';
        }

        utterance.lang = targetSpeechLocale;
        utterance.rate = 0.95; // Clear pace for rural farmers

        const matchedVoice = getBestVoice(targetSpeechLocale);
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
          // 'interrupted' or 'canceled' are standard when speech is superseded or cancelled
          if (e.error !== 'interrupted' && e.error !== 'canceled') {
            console.warn('SpeechSynthesis error:', e.error);
          }
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis failed:', err);
        setIsSpeaking(false);
      }
    },
    [locale, getSpeechLocale, getBestVoice]
  );

  const handleStopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Cache voices when browser loads them asynchronously and clean up on unmount
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const updateVoices = () => {
      window.speechSynthesis.getVoices();
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const win = window as unknown as {
      SpeechRecognition?: new () => ISpeechRecognition;
      webkitSpeechRecognition?: new () => ISpeechRecognition;
    };
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getEffectiveSpeechLocale();

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: { results: Array<Array<{ transcript: string }>> }) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
        const parsed = parseFarmerIntent(spokenText, locale);
        setResult(parsed);
        setIsListening(false);
        // Automatically call browser SpeechSynthesis to READ THE ANSWER ALOUD
        handleReadAloud(parsed.responseText);
      };

      recognition.onerror = (event: { error: string }) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage(t.voice.permissionDenied);
        } else if (event.error !== 'no-speech') {
          setErrorMessage(t.voice.fallbackResponse);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition init failed:', err);
      setIsSupported(false);
    }
  }, [locale, getEffectiveSpeechLocale, handleReadAloud, t.voice.permissionDenied, t.voice.fallbackResponse]);

  const handleStartListening = () => {
    if (!recognitionRef.current) {
      setIsSupported(false);
      return;
    }
    setTranscript('');
    setResult(null);
    setErrorMessage(null);
    try {
      recognitionRef.current.lang = getEffectiveSpeechLocale();
      recognitionRef.current.start();
    } catch (err) {
      console.warn('Start listening error:', err);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Safe ignore
      }
    }
    setIsListening(false);
  };

  const handleRunQuery = (queryText: string) => {
    setTranscript(queryText);
    const parsed = parseFarmerIntent(queryText, locale);
    setResult(parsed);
    setErrorMessage(null);
    // Automatically call browser SpeechSynthesis to READ THE ANSWER ALOUD
    handleReadAloud(parsed.responseText);
  };

  const sampleQueries = [
    { label: t.voice.queryPrice, query: t.voice.queryPrice },
    { label: locale === 'mr' ? 'सर्वोत्तम मंडी भाव' : locale === 'te' ? 'ఉత్తమ మార్కెట్ ధర' : locale === 'hi' ? 'सर्वोत्तम मंडी भाव' : 'Best Mandi Price', query: locale === 'mr' ? 'कोणत्या मंडीत कांद्याला सर्वोत्तम भाव मिळतो?' : locale === 'te' ? 'ఏ మార్కెట్‌లో ఉల్లిపాయకు ఉత్తమ ధర వస్తుంది?' : locale === 'hi' ? 'किस मंडी में प्याज का सबसे अच्छा भाव है?' : 'Which mandi has the best onion price?' },
    { label: locale === 'mr' ? 'साठवणूक की विक्री?' : locale === 'te' ? 'నిల్వ చేయాలా లేదా అమ్మాలా?' : locale === 'hi' ? 'स्टोर करें या बेचें?' : 'Store vs Sell (30 Days)', query: locale === 'mr' ? 'मी कांदा आत्ता विकावा की साठवून ठेवावा?' : locale === 'te' ? 'నేను ఉల్లిపాయను ఇప్పుడే అమ్మాలా లేక నిల్వ చేయాలా?' : locale === 'hi' ? 'क्या मुझे प्याज अभी बेचना चाहिए या भंडारित करना चाहिए?' : 'Should I sell my onion now or store it?' },
    { label: locale === 'mr' ? 'गव्हाची साठवणूक' : locale === 'te' ? 'గోధుమ నిల్వ' : locale === 'hi' ? 'गेहूं भंडारण' : 'Store Wheat', query: locale === 'mr' ? 'गहू कोठे साठवू शकतो?' : locale === 'te' ? 'గోధుమను ఎక్కడ నిల్వ చేయవచ్చు?' : locale === 'hi' ? 'मैं अपना गेहूं कहाँ भंडारित कर सकता हूँ?' : 'Where can I store my wheat?' },
    { label: locale === 'mr' ? 'वाहतूक कपातीनंतर नफा' : locale === 'te' ? 'రవాణా తర్వాత నికర రాబడి' : locale === 'hi' ? 'परिवहन बाद शुद्ध प्राप्ति' : 'Net Take-Home', query: locale === 'mr' ? 'वाहतूक खर्च वजा जाता मला किती मिळतील?' : locale === 'te' ? 'రవాణా ఖర్చుల తర్వాత నాకు ఎంత వస్తుంది?' : locale === 'hi' ? 'परिवहन खर्च के बाद मुझे कितना मिलेगा?' : 'How much will I receive after transport charges?' },
    { label: locale === 'mr' ? 'शेतमाल कसा विकावा' : locale === 'te' ? 'పంటను ఎలా అమ్మాలి' : locale === 'hi' ? 'फसल कैसे बेचें' : 'How to Sell', query: locale === 'mr' ? 'मी शेतमाल कसा विकू?' : locale === 'te' ? 'నా పంటను ఎలా అమ్మాలి?' : locale === 'hi' ? 'मैं अपनी फसल कैसे बेचूँ?' : 'How do I sell my crop?' },
    { label: locale === 'mr' ? 'वाहतुकीत नुकसान झाल्यास' : locale === 'te' ? 'రవాణాలో నష్టం' : locale === 'hi' ? 'परिवहन में नुकसान' : "Transit Damage", query: locale === 'mr' ? 'वाहतुकीदरम्यान मालाचे नुकसान झाले तर काय करावे?' : locale === 'te' ? 'రవాణాలో పంట పాడైతే ఏమి చేయాలి?' : locale === 'hi' ? 'परिवहन में फसल खराब हो जाए तो क्या करें?' : 'What can I do if my crop is damaged during transport?' },
    { label: locale === 'mr' ? 'खरेदीदाराने कमी पैसे दिले तर' : locale === 'te' ? 'తక్కువ డబ్బు ఇస్తే' : locale === 'hi' ? 'कम पैसे मिले तो' : 'Underpayment Guide', query: locale === 'mr' ? 'खरेदीदाराने कमी पैसे दिले तर काय?' : locale === 'te' ? 'కొనుగోలుదారు తక్కువ డబ్బు ఇస్తే ఏమి చేయాలి?' : locale === 'hi' ? 'अगर खरीदार कम पैसे दे तो क्या करें?' : 'What if the buyer gives me less money?' },
    { label: locale === 'mr' ? 'एआय गुणवत्ता पडताळणी' : locale === 'te' ? 'AI నాణ్యత అంచనా' : locale === 'hi' ? 'एआई गुणवत्ता जांच' : 'AI Quality Assessment', query: locale === 'mr' ? 'एआय गुणवत्ता तपासणी म्हणजे काय?' : locale === 'te' ? 'AI నాణ్యత అంచనా అంటే ఏమిటి?' : locale === 'hi' ? 'एआई गुणवत्ता मूल्यांकन का क्या अर्थ है?' : 'What does AI quality assessment mean?' },
    { label: t.voice.queryBuyers, query: t.voice.queryBuyers },
    { label: t.voice.queryTransport, query: t.voice.queryTransport },
  ];

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    handleRunQuery(textInput.trim());
    setTextInput('');
  };

  return (
    <Card className="border-2 border-emerald-500/80 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white shadow-md relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <CardHeader className="pb-3 border-b border-emerald-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="emerald" className="bg-emerald-600 text-white font-bold">
                VOICE ASSISTANT
              </Badge>
              <span className="text-[11px] font-mono text-emerald-800 uppercase font-bold">
                {getEffectiveSpeechLocale()} • BROWSER-NATIVE
              </span>
            </div>
            <CardTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-700" />
              <span>
                {locale === 'mr'
                  ? 'शेतकरी आवाज सहाय्यक'
                  : locale === 'te'
                  ? 'రైతు వాయిస్ అసిస్టెంట్'
                  : locale === 'hi'
                  ? 'किसान वॉयस सहायक'
                  : 'Farmer Voice Assistant'}
              </span>
            </CardTitle>
            <p className="text-xs text-gray-600">
              {t.voice.buttonHint}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Voice Language:
              </span>
              {[
                { code: 'auto', label: 'Auto' },
                { code: 'en-IN', label: 'English' },
                { code: 'mr-IN', label: 'मराठी' },
                { code: 'hi-IN', label: 'हिन्दी' },
                { code: 'te-IN', label: 'తెలుగు' },
              ].map((item) => {
                const isSelected =
                  item.code === 'auto'
                    ? voiceInputLocale === null
                    : voiceInputLocale === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      const nextCode = item.code === 'auto' ? null : item.code;
                      setVoiceInputLocale(nextCode);
                    }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                        : 'bg-white/80 text-gray-700 border-gray-300 hover:bg-emerald-50 hover:border-emerald-400'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Microphone Trigger Button */}
          <div className="flex items-center gap-2">
            {!isListening ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartListening}
                className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black px-6 py-3 rounded-2xl shadow-md active:scale-95 transition-all text-sm"
              >
                <Mic className="w-5 h-5 text-amber-300 animate-pulse" />
                <span>{t.voice.buttonLabel}</span>
              </Button>
            ) : (
              <Button
                variant="danger"
                size="lg"
                onClick={handleStopListening}
                className="gap-2 bg-rose-600 hover:bg-rose-700 text-white font-black px-6 py-3 rounded-2xl shadow-lg ring-4 ring-rose-200 animate-pulse text-sm"
              >
                <MicOff className="w-5 h-5" />
                <span>{t.voice.stop}</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Active Listening Indicator */}
        {isListening && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-rose-600 animate-ping shrink-0" />
              <span className="text-sm font-black text-rose-900">
                {t.voice.listening} ({getSpeechLocale()})
              </span>
            </div>
            <button
              onClick={handleStopListening}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
            >
              {t.voice.cancel}
            </button>
          </div>
        )}

        {/* Browser Unsupported Notice */}
        {!isSupported && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>{t.voice.notSupported}</p>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Text Input Fallback (for noisy APMC yards or non-voice environments) */}
        <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={t.voice.typeQueryPlaceholder}
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 shadow-2xs"
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={!textInput.trim()}
            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 shrink-0 gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.voice.askKisanSetu}</span>
          </Button>
        </form>

        {/* Voice Result Card */}
        {result && (
          <div className="p-4 rounded-2xl bg-white border-2 border-emerald-300 shadow-sm space-y-3">
            {transcript && (
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>
                  {t.voice.youSaid} &ldquo;<strong className="text-gray-900">{transcript}</strong>&rdquo;
                </span>
                <Badge variant={result.intent === 'UNRECOGNIZED' ? 'amber' : 'emerald'} className="text-[10px]">
                  {result.title}
                </Badge>
              </div>
            )}

            {/* Answer Display */}
            <div className="text-sm text-gray-900 font-medium leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 flex items-start justify-between gap-3">
              <p className="text-emerald-950 font-bold">{result.responseText}</p>

              {/* 🔊 Read Aloud button */}
              <div>
                {!isSpeaking ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReadAloud(result.responseText)}
                    className="gap-1.5 text-xs text-emerald-800 border-emerald-300 hover:bg-emerald-100 shrink-0"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t.voice.readAloud}</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleStopSpeaking}
                    className="gap-1.5 text-xs text-rose-700 border-rose-300 hover:bg-rose-100 shrink-0"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>{t.voice.stop}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Explicit Consequential Action Confirmation Card */}
            {result.isConsequential && (
              <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-400 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>{t.voice.confirmActionTitle}</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  {result.confirmationWarning || t.voice.confirmActionPrompt}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      if (result.confirmedActionUrl) {
                        router.push(result.confirmedActionUrl);
                      }
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.voice.confirmButton}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleStopSpeaking();
                      setResult(null);
                    }}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 text-xs gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{t.voice.cancelButton}</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Unrecognized Guidance with Helpful Chips */}
            {result.intent === 'UNRECOGNIZED' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>{t.voice.unrecognizedHelp}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Show onion storage",
                    "What is today's onion price?",
                    "Find buyers",
                    "Open calculator",
                    "Show my crops",
                    "Show buyer demands",
                    "Show my deliveries",
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleRunQuery(suggestion)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-100 text-blue-800 font-medium transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Details if available */}
            {result.details && result.details.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {result.details.map((d, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="text-gray-500 block text-[11px]">{d.label}</span>
                    <span className="font-bold text-gray-900 block truncate">{d.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Link to existing workflows (for non-consequential direct navigation) */}
            {!result.isConsequential && result.actionUrl && result.actionLabel && (
              <div className="pt-2 flex justify-end">
                <Link href={result.actionUrl}>
                  <Button size="sm" variant="primary" className="gap-2 text-xs bg-emerald-800 hover:bg-emerald-900">
                    <span>{result.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Quick Suggestion Chips (Farmer-friendly one-tap query) */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            {t.voice.suggestionTitle}
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleRunQuery(item.query)}
                className="text-xs px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 text-gray-700 font-medium transition-all shadow-2xs text-left"
              >
                &ldquo;{item.label}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Safety Disclaimer */}
        <p className="text-[10px] text-gray-500 italic pt-1">
          {t.voice.safetyNotice}
        </p>
      </CardContent>
    </Card>
  );
}
