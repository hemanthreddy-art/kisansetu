const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/i18n/translations.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add tabComplaints to TranslationDictionary.farmer interface
if (!content.includes('tabComplaints: string;')) {
  content = content.replace(/(tabHistory:\s*string;)/, '$1\r\n    tabComplaints: string;');
}

// 2. Add new fields to TranslationDictionary.disputes interface
if (!content.includes('reportIssueBtn: string;')) {
  const ifaceRepl = `$1\r\n    reportIssueBtn: string;
    tabComplaints: string;
    complaintsSub: string;
    stepSelectProblem: string;
    stepVerifyDetails: string;
    stepAddEvidence: string;
    stepReviewSubmit: string;
    autoAttachedNotice: string;
    categoryPaymentNotReceived: string;
    categoryPaymentIncorrect: string;
    categoryBuyerIssue: string;
    categoryTransportIssue: string;
    categoryProduceDamaged: string;
    categoryDeliveryIssue: string;
    categoryContractIssue: string;
    evidenceOptional: string;
    photoOrDocUpload: string;
    voiceDictationBtn: string;
    voiceDictationActive: string;
    confirmSubmissionTitle: string;
    confirmSubmissionDesc: string;
    complaintSubmittedTitle: string;
    complaintSubmittedDesc: string;
    trackComplaintBtn: string;
    decisionOutcomeLabel: string;
    financialAdjustmentLabel: string;
    resolvedOnLabel: string;
    officialNotesLabel: string;
    timelineSubmitted: string;
    timelineReview: string;
    timelineVerification: string;
    timelineDecision: string;
    timelineResolved: string;
    statusOpenDesc: string;
    statusReviewDesc: string;
    statusResolvedDesc: string;
    statusClosedDesc: string;
    noComplaintsDesc: string;`;
  content = content.replace(/(noDisputesFound:\s*string;)/, ifaceRepl);
}

// 3. Add to en.disputes
if (!content.includes("reportIssueBtn: 'Report an Issue',")) {
  const enRepl = `$1\r\n      reportIssueBtn: 'Report an Issue',
      tabComplaints: 'Complaints & Issues',
      complaintsSub: 'Track active disputes, inspection reviews, and official resolution settlements.',
      stepSelectProblem: 'Select Problem',
      stepVerifyDetails: 'Verify Trade Details',
      stepAddEvidence: 'Add Details & Evidence',
      stepReviewSubmit: 'Review & Submit',
      autoAttachedNotice: 'Transaction, lot, buyer, transporter, and escrow records were automatically attached.',
      categoryPaymentNotReceived: 'Payment Not Received',
      categoryPaymentIncorrect: 'Payment Amount Incorrect',
      categoryBuyerIssue: 'Buyer Issue / Non-Responsiveness',
      categoryTransportIssue: 'Transport / Vehicle Issue',
      categoryProduceDamaged: 'Produce Damaged in Transit',
      categoryDeliveryIssue: 'Delivery Handover Issue',
      categoryContractIssue: 'Contract Terms Breached',
      evidenceOptional: 'Add Supporting Evidence (Optional)',
      photoOrDocUpload: 'Upload Photo / Weighbridge Slip / Receipt',
      voiceDictationBtn: 'Voice Dictate Details',
      voiceDictationActive: 'Listening... speak clearly',
      confirmSubmissionTitle: 'Confirm Dispute Submission',
      confirmSubmissionDesc: 'An authorized officer will examine digital contract records and attached evidence.',
      complaintSubmittedTitle: 'Grievance Formally Registered',
      complaintSubmittedDesc: 'Your complaint has been logged. An adjudication officer will review the evidence.',
      trackComplaintBtn: 'Track Complaint Status',
      decisionOutcomeLabel: 'Official Decision Outcome',
      financialAdjustmentLabel: 'Financial / Escrow Adjustment',
      resolvedOnLabel: 'Resolution Date',
      officialNotesLabel: 'Reviewer Adjudication Notes',
      timelineSubmitted: 'Submitted',
      timelineReview: 'Under Review',
      timelineVerification: 'Evidence Examined',
      timelineDecision: 'Decision',
      timelineResolved: 'Resolved',
      statusOpenDesc: 'Your grievance has been safely received and queued for review.',
      statusReviewDesc: 'An authorized officer is reviewing transaction records and weighbridge receipts.',
      statusResolvedDesc: 'Adjudication complete with recorded notes and settlement adjustment.',
      statusClosedDesc: 'Case closed with administrative supervisor notes.',
      noComplaintsDesc: 'All transactions are running smoothly. No active grievances filed.',`;
  content = content.replace(/(noDisputesFound:\s*'No active grievances recorded.',)/, enRepl);
}

