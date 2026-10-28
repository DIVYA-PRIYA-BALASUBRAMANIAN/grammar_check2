const fs = require('fs');

// Build a substantial veterinary & general English dictionary
const BASE_DICTIONARY = [
  // Animals & Breeds
  "dog", "dogs", "cat", "cats", "puppy", "puppies", "pup", "pups", "kitten", "kittens",
  "rabbit", "rabbits", "bunny", "horse", "horses", "mare", "stallion", "gelding", "foal",
  "cow", "cows", "bovine", "calf", "calves", "bull", "sheep", "lamb", "goat", "goats", "kid",
  "ferret", "ferrets", "guinea", "pig", "pigs", "hamster", "bird", "birds", "parrot",
  "canine", "feline", "equine", "ovine", "caprine", "avian", "animal", "animals", "pet", "pets",
  "patient", "patients", "shepherd", "labrador", "retriever", "beagle", "bulldog", "terrier",
  "poodle", "boxer", "husky", "dachshund", "rottweiler", "chihuahua",

  // Clinical Symptoms & Signs
  "vomit", "vomits", "vomited", "vomiting",
  "diarrhea", "stool", "stools", "feces", "bowel", "defecating", "defecation", "constipated", "constipation",
  "lethargy", "lethargic", "tired", "weak", "weakness", "exhausted", "depression", "depressed",
  "anorexia", "anorexic", "appetite", "eating", "eats", "ate", "food", "feed", "kibble", "diet",
  "drinking", "drinks", "drank", "water", "thirsty", "polydipsia", "polyuria", "polyphagia",
  "urination", "urinating", "urinates", "urinated", "urine", "pee", "peeing", "stranguria", "dysuria", "hematuria",
  "cough", "coughs", "coughed", "coughing", "gag", "gags", "gagging", "gagged", "choke", "chokes", "choked", "choking",
  "sneeze", "sneezes", "sneezed", "sneezing", "wheeze", "wheezes", "wheezing", "wheezed", "stridor", "stertor",
  "breath", "breathing", "breathes", "breathed", "dyspnea", "dyspneic", "tachypnea", "tachypneic", "panting",
  "scratch", "scratches", "scratched", "scratching", "itch", "itches", "itched", "itching", "pruritus", "pruritic",
  "shake", "shakes", "shook", "shaking", "twitch", "twitches", "twitching", "tremor", "tremors",
  "seizure", "seizures", "convulsion", "convulsions", "collapse", "collapses", "collapsed", "collapsing", "syncope",
  "limp", "limps", "limped", "limping", "lameness", "lame", "gait", "walking", "walks", "walked",
  "swelling", "swollen", "edema", "lump", "lumps", "mass", "masses", "bump", "bumps", "inflammation", "inflamed",
  "pain", "painful", "tender", "tenderness", "sore", "soreness", "crying", "whining", "yelping", "howling",
  "blood", "bloody", "bleeding", "bleeds", "bled", "hemorrhage", "hemorrhagic", "bruise", "bruises", "bruised",
  "wound", "wounds", "cut", "cuts", "laceration", "lacerations", "bite", "bites", "bitten", "sting", "stung",
  "discharge", "mucus", "pus", "purulent", "exudate", "fluid", "secretions", "crust", "crusted", "crusting",
  "red", "redness", "erythema", "erythematous", "rash", "hives", "urticaria", "alopecia", "bald", "fur", "hair",
  "fever", "feverish", "temperature", "pyrexia", "hot", "warm", "cold", "hypothermia", "hyperthermia",
  "pale", "pallor", "yellow", "jaundice", "icterus", "icteric", "blue", "cyanosis", "cyanotic",
  "drool", "drools", "drooled", "drooling", "saliva", "salivating", "salivation", "ptyalism",
  "foul", "odor", "smell", "smells", "smelling", "stinky", "malodorous", "breath", "halitosis",
  "distended", "distension", "distention", "bloat", "bloated", "bloating", "tympany", "tympanic",
  "retching", "retches", "retched", "regurgitation", "regurgitating", "regurgitates",

  // Anatomy
  "head", "ear", "ears", "eye", "eyes", "nose", "nostril", "nostrils", "muzzle", "mouth", "lip", "lips",
  "jaw", "teeth", "tooth", "tongue", "gum", "gums", "throat", "neck", "chest", "thorax", "thoracic",
  "abdomen", "abdominal", "belly", "stomach", "gut", "guts", "intestine", "intestines", "colon",
  "back", "spine", "spinal", "tail", "leg", "legs", "paw", "paws", "pad", "pads", "foot", "feet",
  "forelimb", "hindlimb", "limb", "limbs", "joint", "joints", "knee", "hock", "hip", "elbow", "shoulder",
  "skin", "coat", "flank", "groin", "vulva", "penis", "prepuce", "scrotum", "testicle", "testicles", "bladder",
  "heart", "lung", "lungs", "liver", "kidney", "kidneys", "spleen",

  // Common Verbs & Connectors
  "is", "are", "was", "were", "be", "been", "being",
  "has", "have", "had", "having",
  "does", "do", "did", "doing",
  "can", "cannot", "could", "couldnt", "will", "would", "shall", "should", "may", "might", "must",
  "start", "starts", "started", "starting",
  "stop", "stops", "stopped", "stopping",
  "keep", "keeps", "kept", "keeping",
  "seem", "seems", "seemed", "seeming",
  "look", "looks", "looked", "looking",
  "feel", "feels", "felt", "feeling",
  "act", "acts", "acted", "acting",
  "refuse", "refuses", "refused", "refusing",
  "notice", "noticed", "noticing",
  "touch", "touched", "touching",
  "move", "moves", "moved", "moving",
  "jump", "jumps", "jumped", "jumping",
  "run", "runs", "ran", "running",
  "play", "plays", "played", "playing",
  "sleep", "sleeps", "slept", "sleeping",
  "lie", "lies", "lay", "lying",
  "stand", "stands", "stood", "standing",
  "sit", "sits", "sat", "sitting",

  // Time & Numbers
  "hour", "hours", "day", "days", "week", "weeks", "month", "months", "year", "years",
  "yesterday", "today", "morning", "afternoon", "evening", "night", "overnight",
  "since", "for", "ago", "acute", "chronic", "constant", "intermittent", "sudden", "gradual",
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",

  // Adjectives & Modifiers
  "severe", "severely", "mild", "mildly", "moderate", "moderately", "marked", "markedly",
  "acute", "acutely", "chronic", "chronically", "frequent", "frequently", "persistent", "persistently",
  "heavy", "heavily", "rapid", "rapidly", "slow", "slowly", "shallow", "deep",
  "excessive", "excessively", "normal", "abnormal", "abnormally",
  "bad", "worse", "worst", "good", "better", "best",
  "small", "large", "big", "tiny", "huge", "little",
  "dry", "wet", "watery", "clear", "cloudy", "dark", "bright",
  "hard", "soft", "firm", "hot", "cold", "warm", "cool",

  // Common Prepositions & Particles
  "in", "on", "at", "to", "for", "with", "without", "from", "by", "about",
  "into", "through", "during", "before", "after", "above", "below", "under", "over",
  "and", "but", "or", "nor", "so", "yet", "both", "either", "neither",
  "the", "a", "an", "this", "that", "these", "those",
  "his", "her", "its", "their", "our", "my", "your",
  "he", "she", "it", "they", "we", "you", "i",
  "him", "them", "us", "me",
  "not", "no", "never", "always", "sometimes", "very", "much", "more", "most",
  "too", "also", "even", "only", "just", "quite", "really", "almost"
];

// Write this dictionary into client/src/data/spellDictionary.js
console.log('Base dictionary count:', BASE_DICTIONARY.length);

