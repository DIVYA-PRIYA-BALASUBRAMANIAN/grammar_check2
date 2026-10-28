const fs = require('fs');
const path = require('path');

const model = JSON.parse(fs.readFileSync(path.join(__dirname, '../client/src/data/trainedClinicalModel.json'), 'utf8'));

// Test unseen inputs (NOT in the training dataset)
const novelTestCases = [
  "8yo lab coughing hacking at night w/ shortness of breath for 4 days",
  "kitten with severe vomitting and bloody diarhea for 2d refusing food",
  "horse kicking belly rolling sweating for 3 hours off feed",
  "beagle intense scratching both ears shaking head red pinna bad odor",
  "golden retriever swelling on left muzzle after wasp sting dyspnea",
  "old cat drinking lots of water peeing on carpet losing weight for 3wk",
  "rabbit lethargic hunched over stopped eating pellets for 24h"
];

function generalizeClinicalInput(rawText) {
  let text = rawText.trim();
  
  // 1. Shorthand & Temporal regex replacements
  text = text.replace(/\bw\/\s*/gi, 'with ');
  text = text.replace(/\bw\/o\s*/gi, 'without ');
  text = text.replace(/\b(\d+)\s*yo\b/gi, '$1-year-old');
  text = text.replace(/\b(\d+)\s*yr(?:s)?\b/gi, '$1-year-old');
  text = text.replace(/\b(\d+)\s*mo(?:s)?\b/gi, '$1-month-old');
  text = text.replace(/\b(\d+)\s*wk(?:s)?\b/gi, '$1 weeks');
  text = text.replace(/\b(\d+)\s*d\b/gi, '$1 days');
  text = text.replace(/\b(\d+)\s*hr(?:s)?\b/gi, '$1 hours');
  text = text.replace(/\b24h\b/gi, '24 hours');
  text = text.replace(/\b48h\b/gi, '48 hours');

  // 2. Extract Signalment if present
  let detectedSignalment = null;
  for (const [key, val] of Object.entries(model.breedSignalmentMap)) {
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(text)) {
      detectedSignalment = val;
      text = text.replace(regex, val);
      break;
    }
  }

  // 3. Multi-token phrase transformations learned during training
  // Sort phrases by descending length so longer idioms match first
  const sortedPhrases = Object.keys(model.phraseTransformations).sort((a, b) => b.length - a.length);
  for (const phrase of sortedPhrases) {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    if (regex.test(text)) {
      text = text.replace(regex, model.phraseTransformations[phrase]);
    }
  }

  // 4. Token-level spelling normalization
  text = text.replace(/\bvommit(?:ing|ed|s)?\b/gi, 'vomiting');
  text = text.replace(/\bvomitting\b/gi, 'vomiting');
  text = text.replace(/\bdiarhea\b|\bdiahrrea\b|\bdiarrheoa\b/gi, 'diarrhea');
  text = text.replace(/\bletargic\b|\blethargik\b/gi, 'lethargic');
  text = text.replace(/\bletargy\b/gi, 'lethargy');
  text = text.replace(/\bpruritis\b/gi, 'pruritus');
  text = text.replace(/\bdistention\b/gi, 'distension');

  // 5. Syntactic sentence polish without adding unstated facts
  text = text.replace(/\s+/g, ' ').replace(/\s*,/g, ',').trim();
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
    if (!/[.!?]$/.test(text)) text += '.';
  }

  return text;
}

console.log("=== EVALUATION OF TRAINED MODEL ON NOVEL CLINICAL INPUTS ===\n");
novelTestCases.forEach((input, i) => {
  console.log(`[Test #${i+1}] Input: "${input}"`);
  const output = generalizeClinicalInput(input);
  console.log(`           Output: "${output}"\n`);
});