// 4. Add to mr.disputes
if (!content.includes("reportIssueBtn: 'तक्रार नोंदवा',")) {
  const mrRepl = `$1\r\n      reportIssueBtn: 'तक्रार नोंदवा',
      tabComplaints: 'तक्रारी व वाद निवारण',
      complaintsSub: 'सक्रिय वाद, तपासणी आढावा आणि अधिकृत तोडगा स्थिती ट्रॅक करा.',
      stepSelectProblem: 'समस्या निवडा',
      stepVerifyDetails: 'व्यवहार तपशील तपासा',
      stepAddEvidence: 'तपशील व पुरावे जोडा',
      stepReviewSubmit: 'पुनरावलोकन व सबमिट करा',
      autoAttachedNotice: 'व्यवहार, लॉट, खरेदीदार, वाहतूक आणि एस्क्रो नोंदी आपोआप जोडल्या गेल्या आहेत.',
      categoryPaymentNotReceived: 'पैसे मिळाले नाहीत',
      categoryPaymentIncorrect: 'पेमेंट रक्कम चुकीची आहे',
      categoryBuyerIssue: 'खरेदीदार समस्या / प्रतिसाद नाही',
      categoryTransportIssue: 'वाहतूक / वाहन समस्या',
      categoryProduceDamaged: 'वाहतुकीदरम्यान मालाचे नुकसान',
      categoryDeliveryIssue: 'डिलिव्हरी सुपूर्द समस्या',
      categoryContractIssue: 'कराराच्या अटींचे उल्लंघन',
      evidenceOptional: 'पुरावे जोडा (पर्यायी)',
      photoOrDocUpload: 'फोटो / वजनकाटा पावती अपलोड करा',
      voiceDictationBtn: 'आवाजाने तपशील सांगा',
      voiceDictationActive: 'ऐकत आहे... स्पष्ट बोला',
      confirmSubmissionTitle: 'तक्रार सबमिशन पुष्टी',
      confirmSubmissionDesc: 'अधिकृत अधिकारी डिजिटल करारासह पुरावे तपासतील.',
      complaintSubmittedTitle: 'तक्रार यशस्वीरित्या नोंदवली गेली',
      complaintSubmittedDesc: 'तुमची तक्रार नोंदवली गेली आहे. अधिकारी पुरावे तपासतील.',
      trackComplaintBtn: 'तक्रार स्थिती ट्रॅक करा',
      decisionOutcomeLabel: 'अधिकृत निर्णय',
      financialAdjustmentLabel: 'आर्थिक / एस्क्रो समायोजन',
      resolvedOnLabel: 'निकालाची तारीख',
      officialNotesLabel: 'अधिकाऱ्याच्या अधिकृत नोंदी',
      timelineSubmitted: 'दाखल केली',
      timelineReview: 'पुनरावलोकनात',
      timelineVerification: 'पुरावे तपासले',
      timelineDecision: 'निर्णय',
      timelineResolved: 'निकाली काढली',
      statusOpenDesc: 'तुमची तक्रार प्राप्त झाली असून अधिकारी वाटपाच्या प्रतीक्षेत आहे.',
      statusReviewDesc: 'अधिकारी वजन पावती आणि डिजिटल कराराची तपासणी करत आहेत.',
      statusResolvedDesc: 'अधिकृत नोंदीसह तक्रार निकाली काढण्यात आली आहे.',
      statusClosedDesc: 'प्रशासकीय नोंदीसह प्रकरण बंद केले आहे.',
      noComplaintsDesc: 'सर्व व्यवहार सुरळीत सुरू आहेत. कोणतीही प्रलंबित तक्रार नाही.',`;
  content = content.replace(/(noDisputesFound:\s*'कोणतीही प्रलंबित तक्रार नाही.',)/, mrRepl);
}

