const fs = require('fs');
const { DICTIONARY_WORDS } = require('../client/src/data/spellDictionary.js');

class SymSpellEngine {
  constructor(maxDistance = 2) {
    this.maxDistance = maxDistance;
    this.dictionary = new Set();
    this.deletions = new Map();
  }

  getDeletes(word, distance) {
    const deletes = new Set();
    const queue = [[word, 0]];
    const seen = new Set([word]);

    while (queue.length > 0) {
      const [current, d] = queue.shift();
      if (d < distance) {
        for (let i = 0; i < current.length; i++) {
          const del = current.slice(0, i) + current.slice(i + 1);
          if (del.length > 1 && !seen.has(del)) {
            seen.add(del);
            deletes.add(del);
            queue.push([del, d + 1]);
          }
        }
      }
    }
    return deletes;
  }

  addWord(word) {
    const w = word.toLowerCase().trim();
    if (!w || this.dictionary.has(w)) return;
    this.dictionary.add(w);

    const dels = this.getDeletes(w, this.maxDistance);
    for (const d of dels) {
      if (!this.deletions.has(d)) {
        this.deletions.set(d, new Set());
      }
      this.deletions.get(d).add(w);
    }
  }

  loadWords(words) {
    words.forEach(w => this.addWord(w));
  }

  levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  }

  correct(word) {
    const raw = word.toLowerCase().trim();
    if (raw.length <= 2) return word;
    if (this.dictionary.has(raw)) return word;

    const candidates = new Map();
    const inputDels = this.getDeletes(raw, this.maxDistance);
    inputDels.add(raw);

    for (const d of inputDels) {
      if (this.dictionary.has(d)) {
        const dist = this.levenshtein(raw, d);
        if (dist <= this.maxDistance) candidates.set(d, dist);
      }
      if (this.deletions.has(d)) {
        for (const dictWord of this.deletions.get(d)) {
          const dist = this.levenshtein(raw, dictWord);
          if (dist <= this.maxDistance) {
            if (!candidates.has(dictWord) || dist < candidates.get(dictWord)) {
              candidates.set(dictWord, dist);
            }
          }
        }
      }
    }

    if (candidates.size === 0) return word;

    let best = word;
    let minD = 999;
    let minLenDiff = 999;

    for (const [cand, dist] of candidates.entries()) {
      const lenDiff = Math.abs(cand.length - raw.length);
      if (dist < minD || (dist === minD && lenDiff < minLenDiff)) {
        minD = dist;
        minLenDiff = lenDiff;
        best = cand;
      }
    }

    return best;
  }
}

const symSpell = new SymSpellEngine(2);
symSpell.loadWords(DICTIONARY_WORDS);

