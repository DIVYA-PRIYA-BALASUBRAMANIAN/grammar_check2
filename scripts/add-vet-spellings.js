const fs = require('fs');
const path = require('path');

// Existing dictionary
let existingWords = [];
try {
  const existing = require('../client/src/data/spellDictionary.js');
  if (Array.isArray(existing.DICTIONARY_WORDS)) {
    existingWords = existing.DICTIONARY_WORDS;
  }
} catch (_) { }

// Massive veterinary medical lexicon
const VET_TERMS = [
  // --- Gastrointestinal & Abdominal ---
  "vomit", "vomits", "vomited", "vomiting", "emesis", "hematemesis",
  "retching", "retches", "retched", "regurgitation", "regurgitating", "regurgitates",
  "diarrhea", "diarrheic", "stool", "stools", "feces", "fecal", "defecating", "defecation",
  "hematochezia", "melena", "constipation", "constipated", "obstipation", "dyschezia", "tenesmus",
  "borborygmus", "borborygmi", "flatulence", "flatus", "tympany", "tympanic", "bloat", "bloated",
  "bloating", "meteorism", "ileus", "gdv", "volvulus", "torsion", "colic", "impaction",
  "gastritis", "enteritis", "gastroenteritis", "pancreatitis", "hepatitis", "cholangitis",
  "cholangiohepatitis", "cholecystitis", "cholelithiasis", "colitis", "proctitis", "peritonitis",
  "ascites", "ptyalism", "hypersalivation", "salivation", "salivating", "dysphagia", "odynophagia",
  "anorexia", "anorexic", "inappetence", "hyporexia", "polyphagia", "coprophagia", "pica",
  "halitosis", "trichobezoar", "intussusception", "hernia", "umbilical", "inguinal", "perineal",
  "abomasum", "abomasal", "rumen", "ruminal", "reticulum", "reticular", "reticuloperitonitis",
  "omental", "mesenteric", "duodenum", "duodenal", "jejunum", "jejunal", "ileum", "ileal",
  "cecum", "cecal", "colon", "colonic", "rectum", "rectal", "anus", "anal", "sacs", "sacculitis",

  // --- Urinary & Renal ---
  "stranguria", "stranguric", "dysuria", "pollakiuria", "hematuria", "polyuria", "polydipsia",
  "pupd", "oliguria", "anuria", "periuria", "incontinence", "incontinent", "azotemia", "uremia",
  "uremic", "urolithiasis", "calculi", "calculus", "struvite", "oxalate", "cystitis", "pyelonephritis",
  "glomerulonephritis", "nephritis", "nephropathy", "nephrosis", "proteinuria", "glucosuria",
  "ketonuria", "bilirubinuria", "isosthenuria", "hyposthenuria", "hyperkalemia", "hypokalemia",
  "hypercalcemia", "hypocalcemia", "hyperphosphatemia", "urethra", "urethral", "ureter", "ureteral",
  "bladder", "kidney", "kidneys", "renal", "flutd", "obstruction", "obstructed", "catheterization",
  "cystocentesis",

  // --- Respiratory & Thoracic ---
  "dyspnea", "dyspneic", "tachypnea", "tachypneic", "bradypnea", "orthopnea", "orthopneic",
  "hypopnea", "apnea", "cyanosis", "cyanotic", "stridor", "stertor", "stertorous", "epistaxis",
  "hemoptysis", "cough", "coughs", "coughed", "coughing", "paroxysmal", "sneeze", "sneezes",
  "sneezed", "sneezing", "wheeze", "wheezes", "wheezed", "wheezing", "rhinitis", "sinusitis",
  "tracheitis", "bronchitis", "bronchospasm", "bronchoconstriction", "pneumonia", "pneumothorax",
  "hemothorax", "chylothorax", "pleural", "effusion", "atelectasis", "consolidation", "crackles",
  "rhonchi", "trachea", "tracheal", "collapse", "bronchi", "bronchial", "alveoli", "alveolar",
  "larynx", "laryngeal", "pharynx", "pharyngeal", "boas", "nares", "stenotic", "palate", "elongated",
  "tracheostomy", "intubation",

  // --- Cardiovascular ---
  "tachycardia", "tachycardic", "bradycardia", "bradycardic", "arrhythmia", "dysrhythmia",
  "murmur", "systolic", "diastolic", "gallop", "syncope", "syncopal", "pericardial", "effusion",
  "tamponade", "cardiomegaly", "cardiomyopathy", "dcm", "hcm", "edema", "pulmonary", "congestive",
  "chf", "hypovolemia", "hypovolemic", "hypotension", "hypotensive", "hypertension", "hypertensive",
  "thrombosis", "thromboembolism", "fate", "embolus", "embolism", "pulse", "pulses", "femoral",
  "deficits", "pallor", "hyperdynamic", "troponin", "endocarditis", "valvular", "mitral", "tricuspid",
  "aortic", "ventricle", "ventricular", "atrium", "atrial", "fibrillation", "extrasystole",

  // --- Neurological ---
  "seizure", "seizures", "epilepsy", "epileptic", "ictus", "ictal", "postictal", "preictal",
  "status", "epilepticus", "cluster", "ataxia", "ataxic", "paresis", "paretic", "paralysis",
  "paralyzed", "paraplegia", "paraplegic", "tetraplegia", "tetraplegic", "hemiplegia", "hemiplegic",
  "paraparesis", "tetraparesis", "hemiparesis", "hyperesthesia", "hypoesthesia", "proprioception",
  "proprioceptive", "knuckling", "circling", "headtilt", "tilt", "nystagmus", "strabismus",
  "anisocoria", "mydriasis", "miosis", "menace", "palpebral", "pupillary", "reflex", "reflexes",
  "hyperreflexia", "hyporeflexia", "tremor", "tremors", "myoclonus", "fasciculation", "stupor",
  "obtunded", "coma", "comatose", "vestibular", "myasthenia", "gravis", "neuropathy", "polyneuropathy",
  "radiculopathy", "myelopathy", "encephalopathy", "encephalitis", "meningitis", "meningoencephalitis",
  "ivdd", "herniation", "extrusion", "protrusion", "disc", "discs", "compression", "lumbosacral",
  "cervical", "syringomyelia", "hydrocephalus",

  // --- Dermatology & Otology ---
  "pruritus", "pruritic", "alopecia", "hypotrichosis", "erythema", "erythematous", "excoriation",
  "excoriations", "lichenification", "hyperpigmentation", "macule", "macules", "papule", "papules",
  "pustule", "pustules", "vesicle", "vesicles", "bulla", "bullae", "wheal", "wheals", "urticaria",
  "angioedema", "scaling", "crusting", "crusts", "seborrhea", "seborrheic", "pyoderma", "folliculitis",
  "furunculosis", "pododermatitis", "cellulitis", "fistula", "dermatitis", "atopy", "atopic", "allergy",
  "allergic", "otitis", "externa", "media", "interna", "cerumen", "ceruminous", "pinna", "pinnae",
  "pinnal", "hematoma", "flea", "fleas", "demodex", "demodicosis", "sarcoptes", "scabies",
  "cheyletiella", "malassezia", "dermatophyte", "dermatophytosis", "ringworm", "microsporum",
  "trichophyton", "mycosis", "onychomycosis", "paronychia", "interdigital", "pemphigus",

  // --- Musculoskeletal & Orthopedic ---
  "lameness", "lame", "limp", "limps", "limped", "limping", "crepitation", "crepitus", "luxation",
  "subluxation", "cruciate", "ligament", "ccl", "cclr", "meniscus", "meniscal", "patella", "patellar",
  "mpl", "lpl", "dysplasia", "osteoarthritis", "arthrosis", "arthritis", "spondylosis", "myositis",
  "tendinitis", "tendonitis", "tendon", "tendons", "desmitis", "osteomyelitis", "fracture", "fractures",
  "comminuted", "greenstick", "avulsion", "fissure", "drawer", "ortolani", "tibial", "thrust", "tplo",
  "tta", "ostectomy", "osteotomy", "arthrodesis", "synovial", "synovitis", "bursa", "bursitis",

  // --- Ophthalmology ---
  "blepharospasm", "epiphora", "conjunctivitis", "conjunctiva", "conjunctival", "chemosis",
  "cornea", "corneal", "ulcer", "ulcers", "ulceration", "uveitis", "hypopyon", "hyphema",
  "glaucoma", "cataract", "cataracts", "sclerosis", "nuclear", "entropion", "ectropion",
  "distichiasis", "trichiasis", "proptosis", "keratitis", "kcs", "keratoconjunctivitis", "sicca",
  "fundus", "retina", "retinal", "detachment", "sards", "tonometry", "fluorescein", "cherry",
  "nictitans", "membrane", "anterior", "chamber", "aqueous", "vitreous",

  // --- Reproductive, Obstetrics & Neonatal ---
  "dystocia", "pyometra", "metritis", "endometritis", "mastitis", "mastitic", "vaginitis",
  "paraphimosis", "phimosis", "priapism", "cryptorchid", "cryptorchidism", "orchitis", "epididymitis",
  "balanoposthitis", "pseudopregnancy", "pseudocyesis", "estrus", "anestrus", "proestrus", "diestrus",
  "parturition", "postpartum", "lochia", "placenta", "colostrum", "omphalitis", "eclampsia",
  "hypocalcemia", "cesarean", "c-section", "ovariohysterectomy", "spay", "neuter", "castration",
  "prostate", "prostatitis", "hyperplasia", "bph", "testicle", "testicles", "ovary", "ovaries",
  "uterus", "uterine",

  // --- Hepatic, Pancreatic & Endocrine ---
  "jaundice", "icterus", "icteric", "hepatomegaly", "microhepatica", "lipidosis", "shunts",
  "portosystemic", "pss", "cholelith", "gallbladder", "mucocele", "pancreatitis", "exocrine",
  "epi", "hyperadrenocorticism", "cushing", "cushings", "hypoadrenocorticism", "addison", "addisons",
  "hypothyroidism", "hyperthyroidism", "diabetes", "mellitus", "ketoacidosis", "dka", "hypoglycemia",
  "hyperglycemia", "insulinoma", "pheochromocytoma", "hyperparathyroidism", "hypoparathyroidism",
  "thyroid", "adrenal", "pituitary",

  // --- Infectious Diseases & Parasitology ---
  "parvovirus", "parvo", "distemper", "panleukopenia", "coronavirus", "fip", "felv", "fiv",
  "calicivirus", "herpesvirus", "fhv", "rabies", "leptospirosis", "lepto", "borrelia", "lyme",
  "ehrlichia", "ehrlichiosis", "anaplasma", "anaplasmosis", "babesia", "babesiosis", "bartonella",
  "rickettsia", "toxoplasma", "toxoplasmosis", "giardia", "giardiasis", "coccidia", "coccidiosis",
  "cryptosporidium", "dirofilaria", "heartworm", "ancylostoma", "hookworm", "toxocara", "roundworm",
  "trichuris", "whipworm", "dipylidium", "taenia", "tapeworm", "parasite", "parasites", "parasitic",
  "clostridium", "salmonella", "campylobacter", "escherichia", "coli", "staphylococcus", "streptococcus",
  "pseudomonas", "bordetella", "pasteurella", "mycoplasma", "aspergillus", "blastomyces", "histoplasma",

  // --- Large Animal (Equine, Bovine, Caprine, Ovine) ---
  "laminitis", "founder", "navicular", "thrush", "quittor", "gravel", "abscess", "sole",
  "frog", "coffin", "pastern", "fetlock", "cannon", "splint", "splints", "heaves", "rao",
  "strangles", "rhinopneumonitis", "choke", "esophageal", "obstruction", "abomasum", "lda",
  "rda", "ketosis", "milkfever", "hypomagnesemia", "tetany", "rumenitis", "acidosis", "alkalosis",
  "hardware", "reticuloperitonitis", "bloat", "bruxism", "lochia", "retained", "placenta",
  "mastitis", "calving", "foaling", "lambing", "kidding", "colostrum",

  // --- Exotics & Pocket Pets (Rabbits, Ferrets, Guinea Pigs, Birds, Reptiles) ---
  "lagomorph", "cavy", "mustelid", "stasis", "gi-stasis", "trichobezoar", "malocclusion",
  "hypsodont", "elodont", "spurs", "scurvy", "hypovitaminosis", "crop", "sour-crop", "impacted-crop",
  "egg-binding", "plucking", "bumblefoot", "pododermatitis", "dysecdysis", "ecdysis", "tail-bobbing",
  "snuffles", "pasteurellosis", "myxomatosis", "urates", "cloaca", "prolapse", "sacculitis",
  "psittacosis", "chlamydiosis",

  // --- Diagnostics, Lab & Procedures ---
  "auscultation", "percussion", "palpation", "ballottement", "radiograph", "radiographs",
  "radiography", "radiopaque", "radiolucent", "ultrasound", "ultrasonography", "echocardiogram",
  "echocardiography", "endoscopy", "laparoscopy", "bronchoscopy", "cytology", "histopathology",
  "biopsy", "hematocrit", "packed", "cell", "volume", "pcv", "hemoglobin", "platelets",
  "reticulocytes", "urinalysis", "sediment", "centesis", "abdominocentesis", "thoracocentesis",
  "pericardiocentesis", "cystocentesis", "arthrocentesis", "lactate", "creatinine", "bun",
  "urea", "bilirubin", "amylase", "lipase", "spec-cpl", "spec-fpl", "troponin", "albumin",
  "globulin", "alp", "alt", "ast", "ggt", "potassium", "sodium", "chloride", "calcium",
  "phosphorus", "magnesium", "glucose", "bicarbonate", "afast", "tfast", "trocarization",
  "gastropexy", "enterotomy", "enterectomy", "anastomosis", "splenectomy", "cystotomy",
  "urethrostomy", "laparotomy", "celiotomy", "debridement", "enucleation", "amputation"
];

// Combine existing + new veterinary terms into a single sorted unique set
const combinedSet = new Set([
  ...existingWords,
  ...VET_TERMS.map(w => w.toLowerCase().trim())
]);

const finalArray = Array.from(combinedSet).sort();
console.log(`Updated spellDictionary with ${finalArray.length} total words (added ${VET_TERMS.length} veterinary entries).`);

const targetPath = path.join(__dirname, '../client/src/data/spellDictionary.js');
const exportContent = `// Comprehensive Clinical & Veterinary Spelling Dictionary (${finalArray.length} words)
export const DICTIONARY_WORDS = ${JSON.stringify(finalArray, null, 2)};
`;

fs.writeFileSync(targetPath, exportContent, 'utf8');
console.log(`Saved dictionary to: ${targetPath}`);

