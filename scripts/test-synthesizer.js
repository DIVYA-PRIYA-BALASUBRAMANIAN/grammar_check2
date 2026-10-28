/**
 * Advanced Clinical Slot-Filling and Normalization Engine
 */

const VET_NORMALIZATIONS = {
  // Shorthand & typos
  "vomitting": "vomiting",
  "vommiting": "vomiting",
  "diarhea": "diarrhea",
  "diahrrea": "diarrhea",
  "diarrheoa": "diarrhea",
  "bloody diarrhea": "hemorrhagic diarrhea",
  "bloody diarhea": "hemorrhagic diarrhea",
  "watery stools": "watery diarrhea",
  "letargic": "lethargy",
  "lethargik": "lethargy",
  "letargy": "lethargy",
  "lethargic": "lethargy",
  "anorexic": "anorexia",
  "anorexik": "anorexia",
  "refusing food": "anorexia",
  "not eating": "anorexia",
  "stopped eating": "anorexia",
  "off feed": "anorexia",
  "refusing hard food": "anorexia / reluctance to masticate dry food",
  "stopped eating pellets": "anorexia",
  "drinking lots of water": "polydipsia",
  "drinking excessively": "polydipsia",
  "peeing frequently": "polyuria",
  "urinating frequently": "polyuria",
  "peeing inside house": "inappropriate indoor urination",
  "peeing on carpet": "inappropriate indoor urination",
  "losing weight": "progressive weight loss",
  "weight loss": "weight loss",
  "shortness of breath": "dyspnea",
  "difficulty breathing": "dyspnea",
  "rapid breathing": "tachypnea",
  "coughing hacking at night": "nocturnal paroxysmal cough",
  "dry hacking cough": "dry hacking cough",
  "coughing gagging": "paroxysmal cough and retching",
  "coughing hacking": "paroxysmal cough",
  "coughing": "cough",
  "open mouth breathing": "open-mouth tachypnea",
  "open mouth panting": "open-mouth tachypnea",
  "blue tongue": "cyanosis of mucous membranes",
  "cyanotic tongue": "cyanosis of mucous membranes",
  "pale gums": "pale mucous membranes",
  "yellow gums": "icterus of mucous membranes",
  "yellow eyes": "scleral icterus",
  "yellow eyes and gums": "scleral and mucosal icterus",
  "swelling on left muzzle": "acute left muzzle angioedema",
  "facial swelling": "facial angioedema",
  "swollen muzzle": "muzzle angioedema",
  "hives": "urticaria",
  "wasp sting": "hymenoptera / wasp sting",
  "bee sting": "insect / bee sting",
  "scratching both ears": "bilateral aural pruritus",
  "scratching ears": "aural pruritus",
  "intense scratching both ears": "severe bilateral aural pruritus",
  "shaking head": "persistent head shaking",
  "red pinna": "pinnal erythema",
  "red swollen pinna": "pinnal erythema and edema",
  "bad odor": "malodorous otic exudate",
  "foul odor": "malodorous discharge",
  "foul smell": "malodorous discharge",
  "hair loss": "alopecia",
  "losing hair on flanks": "bilateral flank alopecia",
  "dragging rear legs": "bilateral hindlimb paresis",
  "dragging right hind leg": "right hindlimb paresis / dragging",
  "limping right forelimb": "right forelimb lameness",
  "limping left forelimb": "left forelimb lameness",
  "limping right hind": "right hindlimb lameness",
  "limping left hind": "left hindlimb lameness",
  "non weight bearing": "non-weight-bearing",
  "kicking belly": "flank kicking and abdominal guarding",
  "kicking at abdomen": "flank kicking and abdominal guarding",
  "rolling sweating": "violent rolling and diaphoresis",
  "rolling violently": "violent rolling",
  "pawing ground": "persistent ground pawing",
  "tense abdomen": "abdominal tension and guarding",
  "abdominal distention": "abdominal distension",
  "abdominal distension": "abdominal distension",
  "unproductive retching": "non-productive retching",
  "non productive retching": "non-productive retching",
  "hunched over": "hunched painful posture",
  "hunched posture": "hunched posture",
  "straining in litter box": "stranguria with repeated unproductive litter box posturing",
  "crying in litter box": "dysuria and vocalization in litter box",
  "cant pee": "stranguria / acute urinary obstruction",
  "small drops of urine": "stranguria with minimal urine production",
  "cloudy cornea": "corneal edema / cloudiness",
  "greenish discharge": "mucopurulent discharge",
  "eyes glued shut": "blepharospasm with eyelid adherence",
  "squinting": "blepharospasm",
  "bad breath": "severe halitosis",
  "red inflamed gums": "gingivitis / stomatitis",
  "bleeding from nose": "unilateral epistaxis",
  "bleeding from gums": "gingival hemorrhage",
  "cold paw pads": "hypothermic extremities",
  "absent pulses": "absent peripheral pulses",
  "weak pulses": "weak peripheral femoral pulses",
  "heat exhaustion": "hyperthermic heat distress"
};

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

