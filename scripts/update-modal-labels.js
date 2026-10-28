const fs = require('fs');

const path = 'client/src/components/AiCaseAssistantModal.jsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "{correctionResult.isHighConfidenceMatch ? 'Verified Human Standard:' : 'Refined Clinical Formulation:'}",
  "{correctionResult.isHighConfidenceMatch ? 'Verified Standard:' : 'Grammar & Spell Correction:'}"
);

code = code.replace(
  "Strict clinical fidelity guarantee: only spelling, medical syntax & formatting corrected — zero added symptoms.",
  "Direct grammar and spelling correction — no extra words or boilerplate added."
);

fs.writeFileSync(path, code, 'utf8');
console.log('AiCaseAssistantModal.jsx labels updated');

