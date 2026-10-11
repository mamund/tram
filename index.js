'use strict';

/** Public Node.js interface for TRAM. */
const { loadManifest, validateManifest } = require('./lib/manifest');
const { runSuite } = require('./lib/runner');

/** Execute an already-loaded manifest and return structured results. */
async function run(manifest) {
  validateManifest(manifest);
  return runSuite(manifest);
}

module.exports = { loadManifest, validateManifest, run };
