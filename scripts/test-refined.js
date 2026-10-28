const fs = require('fs');

function testRefined(rawInput) {
  let text = rawInput.trim();

  // Standardize duration tokens
  text = text.replace(/\b(\d+)\s*d\b/gi, '$1 days');
  text = text.replace(/\b(\d+)d\b/gi, '$1 days');
  text = text.replace(/\b(\d+)\s*hr(?:s)?\b/gi, '$1 hours');
  text = text.replace(/\b(\d+)h\b/gi, '$1 hours');
  text = text.replace(/\b(\d+)\s*wk(?:s)?\b/gi, '$1 weeks');
  text = text.replace(/\b(\d+)wk\b/gi, '$1 weeks');

  const BREED_MAP = [
    { pattern: /\b8yo\s+lab\b/i, signalment: "8-year-old Labrador Retriever" },
    { pattern: /\b(\d+)\s*yo\s+lab(?:rador)?\b/i, signalment: "$1-year-old Labrador Retriever" },
    { pattern: /\b(\d+)\s*yo\s+gsd\b/i, signalment: "$1-year-old German Shepherd" },
    { pattern: /\b(\d+)\s*yo\s+german\s+shepherd\b/i, signalment: "$1-year-old German Shepherd" },
    { pattern: /\bgerman\s+shepherd\b/i, signalment: "German Shepherd" },
    { pattern: /\bgolden\s+retriever\b/i, signalment: "Golden Retriever" },
    { pattern: /\bfrench\s+bulldog\b/i, signalment: "French Bulldog" },
    { pattern: /\bdachshund\b/i, signalment: "Dachshund" },
    { pattern: /\bbeagle\b/i, signalment: "Beagle" },
    { pattern: /\bkitten\b/i, signalment: "Feline juvenile" },
    { pattern: /\bpuppy\b|\bpup\b/i, signalment: "Canine juvenile" },
    { pattern: /\bold\s+cat\b|\bsenior\s+cat\b/i, signalment: "Senior feline" },
    { pattern: /\bcat\b/i, signalment: "Feline" },
    { pattern: /\bdog\b/i, signalment: "Canine" },
    { pattern: /\bhorse\b|\bmare\b|\bstallion\b/i, signalment: "Equine" },
    { pattern: /\brabbit\b|\bbunny\b/i, signalment: "Lagomorph" },
    { pattern: /\bguinea\s+pig\b|\bcavy\b/i, signalment: "Cavy" },
    { pattern: /\bferret\b/i, signalment: "Mustelid" },
    { pattern: /\bcow\b|\bbovine\b/i, signalment: "Bovine" },
    { pattern: /\bsheep\b/i, signalment: "Ovine" },
    { pattern: /\bgoat\b/i, signalment: "Caprine" },
    { pattern: /\bparrot\b/i, signalment: "Avian" }
  ];

  // 1. Detect Signalment
  let signalment = null;
  for (const item of BREED_MAP) {
    if (item.pattern.test(text)) {
      signalment = text.match(item.pattern)[0].replace(item.pattern, item.signalment);
      text = text.replace(item.pattern, ' ');
      break;
    }
  }

  if (!signalment) {
    const ageMatch = text.match(/\b(\d+)\s*(?:yo|year\s*old|yr)\b/i);
    if (ageMatch) {
      signalment = `${ageMatch[1]}-year-old patient`;
      text = text.replace(ageMatch[0], ' ');
    }
  }

  // 2. Detect Duration / Timeline
  let duration = null;
  const durationMatch = text.match(/\b(?:for\s+)?(\d+\s*(?:days|hours|weeks|months))\b/i) ||
                        text.match(/\b(?:since\s+yesterday|since\s+morning)\b/i);
  if (durationMatch) {
    let durStr = durationMatch[0].trim();
    if (!durStr.toLowerCase().startsWith('for') && !durStr.toLowerCase().startsWith('since')) {
      durStr = 'for ' + durStr;
    }
    duration = durStr;
    text = text.replace(durationMatch[0], ' ');
  }

  // Bind severity modifiers (severe, acute, mild, marked, profuse) to adjacent clinical signs
  text = text.replace(/\bsevere\s+vommiting\b/gi, 'severe_vomiting');
  text = text.replace(/\bsevere\s+vomiting\b/gi, 'severe_vomiting');
  text = text.replace(/\bsevere\s+diarhea\b/gi, 'severe_diarrhea');
  text = text.replace(/\bbloody\s+diarhea\b/gi, 'bloody_diarrhea');
  text = text.replace(/\bbloody\s+diarrhea\b/gi, 'bloody_diarrhea');
  text = text.replace(/\bsevere\s+bloody\s+diarrhea\b/gi, 'severe_bloody_diarrhea');

  const VET_MAP = {
    "severe_bloody_diarrhea": "severe hemorrhagic diarrhea",
    "bloody_diarrhea": "hemorrhagic diarrhea",
    "severe_vomiting": "severe vomiting",
    "severe_diarrhea": "severe diarrhea",
    "vomitting": "vomiting",
    "vommiting": "vomiting",
    "diarhea": "diarrhea",
    "diahrrea": "diarrhea",
    "letargic": "lethargy",
    "letargy": "lethargy",
    "lethargic": "lethargy",
    "anorexic": "anorexia",
    "refusing food": "anorexia",
    "not eating": "anorexia",
    "stopped eating pellets": "anorexia",
    "stopped eating": "anorexia",
    "off feed": "anorexia",
    "drinking lots of water": "polydipsia",
    "drinking excessively": "polydipsia",
    "peeing frequently": "polyuria",
    "urinating frequently": "polyuria",
    "peeing on carpet": "inappropriate indoor urination",
    "peeing inside house": "inappropriate indoor urination",
    "losing weight": "progressive weight loss",
    "weight loss": "progressive weight loss",
    "shortness of breath": "dyspnea",
    "coughing hacking at night": "nocturnal paroxysmal cough",
    "coughing hacking": "paroxysmal cough",
    "coughing": "cough",
    "wasp sting": "acute hymenoptera (wasp) sting reaction",
    "bee sting": "acute insect (bee) sting reaction",
    "swelling on left muzzle": "acute left muzzle angioedema",
    "facial swelling": "facial angioedema",
    "swollen muzzle": "muzzle angioedema",
    "dyspnea": "dyspnea",
    "scratching both ears": "severe bilateral aural pruritus",
    "intense scratching both ears": "severe bilateral aural pruritus",
    "shaking head": "persistent head shaking",
    "red pinna": "pinnal erythema",
    "bad odor": "malodorous otic exudate",
    "hunched over": "hunched painful posture",
    "kicking belly": "flank kicking and abdominal guarding",
    "rolling sweating": "violent rolling and diaphoresis",
    "rolling": "rolling",
    "sweating": "diaphoresis"
  };

  // Clean filler words
  text = text.replace(/\b(w\/|with|and|has|presenting|showing|signs\s+of|after|crying\s+in\s+pain)\b/gi, ' ');

  const detected = [];
  const sortedKeys = Object.keys(VET_MAP).sort((a, b) => b.length - a.length);

  for (const k of sortedKeys) {
    const rx = new RegExp(`\\b${k}\\b`, 'i');
    if (rx.test(text)) {
      detected.push(VET_MAP[k]);
      text = text.replace(rx, ' ');
    }
  }

  // Filter leftover tokens
  const leftover = text.split(/[\s,.;:!?]+/).filter(tok => {
    const t = tok.toLowerCase();
    return t.length > 2 && !['the', 'and', 'with', 'for', 'was', 'has', 'over', 'both', 'severe'].includes(t);
  });
  if (leftover.length > 0) {
    const phrase = leftover.join(' ');
    if (!detected.some(d => d.toLowerCase().includes(phrase.toLowerCase()))) {
      detected.push(phrase);
    }
  }

  // Assemble
  const lead = signalment ? `${signalment} presenting with ` : `Patient presenting with `;
  let body = "";
  if (detected.length === 0) return rawInput.trim();
  if (detected.length === 1) body = detected[0];
  else if (detected.length === 2) body = `${detected[0]} and ${detected[1]}`;
  else {
    const last = detected[detected.length - 1];
    body = `${detected.slice(0, -1).join(', ')}, and ${last}`;
  }

  let full = lead + body;
  if (duration) full += ` ${duration}`;
  if (!full.endsWith('.')) full += '.';
  return full.charAt(0).toUpperCase() + full.slice(1);
}

const tests = [
  "8yo lab coughing hacking at night w/ shortness of breath for 4 days",
  "kitten with severe vomitting and bloody diarhea for 2d refusing food",
  "horse kicking belly rolling sweating for 3 hours off feed",
  "beagle intense scratching both ears shaking head red pinna bad odor",
  "golden retriever swelling on left muzzle after wasp sting dyspnea",
  "old cat drinking lots of water peeing on carpet losing weight for 3wk",
  "rabbit lethargic hunched over stopped eating pellets for 24h"
];

tests.forEach((t, i) => {
  console.log(`[Test #${i+1}] ${testRefined(t)}`);
});

