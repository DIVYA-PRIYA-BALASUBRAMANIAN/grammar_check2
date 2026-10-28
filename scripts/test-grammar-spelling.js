// Prototype for strict grammar and spelling correction WITHOUT boilerplate wrappers

function correctGrammarAndSpelling(rawInput) {
  if (!rawInput || !rawInput.trim()) return "";
  let text = rawInput.trim();

  // 1. Shorthand & Abbreviations
  text = text.replace(/\bw\/\s*/gi, 'with ');
  text = text.replace(/\bw\/o\s*/gi, 'without ');
  text = text.replace(/\bcant\b/gi, 'cannot');
  text = text.replace(/\bdont\b/gi, 'does not');
  text = text.replace(/\bpu\s*\/\s*pd\b|\bpupd\b/gi, 'polyuria/polydipsia');
  text = text.replace(/\b(\d+)\s*yo\b/gi, '$1-year-old');
  text = text.replace(/\b(\d+)\s*yr(?:s)?\b/gi, '$1-year-old');
  text = text.replace(/\b(\d+)\s*mo(?:s)?\b/gi, '$1-month-old');
  text = text.replace(/\b(\d+)\s*wk(?:s)?\b/gi, '$1 weeks');
  text = text.replace(/\b(\d+)\s*d(?:ays)?\b/gi, '$1 days');
  text = text.replace(/\b(\d+)\s*d\b/gi, '$1 days');
  text = text.replace(/\b(\d+)\s*hr(?:s)?\b/gi, '$1 hours');
  text = text.replace(/\b(\d+)\s*h\b/gi, '$1 hours');
  text = text.replace(/\b24h\b/gi, '24 hours');
  text = text.replace(/\b48h\b/gi, '48 hours');
  text = text.replace(/\bgsd\b/gi, 'German Shepherd');
  text = text.replace(/\bhx\b/gi, 'history');
  text = text.replace(/\bsx\b/gi, 'symptoms');

  // 2. Spelling Corrections (Common Typos & Medical Terms)
  text = text.replace(/\bvommit(?:ing|ed|s)?\b/gi, (m) => m.toLowerCase().startsWith('vommited') ? 'vomited' : (m.toLowerCase().startsWith('vommiting') ? 'vomiting' : 'vomit'));
  text = text.replace(/\bvomitting\b/gi, 'vomiting');
  text = text.replace(/\bvomitted\b/gi, 'vomited');
  text = text.replace(/\bdiarhea\b|\bdiahrrea\b|\bdiarrheoa\b|\bdiarhoea\b/gi, 'diarrhea');
  text = text.replace(/\bletargic\b|\blethargik\b/gi, 'lethargic');
  text = text.replace(/\bletargy\b/gi, 'lethargy');
  text = text.replace(/\banorexik\b/gi, 'anorexic');
  text = text.replace(/\bdistention\b/gi, 'distension');
  text = text.replace(/\bpruritis\b/gi, 'pruritus');
  text = text.replace(/\btachypnoea\b/gi, 'tachypnea');
  text = text.replace(/\bdyspnoea\b/gi, 'dyspnea');
  text = text.replace(/\bhaematuria\b/gi, 'hematuria');
  text = text.replace(/\bhaematochezia\b/gi, 'hematochezia');
  text = text.replace(/\bhaemorrhagic\b/gi, 'hemorrhagic');
  text = text.replace(/\bseisure(s)?\b/gi, 'seizure$1');
  text = text.replace(/\barythmia\b|\barrhythmea\b/gi, 'arrhythmia');
  text = text.replace(/\btachycardea\b/gi, 'tachycardia');
  text = text.replace(/\bbradycardea\b/gi, 'bradycardia');
  text = text.replace(/\bjaundis\b/gi, 'jaundice');
  text = text.replace(/\biterus\b/gi, 'icterus');
  text = text.replace(/\bvigrously\b/gi, 'vigorously');
  text = text.replace(/\bdehydratd\b/gi, 'dehydrated');
  text = text.replace(/\bswolen\b/gi, 'swollen');
  text = text.replace(/\bun-?productive\b/gi, 'non-productive');

  // 3. Grammatical Corrections (Subject-Verb, Tenses, Prepositions)
  // Fix "not eat" -> "not eating" or "is not eating"
  text = text.replace(/\b(dog|cat|pup|puppy|kitten|rabbit|horse|patient)\s+not\s+eat\b/gi, '$1 is not eating');
  text = text.replace(/\bnot\s+eat\b/gi, 'not eating');
  text = text.replace(/\bstopped\s+eat\b/gi, 'stopped eating');
  text = text.replace(/\bstop\s+eat\b/gi, 'stopped eating');
  text = text.replace(/\brefuse\s+eat\b/gi, 'refusing to eat');
  text = text.replace(/\brefusing\s+eat\b/gi, 'refusing to eat');
  
  // Fix "has vomit" -> "has vomiting"
  text = text.replace(/\bhas\s+vomit\b/gi, 'has vomiting');
  text = text.replace(/\bstart\s+vomiting\b/gi, 'started vomiting');
  text = text.replace(/\bstart\s+limping\b/gi, 'started limping');

  // Fix "crying in pain when touch" -> "crying in pain when touched"
  text = text.replace(/\bwhen\s+touch\b/gi, 'when touched');

  // Fix "watery stool" -> "watery stools"
  text = text.replace(/\bwatery\s+stool\b/gi, 'watery stools');

  // Fix "blood in stool"
  text = text.replace(/\bbloody\s+stool\b/gi, 'bloody stools');

  // Fix "crying hematuria" -> "crying, hematuria"
  text = text.replace(/\s*,\s*/g, ', ');
  text = text.replace(/\s+/g, ' ').trim();

  // 4. Clean Capitalization and Punctuation
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
    if (!/[.!?]$/.test(text)) {
      text += '.';
    }
  }

  // 5. Explicitly strip ANY accidental boilerplate wrapper
  text = text.replace(/^(?:canine|feline|equine|bovine|lagomorph|patient)\s+presenting\s+with\s+/i, '');
  text = text.replace(/^presenting\s+with\s+/i, '');
  text = text.charAt(0).toUpperCase() + text.slice(1);

  return text;
}

const samples = [
  "dog not eat",
  "not eat",
  "pup has vomitting and severe diarhea w/ letargy for 3d",
  "kitten with severe vomitting and bloody diarhea for 2d refusing food",
  "horse kicking belly rolling sweating for 3 hours off feed",
  "beagle intense scratching both ears shaking head red pinna bad odor",
  "cat straining in litter box crying hematuria small drops of urine",
  "5yo gsd acute abdominal distention unproductive retching for 3 hours",
  "rabbit lethargic hunched over stopped eating pellets for 24h"
];

samples.forEach((s, idx) => {
  console.log(`[Test #${idx+1}]`);
  console.log(`  Raw:       "${s}"`);
  console.log(`  Corrected: "${correctGrammarAndSpelling(s)}"`);
});

