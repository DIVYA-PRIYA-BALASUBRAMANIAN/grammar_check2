// Script to compile an extensive English + Veterinary dictionary
const fs = require('fs');
const path = require('path');

// Extensive vocabulary
const words = new Set([
  // Core Animals, Breeds & Signalments
  "dog", "dogs", "cat", "cats", "puppy", "puppies", "pup", "pups", "kitten", "kittens",
  "rabbit", "rabbits", "bunny", "bunnies", "horse", "horses", "mare", "stallion", "gelding", "foal", "colt", "filly",
  "cow", "cows", "bovine", "calf", "calves", "bull", "bulls", "heifer", "steer",
  "sheep", "lamb", "lambs", "ewe", "ram", "goat", "goats", "kid", "kids", "buck", "doe",
  "pig", "pigs", "swine", "hog", "piglet", "guinea", "cavy", "ferret", "ferrets",
  "hamster", "gerbil", "mouse", "mice", "rat", "rats", "chinchilla", "hedgehog",
  "bird", "birds", "parrot", "parakeet", "cockatiel", "canary", "finch", "chicken", "hen", "rooster", "duck", "goose",
  "canine", "feline", "equine", "ovine", "caprine", "porcine", "avian", "reptile", "amphibian",
  "animal", "animals", "pet", "pets", "patient", "patients",
  "shepherd", "german", "labrador", "retriever", "golden", "bulldog", "french", "frenchie",
  "beagle", "poodle", "boxer", "husky", "siberian", "dachshund", "rottweiler", "chihuahua",
  "terrier", "yorkie", "yorkshire", "pitbull", "spaniel", "cocker", "pointer", "collie", "border",
  "corgi", "shih", "tzu", "maltese", "pug", "great", "dane", "mastiff", "doberman", "pinscher",
  "bernese", "mountain", "saint", "bernard", "australian", "cattle", "akita", "samoyed",

  // Clinical Findings, Symptoms & Pathology
  "vomit", "vomits", "vomited", "vomiting", "emesis", "retching", "retched", "retches", "regurgitation", "regurgitating",
  "diarrhea", "stool", "stools", "feces", "fecal", "defecating", "defecation", "constipated", "constipation",
  "melena", "hematochezia", "diarrheic", "watery", "loose", "soft", "firm", "hard", "dry", "mucous",
  "lethargy", "lethargic", "tired", "weak", "weakness", "exhausted", "depression", "depressed", "dull", "obtunded", "moribund",
  "anorexia", "anorexic", "appetite", "eating", "eats", "ate", "food", "feed", "kibble", "diet", "meal", "treats",
  "drinking", "drinks", "drank", "water", "thirsty", "polydipsia", "polyuria", "polyphagia", "pupd",
  "urination", "urinating", "urinates", "urinated", "urine", "pee", "peeing", "stranguria", "dysuria", "hematuria",
  "incontinence", "incontinent", "pollakiuria", "anuria", "oliguria", "bladder", "urethra", "urethral",
  "cough", "coughs", "coughed", "coughing", "gag", "gags", "gagged", "gagging", "choke", "chokes", "choked", "choking",
  "sneeze", "sneezes", "sneezed", "sneezing", "wheeze", "wheezes", "wheezed", "wheezing", "stridor", "stertor",
  "breath", "breaths", "breathing", "breathes", "breathed", "dyspnea", "dyspneic", "tachypnea", "tachypneic",
  "respiration", "respiratory", "panting", "shallow", "deep", "labored", "apnea", "orthopnea", "orthopneic",
  "scratch", "scratches", "scratched", "scratching", "itch", "itches", "itched", "itching", "pruritus", "pruritic",
  "shake", "shakes", "shook", "shaking", "twitch", "twitches", "twitched", "twitching", "tremor", "tremors",
  "seizure", "seizures", "convulsion", "convulsions", "epilepsy", "epileptic", "ictus", "ictal", "postictal",
  "collapse", "collapses", "collapsed", "collapsing", "syncope", "syncopal", "faint", "fainted", "fainting",
  "limp", "limps", "limped", "limping", "lameness", "lame", "gait", "walking", "walks", "walked", "ataxia", "ataxic",
  "paresis", "paretic", "paralysis", "paralyzed", "paraplegic", "tetraplegic", "knuckling", "stumbling", "staggering",
  "swelling", "swollen", "edema", "edematous", "lump", "lumps", "mass", "masses", "bump", "bumps", "nodule", "nodules",
  "inflammation", "inflamed", "pain", "painful", "tender", "tenderness", "sore", "soreness", "hyperesthesia",
  "crying", "whining", "yelping", "howling", "groaning", "vocalizing", "vocalization", "grunting",
  "blood", "bloody", "bleeding", "bleeds", "bled", "hemorrhage", "hemorrhagic", "bruise", "bruises", "bruised", "bruising",
  "petechiae", "ecchymosis", "wound", "wounds", "cut", "cuts", "laceration", "lacerations", "bite", "bites", "bitten",
  "sting", "stings", "stung", "trauma", "fracture", "luxation", "sprain", "strain", "abscess",
  "discharge", "mucus", "pus", "purulent", "exudate", "fluid", "secretions", "crust", "crusted", "crusts", "crusting",
  "red", "redness", "erythema", "erythematous", "rash", "hives", "urticaria", "alopecia", "bald", "fur", "hair", "coat",
  "fever", "feverish", "temperature", "pyrexia", "hot", "warm", "cold", "hypothermia", "hyperthermia",
  "pale", "pallor", "yellow", "jaundice", "icterus", "icteric", "blue", "cyanosis", "cyanotic", "mucosa", "mucous",
  "drool", "drools", "drooled", "drooling", "saliva", "salivating", "salivation", "ptyalism", "hypersalivation",
  "foul", "odor", "smell", "smells", "smelled", "smelling", "stinky", "malodorous", "halitosis",
  "distended", "distension", "distention", "bloat", "bloated", "bloating", "tympany", "tympanic",
  "arrhythmia", "murmur", "tachycardia", "bradycardia", "pulse", "pulses",

  // Anatomy & Locations
  "head", "ear", "ears", "pinna", "pinnae", "canal", "aural", "otic", "tympanic", "membrane",
  "eye", "eyes", "cornea", "sclera", "pupil", "pupils", "retina", "lens", "eyelid", "eyelids", "blepharospasm",
  "nose", "nostril", "nostrils", "nasal", "nares", "snout", "muzzle", "mouth", "oral", "lip", "lips",
  "jaw", "jaws", "mandible", "maxilla", "teeth", "tooth", "tongue", "lingual", "gum", "gums", "gingiva",
  "throat", "pharynx", "larynx", "trachea", "esophagus", "neck", "cervical", "chest", "thorax", "thoracic",
  "rib", "ribs", "sternum", "abdomen", "abdominal", "belly", "flank", "groin", "inguinal", "paralumbar",
  "stomach", "gastric", "gut", "guts", "intestine", "intestines", "intestinal", "bowel", "colon", "rectum", "anal", "anus",
  "back", "spine", "spinal", "vertebra", "vertebrae", "lumbar", "sacral", "tail",
  "leg", "legs", "forelimb", "hindlimb", "limb", "limbs", "arm", "arms", "thigh", "knee", "hock", "stifle",
  "elbow", "shoulder", "hip", "hips", "pelvis", "pelvic", "carpus", "tarsus", "paw", "paws", "pad", "pads",
  "claw", "claws", "nail", "nails", "foot", "feet", "toe", "toes", "dewclaw", "tendon", "ligament", "muscle", "joint",
  "skin", "dermis", "subcutaneous", "mammary", "teat", "teats", "vulva", "vagina", "penis", "prepuce", "scrotum", "testes",
  "heart", "cardiac", "lung", "lungs", "pulmonary", "liver", "hepatic", "kidney", "kidneys", "renal", "spleen", "splenic",

  // Everyday Verbs & Actions
  "is", "are", "was", "were", "be", "been", "being", "am",
  "has", "have", "had", "having",
  "does", "do", "did", "done", "doing",
  "can", "cannot", "could", "couldnt", "will", "would", "shall", "should", "may", "might", "must",
  "start", "starts", "started", "starting",
  "stop", "stops", "stopped", "stopping",
  "keep", "keeps", "kept", "keeping",
  "seem", "seems", "seemed", "seeming",
  "look", "looks", "looked", "looking",
  "feel", "feels", "felt", "feeling",
  "act", "acts", "acted", "acting",
  "refuse", "refuses", "refused", "refusing",
  "notice", "noticed", "noticing", "notices",
  "touch", "touched", "touching", "touches",
  "move", "moves", "moved", "moving", "movement",
  "jump", "jumps", "jumped", "jumping",
  "run", "runs", "ran", "running",
  "walk", "walks", "walked", "walking",
  "play", "plays", "played", "playing",
  "sleep", "sleeps", "slept", "sleeping",
  "lie", "lies", "lay", "lying",
  "stand", "stands", "stood", "standing",
  "sit", "sits", "sat", "sitting",
  "fall", "falls", "fell", "fallen", "falling",
  "climb", "climbs", "climbed", "climbing",
  "drop", "drops", "dropped", "dropping",
  "hold", "holds", "held", "holding",
  "carry", "carries", "carried", "carrying",
  "shake", "shakes", "shook", "shaken", "shaking",
  "catch", "catches", "caught", "catching",
  "throw", "throws", "threw", "thrown", "throwing",
  "give", "gives", "gave", "given", "giving",
  "take", "takes", "took", "taken", "taking",
  "make", "makes", "made", "making",
  "come", "comes", "came", "coming",
  "go", "goes", "went", "gone", "going",
  "see", "sees", "saw", "seen", "seeing",
  "get", "gets", "got", "gotten", "getting",
  "put", "puts", "putting",
  "hit", "hits", "hitting",
  "bite", "bites", "bit", "bitten", "biting",
  "eat", "eats", "ate", "eaten", "eating",
  "drink", "drinks", "drank", "drunk", "drinking",
  "swallow", "swallows", "swallowed", "swallowing",

  // Everyday Nouns
  "house", "home", "yard", "garden", "room", "kitchen", "carpet", "floor", "bed", "couch", "sofa",
  "car", "truck", "road", "street", "park", "fence", "gate", "door", "cage", "crate", "box",
  "litter", "tray", "bowl", "dish", "leash", "collar", "harness", "toy", "ball", "bone", "stick",
  "grass", "dirt", "mud", "plant", "flower", "tree", "leaf", "leaves", "wood", "rock", "stone",
  "trash", "garbage", "bin", "plastic", "sock", "cloth", "string", "rope", "fabric", "paper",
  "chocolate", "onion", "garlic", "grape", "grapes", "raisin", "raisins", "poison", "bait", "toxin",
  "medication", "medicine", "pill", "pills", "tablet", "tablets", "capsule", "capsules", "dose",
  "vaccine", "vaccines", "vaccination", "shot", "shots", "injection", "flea", "fleas", "tick", "ticks",
  "worm", "worms", "parasite", "parasites", "mite", "mites", "bee", "wasp", "spider", "insect", "bug",

  // Time, Numbers & Frequencies
  "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks", "month", "months", "year", "years",
  "yesterday", "today", "tomorrow", "tonight", "morning", "afternoon", "evening", "night", "overnight",
  "time", "times", "history", "since", "for", "ago", "past", "last", "recent", "recently",
  "always", "never", "sometimes", "often", "rarely", "seldom", "frequently", "constantly", "intermittently",
  "sudden", "suddenly", "acute", "acutely", "chronic", "chronically", "gradual", "gradually",
  "first", "second", "third", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "zero", "half", "quarter", "couple", "few", "many", "several", "all", "none", "some", "any",

  // Common Adjectives & Modifiers
  "severe", "severely", "mild", "mildly", "moderate", "moderately", "marked", "markedly",
  "heavy", "heavily", "light", "lightly", "fast", "slow", "rapid", "rapidly",
  "hard", "soft", "firm", "hot", "cold", "warm", "cool",
  "dry", "wet", "watery", "clear", "cloudy", "dark", "bright",
  "bad", "worse", "worst", "good", "better", "best",
  "big", "large", "huge", "small", "little", "tiny",
  "old", "young", "new", "senior", "juvenile", "adult", "geriatric",
  "normal", "abnormal", "strange", "unusual", "odd",
  "alert", "active", "restless", "quiet", "calm", "nervous", "anxious", "aggressive",
  "clean", "dirty", "fresh", "foul", "sweet", "sour",

  // Prepositions, Articles, Pronouns & Conjunctions
  "in", "on", "at", "to", "for", "with", "without", "from", "by", "about", "into", "through",
  "during", "before", "after", "above", "below", "under", "over", "between", "among", "behind", "front",
  "and", "but", "or", "nor", "so", "yet", "both", "either", "neither",
  "the", "a", "an", "this", "that", "these", "those",
  "his", "her", "its", "their", "our", "my", "your",
  "he", "she", "it", "they", "we", "you", "i", "him", "them", "us", "me",
  "not", "no", "yes", "alot", "lot", "lots", "very", "much", "more", "most", "too", "also", "even", "only", "just", "really", "almost"
]);

const dictArray = Array.from(words).sort();
console.log(`Compiled comprehensive dictionary with ${dictArray.length} words.`);

const targetFile = path.join(__dirname, '../client/src/data/spellDictionary.js');
const fileContent = `// Comprehensive Clinical & English Spelling Dictionary (${dictArray.length} words)
export const DICTIONARY_WORDS = ${JSON.stringify(dictArray, null, 2)};
`;

fs.writeFileSync(targetFile, fileContent, 'utf8');
console.log(`Saved dictionary to: ${targetFile}`);

