'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';

/**
 * Prototype voice assistant: purely informational and navigational.
 * Never executes financial commitments, offer acceptances, or status mutations without explicit visual confirmation.
 */
export type VoiceIntent =
  | 'MARKET_PRICE'
  | 'FIND_BUYER'
  | 'NET_REALISATION'
  | 'FIND_TRANSPORT'
  | 'VIEW_OFFERS'
  | 'VIEW_TRANSACTIONS'
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
}

export function parseFarmerIntent(text: string, locale: string): VoiceResult {
  const q = text.toLowerCase().trim();

  // 1. MARKET_PRICE
  if (
    q.includes('price') ||
    q.includes('rate') ||
    q.includes('mandi') ||
    q.includes('bhav') ||
    q.includes('भाव') ||
    q.includes('दर') ||
    q.includes('किंमत') ||
    q.includes('ధర') ||
    q.includes('రేటు') ||
    q.includes('मंडी')
  ) {
    let commodity = 'Onion';
    let modalPrice = '₹2,150 / Qtl';
    let market = 'Lasalgaon APMC';

    if (q.includes('tomato') || q.includes('टोमॅटो') || q.includes('టమోటా')) {
      commodity = 'Tomato';
      modalPrice = '₹1,600 / Qtl';
      market = 'Pune Market Yard';
    } else if (q.includes('soybean') || q.includes('सोयाबीन') || q.includes('సోయాబీన్')) {
      commodity = 'Soybean';
      modalPrice = '₹4,580 / Qtl';
      market = 'Akola APMC';
    } else if (q.includes('jaggery') || q.includes('गूळ') || q.includes('బెల్లం') || q.includes('गुड़')) {
      commodity = 'Jaggery';
      modalPrice = '₹3,850 / Qtl';
      market = 'Anakapalle Jaggery Mandi';
    } else if (q.includes('cashew') || q.includes('काजू') || q.includes('జీడిపప్పు')) {
      commodity = 'Raw Cashew';
      modalPrice = '₹11,400 / Qtl';
      market = 'Palasa Cashew Terminal';
    } else if (q.includes('coffee') || q.includes('कॉफ़ी') || q.includes('కాఫీ')) {
      commodity = 'Arabica Coffee';
      modalPrice = '₹28,200 / Qtl';
      market = 'Araku Valley Market';
    }

    const responseText =
      locale === 'mr'
        ? `${commodity} चा आजचा मॉडेल भाव ${market} मध्ये ${modalPrice} आहे.`
        : locale === 'te'
        ? `${market} లో ${commodity} నేటి సగటు ధర ${modalPrice} గా ఉంది.`
        : locale === 'hi'
        ? `${market} में ${commodity} का आज का मॉडल भाव ${modalPrice} है।`
        : `Today's modal price for ${commodity} at ${market} is ${modalPrice}.`;

    return {
      intent: 'MARKET_PRICE',
      title: locale === 'mr' ? 'मंडी बाजार भाव तपासणी' : locale === 'te' ? 'మార్కెట్ ధరల తనిఖీ' : locale === 'hi' ? 'मंडी बाजार भाव जांच' : 'Mandi Market Price Check',
      responseText,
      actionLabel: locale === 'mr' ? 'सर्व मंडी भाव पहा' : locale === 'te' ? 'అన్ని మార్కెట్ ధరలను చూడండి' : locale === 'hi' ? 'सभी मंडी भाव देखें' : 'View All Mandi Prices',
      actionUrl: '/markets',
      details: [
        { label: locale === 'mr' ? 'जिंस' : locale === 'te' ? 'పంట' : locale === 'hi' ? 'जिंस' : 'Commodity', value: commodity },
        { label: locale === 'mr' ? 'मॉडेल भाव' : locale === 'te' ? 'మోడల్ ధర' : locale === 'hi' ? 'मॉडल भाव' : 'Modal Price', value: modalPrice },
        { label: locale === 'mr' ? 'प्रमुख एपीएमसी' : locale === 'te' ? 'ప్రధాన మార్కెట్' : locale === 'hi' ? 'प्रमुख एपीएमसी' : 'Key APMC Mandi', value: market },
      ],
    };
  }

  // 2. FIND_BUYER
  if (
    q.includes('buyer') ||
    q.includes('sell') ||
    q.includes('demand') ||
    q.includes('खरेदीदार') ||
    q.includes('विक्री') ||
    q.includes('मागणी') ||
    q.includes('కొనుగోలుదారు') ||
    q.includes('అమ్మకం') ||
    q.includes('खरीदार')
  ) {
    const responseText =
      locale === 'mr'
        ? 'तुमच्या मालासाठी २ सक्रिय खरेदीदार उपलब्ध आहेत: ABC Foods (१०० क्विंटल मागणी) आणि सह्याद्री ॲग्रो.'
        : locale === 'te'
        ? 'మీ పంట కోసం 2 ధృవీకరించబడిన కొనుగోలుదారులు ఉన్నారు: ABC Foods మరియు Sahyadri Agro.'
        : locale === 'hi'
        ? 'आपकी फसल के लिए २ सत्यापित खरीदार उपलब्ध हैं: ABC Foods (१०० क्विंटल मांग) एवं सह्याद्री एग्रो।'
        : 'Found 2 verified matching buyers for your lot: ABC Foods (100 Qtl demand) and Sahyadri Agro.';

    return {
      intent: 'FIND_BUYER',
      title: locale === 'mr' ? 'थेट खरेदीदार मागणी' : locale === 'te' ? 'ప్రత్యక్ష కొనుగోలుదారు డిమాండ్' : locale === 'hi' ? 'सीधी खरीदार मांग' : 'Matching Buyers Discovery',
      responseText,
      actionLabel: locale === 'mr' ? 'खरेदीदार मागण्या पहा' : locale === 'te' ? 'కొనుగోలుదారు డిమాండ్లను చూడండి' : locale === 'hi' ? 'खरीदार मांगें देखें' : 'Explore Matching Buyers',
      actionUrl: '/buyer',
      details: [
        { label: locale === 'mr' ? 'प्रमुख खरेदीदार' : locale === 'te' ? 'ప్రధాన కొనుగోలుదారు' : locale === 'hi' ? 'प्रमुख खरीदार' : 'Top Buyer', value: 'ABC Foods Ltd (Verified FSSAI)' },
        { label: locale === 'mr' ? 'सक्रिय मागणी' : locale === 'te' ? 'యాక్టివ్ డిమాండ్' : locale === 'hi' ? 'सक्रिय मांग' : 'Active Demand', value: '100 Quintals (Nashik / Niphad)' },
        { label: locale === 'mr' ? 'ऑफर भाव' : locale === 'te' ? 'ఆఫర్ చేసిన ధర' : locale === 'hi' ? 'ऑफर भाव' : 'Offered Price', value: '₹2,420 / Qtl' },
      ],
    };
  }

  // 3. NET_REALISATION
  if (
    q.includes('net') ||
    q.includes('realisation') ||
    q.includes('profit') ||
    q.includes('money') ||
    q.includes('option') ||
    q.includes('नफा') ||
    q.includes('निव्वळ') ||
    q.includes('प्राप्ती') ||
    q.includes('पैसा') ||
    q.includes('లాభం') ||
    q.includes('నికర') ||
    q.includes('ఆదాయం') ||
    q.includes('शुद्ध')
  ) {
    const responseText =
      locale === 'mr'
        ? 'तुमच्या ८० क्विंटल कांद्यासाठी सर्वोच्च निव्वळ प्राप्ती ₹१,९१,२०० आहे (ABC Foods कडून, वाहतूक व हमाली वजा करून).'
        : locale === 'te'
        ? 'మీ 80 క్వింటాళ్ల ఉల్లిపాయకు అత్యధిక నికర రాబడి ₹1,91,200 (ABC Foods నుండి, రవాణా తీసివేసిన తర్వాత).'
        : locale === 'hi'
        ? 'आपके ८० क्विंटल प्याज के लिए उच्चतम शुद्ध प्राप्ति ₹१,९१,२०० है (ABC Foods द्वारा, परिवहन एवं हमाली घटाकर)।'
        : 'The highest reliable Net Realisation for your 80 Qtl onion lot is ₹1,91,200 from ABC Foods after transport and handling deductions.';

    return {
      intent: 'NET_REALISATION',
      title: locale === 'mr' ? 'निव्वळ नफा तुलना' : locale === 'te' ? 'నికర రాబడి పోలిక' : locale === 'hi' ? 'शुद्ध लाभ तुलना' : 'Net Realisation Comparison',
      responseText,
      actionLabel: locale === 'mr' ? 'शुद्ध प्राप्ती कॅल्क्युलेटर' : locale === 'te' ? 'నికర రాబడిని లెక్కించండి' : locale === 'hi' ? 'शुद्ध लाभ की गणना करें' : 'Open Net Realisation Engine',
      actionUrl: '/calculator',
      details: [
        { label: locale === 'mr' ? 'सर्वोत्तम पर्याय' : locale === 'te' ? 'ఉత్తమ విక్రయ ఎంపిక' : locale === 'hi' ? 'सर्वोत्तम विकल्प' : 'Best Selling Option', value: 'ABC Foods Direct Trade' },
        { label: locale === 'mr' ? 'एकूण भाव' : locale === 'te' ? 'స్థూల ధర' : locale === 'hi' ? 'सकल भाव' : 'Gross Quoted Price', value: '₹2,420 / Quintal' },
        { label: locale === 'mr' ? 'निश्चित शुद्ध नफा' : locale === 'te' ? 'నికర రాబడి' : locale === 'hi' ? 'निश्चित शुद्ध लाभ' : 'Locked Net Realisation', value: '₹1,91,200 (₹2,390/Qtl Take-Home)' },
      ],
    };
  }

  // 4. FIND_TRANSPORT
  if (
    q.includes('transport') ||
    q.includes('truck') ||
    q.includes('vehicle') ||
    q.includes('logistics') ||
    q.includes('वाहतूक') ||
    q.includes('गाडी') ||
    q.includes('ट्रक') ||
    q.includes('రవాణా') ||
    q.includes('లారీ') ||
    q.includes('परिवहन')
  ) {
    const responseText =
      locale === 'mr'
        ? 'तुमच्या मार्गावर ३ सत्यापित वाहतूकदार उपलब्ध आहेत: सह्याद्री लॉजिस्टिक्स (६ टन आयशर) आणि किसान ट्रान्स फ्लीट.'
        : locale === 'te'
        ? 'మీ మార్గంలో 3 రవాణాదారులు అందుబాటులో ఉన్నారు: Sahyadri Logistics మరియు Kisan Trans.'
        : locale === 'hi'
        ? 'आपके रूट पर ३ सत्यापित ट्रांसपोर्टर उपलब्ध हैं: सह्याद्री लॉजिस्टिक्स (६ टन) एवं किसान ट्रांस।'
        : 'Found 3 verified transporters servicing your corridor: Sahyadri Logistics (6T Eicher) and Kisan Trans Fleet.';

    return {
      intent: 'FIND_TRANSPORT',
      title: locale === 'mr' ? 'वाहतूक व लॉजिस्टिक्स' : locale === 'te' ? 'రవాణా లాజిస్టిక్స్' : locale === 'hi' ? 'परिवहन लॉजिस्टिक्स' : 'Transport Logistics Matching',
      responseText,
      actionLabel: locale === 'mr' ? 'वाहतूक बुक करा' : locale === 'te' ? 'రవాణాను బుక్ చేయండి' : locale === 'hi' ? 'परिवहन बुक करें' : 'Book Transport Logistics',
      actionUrl: '/transporter',
      details: [
        { label: locale === 'mr' ? 'प्रमुख वाहतूकदार' : locale === 'te' ? 'ప్రధాన రవాణాదారు' : locale === 'hi' ? 'प्रमुख ट्रांसपोर्टर' : 'Top Transporter', value: 'Sahyadri Logistics (MH-15-EG-4421)' },
        { label: locale === 'mr' ? 'अंदाजित भाडे' : locale === 'te' ? 'అంచనా రవాణా ఖర్చు' : locale === 'hi' ? 'अनुमानित भाड़ा' : 'Estimated Freight', value: '₹1,350 (30 km local corridor)' },
        { label: locale === 'mr' ? 'वाहन प्रकार' : locale === 'te' ? 'వాహనం రకం' : locale === 'hi' ? 'वाहन प्रकार' : 'Vehicle Type', value: 'Eicher 6 Ton Open Body' },
      ],
    };
  }

  // 5. VIEW_OFFERS
  if (
    q.includes('offer') ||
    q.includes('bid') ||
    q.includes('proposal') ||
    q.includes('ऑफर') ||
    q.includes('बोली') ||
    q.includes('ఆఫర్') ||
    q.includes('ప్రతిపాదన') ||
    q.includes('प्रस्ताव')
  ) {
    const responseText =
      locale === 'mr'
        ? 'तुमच्याकडे १ नवीन ऑफर प्रलंबित आहे: ABC Foods कडून ₹२,४२० प्रति क्विंटल दराने.'
        : locale === 'te'
        ? 'మీకు 1 పెండింగ్ ఆఫర్ ఉంది: ABC Foods నుండి క్వింటాల్‌కు ₹2,420 చొప్పున.'
        : locale === 'hi'
        ? 'आपके पास १ नया ऑफर लंबित है: ABC Foods से ₹२,४२० प्रति क्विंटल भाव पर।'
        : 'You have 1 pending offer: ABC Foods at ₹2,420/Quintal for your active onion lot.';

    return {
      intent: 'VIEW_OFFERS',
      title: locale === 'mr' ? 'खरेदीदार ऑफर्स' : locale === 'te' ? 'కొనుగోలుదారు ఆఫర్లు' : locale === 'hi' ? 'खरीदार ऑफर' : 'Incoming Buyer Offers',
      responseText,
      actionLabel: locale === 'mr' ? 'ऑफर्स तपासा' : locale === 'te' ? 'ఆఫర్లను సమీక్షించండి' : locale === 'hi' ? 'ऑफर की समीक्षा करें' : 'Review Incoming Offers',
      actionUrl: '/lots',
      details: [
        { label: locale === 'mr' ? 'खरेदीदार' : locale === 'te' ? 'కొనుగోలుదారు' : locale === 'hi' ? 'खरीदार' : 'Buyer', value: 'ABC Foods Ltd' },
        { label: locale === 'mr' ? 'ऑफर भाव' : locale === 'te' ? 'ఆఫర్ ధర' : locale === 'hi' ? 'ऑफर भाव' : 'Offered Price', value: '₹2,420 / Qtl' },
        { label: locale === 'mr' ? 'स्थिती' : locale === 'te' ? 'స్థితి' : locale === 'hi' ? 'स्थिति' : 'Status', value: 'Pending Farmer Action' },
      ],
    };
  }

  // 6. VIEW_TRANSACTIONS
  if (
    q.includes('transaction') ||
    q.includes('trade') ||
    q.includes('order') ||
    q.includes('payment') ||
    q.includes('व्यवहार') ||
    q.includes('ऑर्डर') ||
    q.includes('पैसे') ||
    q.includes('లావాదేవీ') ||
    q.includes('చెల్లింపు') ||
    q.includes('सौदे') ||
    q.includes('भुगतान')
  ) {
    const responseText =
      locale === 'mr'
        ? 'तुमचे अलीकडील व्यवहार सुरक्षित आहेत. डिलिव्हरी पूर्ण झाल्यावर बँक खात्यात थेट पेमेंट जमा होईल.'
        : locale === 'te'
        ? 'మీ ఇటీవలి లావాదేవీలు సురక్షితంగా ట్రాక్ చేయబడుతున్నాయి. డెలివరీ తర్వాత బ్యాంక్ ఖాతాకు చెల్లింపు జమ చేయబడుతుంది.'
        : locale === 'hi'
        ? 'आपके हाल के सौदे सुरक्षित रूप से ट्रैक किए जा रहे हैं। डिलीवरी सत्यापन के बाद बैंक खाते में भुगतान जमा होगा।'
        : 'Your active trade transactions are tracked securely with milestone escrow protection.';

    return {
      intent: 'VIEW_TRANSACTIONS',
      title: locale === 'mr' ? 'व्यवहार व पेमेंट ट्रॅकिंग' : locale === 'te' ? 'లావాదేవీ & చెల్లింపు ట్రాకింగ్' : locale === 'hi' ? 'सौदा व भुगतान ट्रैकिंग' : 'Transaction & Payment Tracking',
      responseText,
      actionLabel: locale === 'mr' ? 'सर्व व्यवहार पहा' : locale === 'te' ? 'అన్ని లావాదేవీలను చూడండి' : locale === 'hi' ? 'सभी सौदे देखें' : 'View All Transactions',
      actionUrl: '/transactions',
      details: [
        { label: locale === 'mr' ? 'सक्रिय व्यवहार' : locale === 'te' ? 'యాక్టివ్ లావాదేవీ' : locale === 'hi' ? 'सक्रिय सौदा' : 'Active Transaction', value: 'TXN-2026-0001 (ABC Foods)' },
        { label: locale === 'mr' ? 'डिलिव्हरी स्थिती' : locale === 'te' ? 'డెలివరీ స్థితి' : locale === 'hi' ? 'डिलीवरी स्थिति' : 'Delivery Status', value: 'In-Transit / Delivered' },
        { label: locale === 'mr' ? 'पेमेंट टप्पा' : locale === 'te' ? 'చెల్లింపు మైలురాయి' : locale === 'hi' ? 'भुगतान चरण' : 'Payment Milestone', value: 'Demo Escrow Verified' },
      ],
    };
  }

  // 7. HELP
  if (
    q.includes('help') ||
    q.includes('how') ||
    q.includes('what') ||
    q.includes('मदत') ||
    q.includes('कसे') ||
    q.includes('काय') ||
    q.includes('సహాయం') ||
    q.includes('ఎలా') ||
    q.includes('మద్దతు') ||
    q.includes('मदद')
  ) {
    const responseText =
      locale === 'mr'
        ? 'मी किसानसेतू आवाज सहाय्यक आहे. तुम्ही मला बाजार भाव, खरेदीदार, वाहतूक किंवा निव्वळ नफ्याबद्दल विचारू शकता.'
        : locale === 'te'
        ? 'నేను కిసాన్ సేతు వాయిస్ అసిస్టెంట్‌ని. మీరు నన్ను మార్కెట్ ధరలు, కొనుగోలుదారులు, రవాణా లేదా నికర లాభం గురించి అడగవచ్చు.'
        : locale === 'hi'
        ? 'मैं किसानसेतु वॉयस सहायक हूँ। आप मुझसे मंडी भाव, खरीदार, परिवहन या शुद्ध मुनाफे के बारे में पूछ सकते हैं।'
        : 'I am KisanSetu Voice Assistant. You can ask me about market prices, buyers, transport, offers, or net profit calculations.';

    return {
      intent: 'HELP',
      title: 'KisanSetu Voice Help',
      responseText,
      details: [
        { label: 'Ask Prices', value: '"What is today\'s onion price?"' },
        { label: 'Ask Buyers', value: '"Find buyers for my onion."' },
        { label: 'Ask Profit', value: '"Which option gives me more money?"' },
        { label: 'Ask Transport', value: '"Find transport for my lot."' },
      ],
    };
  }

  // Fallback
  const fallbackResponse =
    locale === 'mr'
      ? 'मी बाजार भाव, खरेदीदार, निव्वळ नफा, वाहतूक, ऑफर्स आणि व्यवहारांबद्दल मदत करू शकतो.'
      : locale === 'te'
      ? 'నేను మార్కెట్ ధరలు, కొనుగోలుదారులు, నికర రాబడి, రవాణా, ఆఫర్లు మరియు లావాదేవీల గురించి సహాయం చేయగలను.'
      : locale === 'hi'
      ? 'मैं मंडी भाव, खरीदार, शुद्ध प्राप्ति, परिवहन, ऑफर्स एवं सौदों में मदद कर सकता हूँ।'
      : 'I can help with market prices, buyers, net realisation, transport, offers and transactions.';

  return {
    intent: 'UNRECOGNIZED',
    title: 'Voice Query',
    responseText: fallbackResponse,
    details: [
      { label: 'Suggested', value: 'Ask: "What is today\'s onion price?"' },
      { label: 'Suggested', value: 'Ask: "Which option gives me more money?"' },
    ],
  };
}

export function FarmerVoiceAssistant() {
  const { locale, t } = useLanguage();

  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        const speechLocale = getSpeechLocale();
        utterance.lang = speechLocale;
        utterance.rate = 0.95; // Clear pace for rural farmers

        const matchedVoice = getBestVoice(speechLocale);
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
    [getSpeechLocale, getBestVoice]
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
      recognition.lang = getSpeechLocale();

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
  }, [locale, getSpeechLocale, handleReadAloud, t.voice.permissionDenied, t.voice.fallbackResponse]);

  const handleStartListening = () => {
    if (!recognitionRef.current) {
      setIsSupported(false);
      return;
    }
    setTranscript('');
    setResult(null);
    setErrorMessage(null);
    try {
      recognitionRef.current.lang = getSpeechLocale();
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
    { label: t.voice.queryProfit, query: t.voice.queryProfit },
    { label: t.voice.queryBuyers, query: t.voice.queryBuyers },
    { label: t.voice.queryTransport, query: t.voice.queryTransport },
    { label: t.voice.queryOffers, query: t.voice.queryOffers },
  ];

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
                {getSpeechLocale()} • BROWSER-NATIVE
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

            {/* Action Link to existing workflows */}
            {result.actionUrl && result.actionLabel && (
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
