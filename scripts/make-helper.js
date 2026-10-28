const fs = require('fs');
const path = require('path');

// Read clinicalAutoCorrect.js and export the functions for node
const clientCode = fs.readFileSync(path.join(__dirname, '../client/src/services/clinicalAutoCorrect.js'), 'utf8');

// Strip ES module imports/exports
let nodeCode = clientCode
  .replace(/import\s+.*?;/g, '')
  .replace(/export\s+const\s+/g, 'const ')
  .replace(/export\s+function\s+/g, 'function ')
  .replace(/export\s+async\s+function\s+/g, 'async function ');

nodeCode += `
module.exports = {
  TRAINING_DATA,
  runTier1Correction,
  generalizeTrainedClinicalEnglish,
  runTier2DeepSemanticCorrection,
  executeAutoCorrectionPipeline
};
`;

fs.writeFileSync(path.join(__dirname, 'generalizer-eval-helper.js'), nodeCode, 'utf8');

