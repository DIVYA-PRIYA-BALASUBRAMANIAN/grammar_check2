const { resolveGrammarAndSpelling } = require('../scripts/generalizer-eval-helper.js');

// We re-import the updated clinicalAutoCorrect.js logic
const fs = require('fs');
const path = require('path');
const code = fs.readFileSync(path.join(__dirname, '../client/src/services/clinicalAutoCorrect.js'), 'utf8');

const { DICTIONARY_WORDS } = require('../client/src/data/spellDictionary.js');

// Test suite for veterinary clinical spellings
const vetTests = [
  "dog has despnea and takypnea",
  "cat with strangurea and hematuria",
  "horse violent collic and impaction",
  "puppy with parvoviris and melina",
  "rabbit with stacis and malocclusion",
  "dog scratching ears with preeuritus and otitus",
  "cat bleferospasm and conjunctivitus",
  "pnuemonia and bronchitus",
  "pancreatitus and gastritus",
  "pup has vomitting and diarhea",
  "cat yellow gums with iterus and lipidocis",
  "seisures and ataksia since 2 day"
];

// Load and evaluate in Node
const evalContext = {
  DICTIONARY_WORDS,
  api: { ai: { autoCorrect: async () => null } },
  fetch: global.fetch
};

const stripped = code
  .replace(/import\s+.*?;/g, '')
  .replace(/export\s+const\s+/g, 'const ')
  .replace(/export\s+function\s+/g, 'function ')
  .replace(/export\s+async\s+function\s+/g, 'async function ');

const fn = new Function('DICTIONARY_WORDS', stripped + '; return resolveGrammarAndSpelling;');
const resolver = fn(DICTIONARY_WORDS);

console.log("=== VETERINARY SPELLING CORRECTION VERIFICATION ===\n");
vetTests.forEach((t, i) => {
  console.log(`[#${i+1}] INPUT:  "${t}"`);
  console.log(`     OUTPUT: "${resolver(t)}"\n`);
});