// 5. Add to te.disputes
if (!content.includes("reportIssueBtn: 'సమస్యను నివేదించండి',")) {
  const teRepl = `$1\r\n      reportIssueBtn: 'సమస్యను నివేదించండి',
      tabComplaints: 'ఫిర్యాదులు & వివాదాలు',
      complaintsSub: 'క్రియాశీల వివాదాలు, తనిఖీ సమీక్షలు మరియు పరిష్కారాలను ట్రాక్ చేయండి.',
      stepSelectProblem: 'సమస్యను ఎంచుకోండి',
      stepVerifyDetails: 'వాణిజ్య వివరాలను ధృవీకరించండి',
      stepAddEvidence: 'వివరాలు & సాక్ష్యాలను జోడించండి',
      stepReviewSubmit: 'సమీక్షించి సమర్పించండి',
      autoAttachedNotice: 'లావాదేవీ, లాట్, కొనుగోలుదారు, రవాణా మరియు ఎస్క్రో రికార్డులు ఆటోమేటిక్‌గా జతచేయబడ్డాయి.',
      categoryPaymentNotReceived: 'చెల్లింపు అందలేదు',
      categoryPaymentIncorrect: 'చెల్లింపు మొత్తం తప్పుగా ఉంది',
      categoryBuyerIssue: 'కొనుగోలుదారు సమస్య / ప్రతిస్పందన లేకపోవడం',
      categoryTransportIssue: 'రవాణా / వాహన సమస్య',
      categoryProduceDamaged: 'రవాణాలో సరుకు దెబ్బతింది',
      categoryDeliveryIssue: 'డెలివరీ సమస్య',
      categoryContractIssue: 'ఒప్పంద నిబంధనల ఉల్లంఘన',
      evidenceOptional: 'సాక్ష్యాలను జోడించండి (ఐచ్ఛికం)',
      photoOrDocUpload: 'ఫోటో / వేబ్రిడ్జ్ స్లిప్ / రసీదు అప్‌లోడ్ చేయండి',
      voiceDictationBtn: 'వాయిస్ ద్వారా వివరాలు చెప్పండి',
      voiceDictationActive: 'వింటున్నాము... స్పష్టంగా మాట్లాడండి',
      confirmSubmissionTitle: 'ఫిర్యాదు సమర్పణ నిర్ధారణ',
      confirmSubmissionDesc: 'అధికారిక అధికారి డిజిటల్ ఒప్పందంతో పాటు మీ సాక్ష్యాలను పరిశీలిస్తారు.',
      complaintSubmittedTitle: 'ఫిర్యాదు విజయవంతంగా నమోదైంది',
      complaintSubmittedDesc: 'మీ ఫిర్యాదు సమర్పించబడింది. అధికారి సాక్ష్యాలను తనిఖీ చేస్తారు.',
      trackComplaintBtn: 'ఫిర్యాదు స్థితిని ట్రాక్ చేయండి',
      decisionOutcomeLabel: 'పరిష్కార నిర్ణయం',
      financialAdjustmentLabel: 'ఆర్థిక / ఎస్క్రో సర్దుబాటు',
      resolvedOnLabel: 'పరిష్కరించబడిన తేదీ',
      officialNotesLabel: 'అధికారిక సమీక్షకుని గమనికలు',
      timelineSubmitted: 'సమర్పించబడింది',
      timelineReview: 'సమీక్షలో ఉంది',
      timelineVerification: 'సాక్ష్యం ధృవీకరించబడింది',
      timelineDecision: 'నిర్ణయం',
      timelineResolved: 'పరిష్కరించబడింది',
      statusOpenDesc: 'మీ ఫిర్యాదు స్వీకరించబడింది మరియు అధికారి కేటాయింపు కోసం ఉంది.',
      statusReviewDesc: 'అధికారి ప్రస్తుతం లావాదేవీ సాక్ష్యాలను మరియు వేబ్రిడ్జ్ రికార్డులను సమీక్షిస్తున్నారు.',
      statusResolvedDesc: 'అధికారిక గమనికలతో పరిష్కార నిర్ణయం నమోదు చేయబడింది.',
      statusClosedDesc: 'అధికారిక గమనికలతో కేసు ముగిసింది.',
      noComplaintsDesc: 'అన్ని లావాదేవీలు సాధారణంగా సాగుతున్నాయి. ఎటువంటి ఫిర్యాదులు లేవు.',`;
  content = content.replace(/(noDisputesFound:\s*'సక్రియ వివాదాలు ఏవీ లేవు.',)/, teRepl);
}