function synthesizeClinicalComplaint(rawInput) {
  let text = rawInput.trim();

  // 1. Detect Signalment
  let signalment = null;
  for (const item of BREED_MAP) {
    if (item.pattern.test(text)) {
      signalment = text.match(item.pattern)[0].replace(item.pattern, item.signalment);
      text = text.replace(item.pattern, ' ');
      break;
    }
  }

  // Fallback for general age like "5yo" or "5 year old" if no breed matched
  if (!signalment) {
    const ageMatch = text.match(/\b(\d+)\s*(?:yo|year\s*old|yr)\b/i);
    if (ageMatch) {
      signalment = `${ageMatch[1]}-year-old patient`;
      text = text.replace(ageMatch[0], ' ');
    }
  }

  // 2. Detect Duration / Timeline
  let duration = null;
  const durationMatch = text.match(/\b(?:for\s+)?(\d+)\s*(?:d|days|day)\b/i) ||
                        text.match(/\b(?:for\s+)?(\d+)\s*(?:h|hr|hrs|hours)\b/i) ||
                        text.match(/\b(?:for\s+)?(\d+)\s*(?:wk|wks|weeks)\b/i) ||
                        text.match(/\b(?:for\s+)?(\d+)\s*(?:mo|mos|months)\b/i) ||
                        text.match(/\b(?:since\s+yesterday|since\s+morning)\b/i);
  if (durationMatch) {
    let durStr = durationMatch[0].trim();
    if (/^\d+\s*d$/i.test(durStr)) durStr = durStr.replace(/d/i, ' days');
    if (/^\d+d$/i.test(durStr)) durStr = durStr.replace(/d/i, ' days');
    if (/^24h$/i.test(durStr)) durStr = '24 hours';
    if (/^48h$/i.test(durStr)) durStr = '48 hours';
    if (/^\d+\s*wk$/i.test(durStr)) durStr = durStr.replace(/wk/i, ' weeks');
    if (/^\d+wk$/i.test(durStr)) durStr = durStr.replace(/wk/i, ' weeks');
    if (!durStr.toLowerCase().startsWith('for') && !durStr.toLowerCase().startsWith('since')) {
      durStr = 'for ' + durStr;
    }
    duration = durStr;
    text = text.replace(durationMatch[0], ' ');
  }

  // Clean conversational filler words
  text = text.replace(/\b(w\/|with|and|has|presenting|showing|signs\s+of|after|crying\s+in\s+pain)\b/gi, ' ');

  // 3. Match Normalized Clinical Concepts (longest matching keys first)
  const sortedKeys = Object.keys(VET_NORMALIZATIONS).sort((a, b) => b.length - a.length);
  const detectedFindings = [];

  for (const key of sortedKeys) {
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(text)) {
      detectedFindings.push(VET_NORMALIZATIONS[key]);
      text = text.replace(regex, ' ');
    }
  }

  // Any remaining substantive words in text (e.g. specific anatomy, foreign object, etc.)
  const remainingTokens = text.split(/[\s,.;:!?]+/).filter(tok => {
    const t = tok.toLowerCase();
    return t.length > 2 && !['the', 'and', 'with', 'for', 'was', 'has', 'over', 'both'].includes(t);
  });

  // Combine detected findings and remaining substantive words
  const allFindings = [...detectedFindings];
  if (remainingTokens.length > 0) {
    // Check if remaining tokens can be appended or preserved
    const extraPhrase = remainingTokens.join(' ');
    if (extraPhrase.trim().length > 0 && !allFindings.some(f => f.toLowerCase().includes(extraPhrase.toLowerCase()))) {
      allFindings.push(extraPhrase);
    }
  }

  // Deduplicate findings
  const uniqueFindings = [];
  allFindings.forEach(f => {
    if (!uniqueFindings.some(u => u.toLowerCase() === f.toLowerCase())) {
      uniqueFindings.push(f);
    }
  });

  // 4. Assemble Clinical English Output
  let output = "";
  if (signalment) {
    output += `${signalment} presenting with `;
  } else {
    output += `Patient presenting with `;
  }

  if (uniqueFindings.length === 0) {
    return rawInput.trim();
  }

  if (uniqueFindings.length === 1) {
    output += uniqueFindings[0];
  } else if (uniqueFindings.length === 2) {
    output += `${uniqueFindings[0]} and ${uniqueFindings[1]}`;
  } else {
    const last = uniqueFindings[uniqueFindings.length - 1];
    const initial = uniqueFindings.slice(0, -1).join(', ');
    output += `${initial}, and ${last}`;
  }

  if (duration) {
    output += ` ${duration}`;
  }

  output = output.trim();
  if (!output.endsWith('.')) output += '.';

  // Ensure first character is uppercase
  output = output.charAt(0).toUpperCase() + output.slice(1);
  return output;
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
  console.log(`[Test #${i+1}]`);
  console.log(`  Raw:        "${t}"`);
  console.log(`  Synthesized:"${synthesizeClinicalComplaint(t)}"`);
});

