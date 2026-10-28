const fs = require('fs');
const { DICTIONARY_WORDS } = require('../client/src/data/spellDictionary.js');

const VET_PHONETIC_TYPOS = {
  // Respiratory
  "tackypnea": "tachypnea",
  "takypnea": "tachypnea",
  "tachypnoea": "tachypnea",
  "despnea": "dyspnea",
  "dispnea": "dyspnea",
  "dyspnoea": "dyspnea",
  "orthopnoea": "orthopnea",
  "syanois": "cyanosis",
  "cyanocis": "cyanosis",
  "syanotic": "cyanotic",
  "epistaxsis": "epistaxis",
  "hemoptisis": "hemoptysis",
  "pnuemonia": "pneumonia",
  "pnumonia": "pneumonia",
  "numonia": "pneumonia",
  "bronchitus": "bronchitis",

  // Gastrointestinal
  "vommiting": "vomiting",
  "vomitting": "vomiting",
  "vommited": "vomited",
  "vomitted": "vomited",
  "diarhea": "diarrhea",
  "diahrrea": "diarrhea",
  "diarrheoa": "diarrhea",
  "diarhoea": "diarrhea",
  "diareah": "diarrhea",
  "melina": "melena",
  "hematocezia": "hematochezia",
  "haematochezia": "hematochezia",
  "regurgatating": "regurgitating",
  "regurg": "regurgitation",
  "ptyalizm": "ptyalism",
  "distention": "distension",
  "pancreatitus": "pancreatitis",
  "gastritus": "gastritis",
  "peritonitus": "peritonitis",

  // Urinary & Renal
  "strangurea": "stranguria",
  "strangury": "stranguria",
  "hematuria": "hematuria",
  "haematuria": "hematuria",
  "polakiuria": "pollakiuria",
  "pollakuria": "pollakiuria",
  "urolithis": "urolithiasis",
  "urolith": "urolithiasis",
  "cystitus": "cystitis",
  "pyelonefritis": "pyelonephritis",
  "azotemia": "azotemia",
  "azotaemia": "azotemia",

  // Cardiovascular
  "arrithmia": "arrhythmia",
  "arythmia": "arrhythmia",
  "arrhythmea": "arrhythmia",
  "takicardia": "tachycardia",
  "tachycardea": "tachycardia",
  "braidicardia": "bradycardia",
  "bradycardea": "bradycardia",
  "syncopee": "syncope",
  "syncopy": "syncope",

  // Neurology
  "seisure": "seizure",
  "seisures": "seizures",
  "ataxic": "ataxic",
  "ataksia": "ataxia",
  "paresis": "paresis",
  "peresis": "paresis",
  "nystagmis": "nystagmus",
  "nystagmas": "nystagmus",
  "strabismus": "strabismus",
  "anysocoria": "anisocoria",
  "anisocoria": "anisocoria",
  "mydriasis": "mydriasis",
  "midriasis": "mydriasis",
  "encefalitis": "encephalitis",
  "meningitus": "meningitis",

  // Dermatology
  "pruritis": "pruritus",
  "preeuritus": "pruritus",
  "alopesia": "alopecia",
  "alpecia": "alopecia",
  "erytheme": "erythema",
  "erithema": "erythema",
  "seboria": "seborrhea",
  "seborrhea": "seborrhea",
  "demodex": "demodex",
  "demodecosis": "demodicosis",
  "otitus": "otitis",

  // Ophthalmology
  "bleferospasm": "blepharospasm",
  "blepharospasam": "blepharospasm",
  "conjunctivitus": "conjunctivitis",
  "conjuctivitis": "conjunctivitis",
  "corneal": "corneal",
  "ulcer": "ulcer",
  "uveitus": "uveitis",
  "glaucome": "glaucoma",
  "cataract": "cataract",

  // Reproductive
  "pyometra": "pyometra",
  "pyometria": "pyometra",
  "dystocea": "dystocia",
  "distocia": "dystocia",
  "mastitus": "mastitis",
  "cryptorchism": "cryptorchidism",
  "cryptorkid": "cryptorchid",

  // Hepatic & Metabolic
  "jaundis": "jaundice",
  "iterus": "icterus",
  "icteris": "icterus",
  "icterick": "icteric",
  "hypoglicemia": "hypoglycemia",
  "hyperglicemia": "hyperglycemia",
  "lipidocis": "lipidosis"
};

console.log("Total specific phonetic veterinary typo rules:", Object.keys(VET_PHONETIC_TYPOS).length);

