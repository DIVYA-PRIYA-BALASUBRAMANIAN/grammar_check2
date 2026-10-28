// SymSpell implementation in JavaScript
const fs = require('fs');

class SymSpellChecker {
  constructor(maxDistance = 2) {
    this.maxDistance = maxDistance;
    this.dictionary = new Set();
    this.deletions = new Map(); // deletion -> Set of dictionary words
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

    const candidates = new Map(); // word -> distance

    // Check direct deletions of input
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

    // Pick best candidate with lowest distance and closest length
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

// Test SymSpell
const sym = new SymSpellChecker(2);
const dictWords = [
  "dog", "cat", "puppy", "kitten", "horse", "rabbit",
  "vomiting", "diarrhea", "lethargic", "lethargy", "anorexic", "anorexia",
  "stopped", "eating", "drinking", "running", "swollen", "painful",
  "appetite", "stomach", "abdomen", "head", "eyes", "teeth", "coughing",
  "scratching", "salivating", "water", "yesterday", "morning", "infection",
  "medicine", "pruritus", "distension", "hematuria", "tachypnea", "feverish",
  "shaking", "bleeding", "urine", "stool", "stools", "severe", "yellow", "mucus"
];
sym.loadWords(dictWords);

const typos = [
  "vommiting", "diarhea", "letargic", "stoped", "eatting", "dranking",
  "runing", "swolen", "painfull", "appetit", "stomac", "abdonem",
  "haed", "eys", "teath", "salavating", "watter", "yestarday",
  "pruritis", "distention"
];

console.log("=== SYMSPELL ACCURACY EVALUATION ===");
typos.forEach(t => {
  console.log(`${t.padEnd(12)} -> ${sym.correct(t)}`);
});