function resolveGrammarAndSpelling(rawInput) {
  if (!rawInput || !rawInput.trim()) return "";
  let text = rawInput.trim();

  // 1. Shorthand & Abbreviations
  text = text.replace(/\bw\/\s*/gi, 'with ');
  text = text.replace(/\bw\/o\s*/gi, 'without ');
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
  text = text.replace(/\balot\b/gi, 'a lot');
  text = text.replace(/\bun-?productive\b/gi, 'non-productive');

  // Contractions / Modals
  text = text.replace(/\bcant\b/gi, 'cannot');
  text = text.replace(/\bdont\b/gi, 'does not');
  text = text.replace(/\bwont\b/gi, 'will not');
  text = text.replace(/\bcouldnt\b/gi, 'could not');
  text = text.replace(/\bdidnt\b/gi, 'did not');
  text = text.replace(/\barent\b/gi, 'are not');
  text = text.replace(/\bisnt\b/gi, 'is not');
  text = text.replace(/\bwasnt\b/gi, 'was not');

  // 2. High-Frequency Medical & Typo Rules
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
  text = text.replace(/\bjaundis\b/gi, 'jaundice');
  text = text.replace(/\biterus\b/gi, 'icterus');

  // 3. Grammar Rules: Subject-Verb Agreement & Forms
  const subjects = '(?:he|she|it|dog|cat|pup|puppy|kitten|rabbit|horse|animal|pet|patient)';

  // "dog have" -> "dog has"
  text = text.replace(new RegExp(`\\b(${subjects})\\s+have\\b`, 'gi'), '$1 has');
  // "dogs has" -> "dogs have"
  text = text.replace(/\b(they|dogs|cats|pups|kittens)\s+has\b/gi, '$1 have');

  // "dog breath" -> "dog breathes"
  text = text.replace(new RegExp(`\\b(${subjects})\\s+breath\\b`, 'gi'), '$1 breathes');
  // "dog cough" -> "dog coughs"
  text = text.replace(new RegExp(`\\b(${subjects})\\s+cough\\b`, 'gi'), '$1 coughs');
  // "dog sneeze" -> "dog sneezes"
  text = text.replace(new RegExp(`\\b(${subjects})\\s+sneeze\\b`, 'gi'), '$1 sneezes');
  // "dog keep" -> "dog keeps"
  text = text.replace(new RegExp(`\\b(${subjects})\\s+keep\\b`, 'gi'), '$1 keeps');
  // "dog look" -> "dog looks"
  text = text.replace(new RegExp(`\\b(${subjects})\\s+look\\b`, 'gi'), '$1 looks');
  // "dog seem" -> "dog seems"
  text = text.replace(new RegExp(`\\b(${subjects})\\s+seem\\b`, 'gi'), '$1 seems');
  // "dog refuse" -> "dog refuses"
  text = text.replace(new RegExp(`\\b(${subjects})\\s+refuse\\b`, 'gi'), '$1 refuses');
  // "dog shake" -> "dog shakes"
  text = text.replace(new RegExp(`\\b(${subjects})\\s+shake\\b`, 'gi'), '$1 shakes');
  // "dog scratch" -> "dog scratches"
  text = text.replace(new RegExp(`\\b(${subjects})\\s+scratch\\b`, 'gi'), '$1 scratches');
  // "dog limp" -> "dog limps"
  text = text.replace(new RegExp(`\\b(${subjects})\\s+limp\\b`, 'gi'), '$1 limps');

  // Continuous Aspect
  text = text.replace(new RegExp(`\\b(${subjects})\\s+not\\s+eat\\b`, 'gi'), '$1 is not eating');
  text = text.replace(/\bnot\s+eat\b/gi, 'not eating');
  text = text.replace(/\bnot\s+drink\b/gi, 'not drinking');
  text = text.replace(/\bnot\s+pee\b/gi, 'not peeing');
  text = text.replace(/\bnot\s+poop\b/gi, 'not pooping');
  text = text.replace(/\bnot\s+walk\b/gi, 'not walking');
  text = text.replace(/\bno\s+eat\b/gi, 'not eating');
  text = text.replace(/\bno\s+pee\b/gi, 'not peeing');
  text = text.replace(/\bno\s+poop\b/gi, 'not pooping');

  text = text.replace(/\bstop(ped)?\s+eat(ing)?\b/gi, 'stopped eating');
  text = text.replace(/\bstop(ped)?\s+drink(ing)?\b/gi, 'stopped drinking');
  text = text.replace(/\brefuse(d)?\s+eat\b/gi, 'refusing to eat');
  text = text.replace(/\brefusing\s+eat\b/gi, 'refusing to eat');
  text = text.replace(/\bstart(ed)?\s+vomit(ing)?\b/gi, 'started vomiting');
  text = text.replace(/\bstart(ed)?\s+cough(ing)?\b/gi, 'started coughing');
  text = text.replace(/\bstart(ed)?\s+limp(ing)?\b/gi, 'started limping');
  text = text.replace(/\bstart(ed)?\s+choke\b/gi, 'started choking');
  text = text.replace(/\bstart(ed)?\s+shake\b/gi, 'started shaking');
  text = text.replace(/\bkeep\s+scratch(ing)?\b/gi, 'keeps scratching');
  text = text.replace(/\bkeep\s+vomit(ing)?\b/gi, 'keeps vomiting');
  text = text.replace(/\bkeep\s+cough(ing)?\b/gi, 'keeps coughing');

  // Participles & Passives
  text = text.replace(/\bwas\s+bite\b/gi, 'was bitten');
  text = text.replace(/\bwas\s+eat\b/gi, 'was eaten');
  text = text.replace(/\bwas\s+give\b/gi, 'was given');
  text = text.replace(/\bwas\s+hit\b/gi, 'was hit');
  text = text.replace(/\bwas\s+sting\b/gi, 'was stung');
  text = text.replace(/\bwhen\s+touch\b/gi, 'when touched');

  // Prepositions & Idioms
  text = text.replace(/\bwatery\s+stool\b/gi, 'watery stools');
  text = text.replace(/\bbloody\s+stool\b/gi, 'bloody stools');
  text = text.replace(/\bblood\s+on\s+urine\b/gi, 'blood in urine');
  text = text.replace(/\bblood\s+on\s+stool\b/gi, 'blood in stool');
  text = text.replace(/\bpain\s+on\s+abdomen\b/gi, 'pain in abdomen');
  text = text.replace(/\bpain\s+on\s+belly\b/gi, 'pain in belly');
  text = text.replace(/\bpain\s+on\s+leg\b/gi, 'pain in leg');
  text = text.replace(/\bpain\s+on\s+neck\b/gi, 'pain in neck');
  text = text.replace(/\bit's\s+(head|ear|ears|eye|eyes|tail|leg|paw|body)\b/gi, 'its $1');

  // Plurals and Timeframes
  text = text.replace(/\bsince\s+(\d+)\s+days?\b/gi, 'for $1 days');
  text = text.replace(/\b([2-9]|\d{2,})\s+day\b/gi, '$1 days');
  text = text.replace(/\b([2-9]|\d{2,})\s+week\b/gi, '$1 weeks');
  text = text.replace(/\b([2-9]|\d{2,})\s+month\b/gi, '$1 months');
  text = text.replace(/\b([2-9]|\d{2,})\s+hour\b/gi, '$1 hours');

  // 4. SymSpell Token Correction
  const tokens = text.split(/(\s+|[,.;:!?()]+)/);
  const correctedTokens = tokens.map(tok => {
    if (/^[a-zA-Z]+$/.test(tok) && tok.length > 2) {
      const lower = tok.toLowerCase();
      if (['gsd', 'dsh', 'dlh', 'ivdd', 'gdv', 'ccl', 'flutd'].includes(lower)) return tok;
      const corrected = symSpell.correct(lower);
      if (tok[0] === tok[0].toUpperCase() && tok.slice(1) === tok.slice(1).toLowerCase()) {
        return corrected.charAt(0).toUpperCase() + corrected.slice(1);
      }
      return corrected;
    }
    return tok;
  });
  text = correctedTokens.join('');

  // 5. Final Polish
  text = text.replace(/\s*,\s*/g, ', ');
  text = text.replace(/\s+/g, ' ').trim();
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
    if (!/[.!?]$/.test(text)) {
      text += '.';
    }
  }

  // 6. Strict Guardrail: Remove ANY accidental boilerplate wrapper
  text = text.replace(/^(?:canine|feline|equine|bovine|lagomorph|patient)\s+presenting\s+(?:with\s+)?/i, '');
  text = text.replace(/^presenting\s+(?:with\s+)?/i, '');
  text = text.charAt(0).toUpperCase() + text.slice(1);

  return text;
}

const tests = [
  "dog is vomitting and have diarhea",
  "cat dont drink watter",
  "puppy is shaking it's haed and look letargic",
  "the dog breath fast and cough",
  "cat have red eys and sneeze alot",
  "he was bite by dog",
  "limping since 3 day",
  "dog ate a bone and start choke",
  "dog keep scratching ear",
  "rabbit stoped eatting and no poop for 24h",
  "swolen pinna with bad odor and pain on ear",
  "pup has vomitting and sevear diarhea w/ letargy for 3d",
  "not eat",
  "dog not eat"
];

console.log("=== FINAL ENGINE VERIFICATION ===");
tests.forEach((t, i) => {
  console.log(`[#${i+1}] IN:  "${t}"`);
  console.log(`     OUT: "${resolveGrammarAndSpelling(t)}"\n`);
});