// 6. Add to hi.disputes
if (!content.includes('"reportIssueBtn": "शिकायत दर्ज करें",')) {
  const hiRepl = `$1\r\n      "reportIssueBtn": "शिकायत दर्ज करें",
      "tabComplaints": "शिकायतें एवं विवाद",
      "complaintsSub": "सक्रिय विवाद, निरीक्षण समीक्षा और आधिकारिक समाधान स्थिति ट्रैक करें।",
      "stepSelectProblem": "समस्या का चयन करें",
      "stepVerifyDetails": "व्यापार विवरण सत्यापित करें",
      "stepAddEvidence": "विवरण एवं साक्ष्य जोड़ें",
      "stepReviewSubmit": "समीक्षा एवं जमा करें",
      "autoAttachedNotice": "सौदा, लॉट, खरीदार, परिवहन और एस्क्रो रिकॉर्ड स्वतः संलग्न कर दिए गए हैं।",
      "categoryPaymentNotReceived": "भुगतान प्राप्त नहीं हुआ",
      "categoryPaymentIncorrect": "भुगतान राशि गलत है",
      "categoryBuyerIssue": "खरीदार संबंधी समस्या",
      "categoryTransportIssue": "परिवहन / वाहन समस्या",
      "categoryProduceDamaged": "परिवहन के दौरान उपज क्षतिग्रस्त",
      "categoryDeliveryIssue": "डिलीवरी / सुपुर्दगी समस्या",
      "categoryContractIssue": "अनुबंध / ऑफर शर्तों की समस्या",
      "evidenceOptional": "साक्ष्य जोड़ें (वैकल्पिक)",
      "photoOrDocUpload": "तस्वीर / धर्मकांटा पर्ची / रसीद अपलोड करें",
      "voiceDictationBtn": "बोलकर विवरण दें",
      "voiceDictationActive": "सुन रहे हैं... बोलिए",
      "confirmSubmissionTitle": "शिकायत जमा करने की पुष्टि",
      "confirmSubmissionDesc": "अधिकृत अधिकारी डिजिटल अनुबंध के साथ आपके साक्ष्यों की जांच करेंगे।",
      "complaintSubmittedTitle": "शिकायत सफलतापूर्वक दर्ज",
      "complaintSubmittedDesc": "आपकी शिकायत दर्ज हो गई है। अधिकारी डिजिटल साक्ष्यों की जांच करेंगे।",
      "trackComplaintBtn": "शिकायत की स्थिति देखें",
      "decisionOutcomeLabel": "अधिकारिक निर्णय",
      "financialAdjustmentLabel": "वित्तीय / एस्क्रो समायोजन",
      "resolvedOnLabel": "समाधान की तारीख",
      "officialNotesLabel": "समीक्षक की आधिकारिक टिप्पणी",
      "timelineSubmitted": "दर्ज",
      "timelineReview": "समीक्षाधीन",
      "timelineVerification": "साक्ष्य सत्यापन",
      "timelineDecision": "निर्णय",
      "timelineResolved": "समाधान संपन्न",
      "statusOpenDesc": "आपकी शिकायत प्राप्त हो गई है और अधिकारी आवंटन की प्रतीक्षा में है।",
      "statusReviewDesc": "अधिकारी धर्मकांटा पर्ची और व्यापार साक्ष्यों की समीक्षा कर रहे हैं।",
      "statusResolvedDesc": "औपचारिक टिप्पणियों के साथ समाधान दर्ज कर दिया गया है।",
      "statusClosedDesc": "प्रशासनिक टिप्पणियों के साथ मामला बंद कर दिया गया है।",
      "noComplaintsDesc": "सभी व्यापारिक सौदे सामान्य रूप से चल रहे हैं। कोई शिकायत दर्ज नहीं है।",`;
  content = content.replace(/("noDisputesFound":\s*"कोई सक्रिय विवाद नहीं है।")/g, hiRepl);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected dispute translation keys into translations.ts!');
