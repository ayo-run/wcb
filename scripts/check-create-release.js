/**
 * @license MIT <https://opensource.org/licenses/MIT>
 *
 * Checks that `create/template/package.json`'s `web-component-base` peer range
 * still admits the root package's current version.
 *
 * This drift is invisible everywhere else: the range is frozen into the
 * create-wcb tarball at publish time, and `scripts/check-template.js` symlinks
 * the workspace root in as `web-component-base`, so it resolves the working
 * tree and never evaluates the published range. A major wcb release therefore
 * leaves `npm create wcb@latest` scaffolding projects pinned to the old major,
 * with every test still green.
 *
 * Two modes, because the two releases care differently:
 *   --warn   (root `pnpm release`)    stale range is worth knowing about, but
 *                                     must not block shipping wcb itself
 *   default  (`pnpm release:create`)  stale range is the whole bug — hard fail
 */

import fs from 'node:fs'
import process from 'node:process'

const PEER_PACKAGE_NAME = 'web-component-base'
const TEMPLATE_MANIFEST_PATH = 'create/template/package.json'
const isWarnOnlyMode = process.argv.includes('--warn')

/**
 * Reads a JSON file relative to this script.
 * @param {string} pathFromScriptsDir Path relative to `scripts/`.
 * @returns {object} The parsed contents.
 */
const readJsonFile = (pathFromScriptsDir) =>
  JSON.parse(
    fs.readFileSync(new URL(pathFromScriptsDir, import.meta.url), 'utf8')
  )

const rootPackageVersion = readJsonFile('../package.json').version
const declaredPeerRange = readJsonFile(`../${TEMPLATE_MANIFEST_PATH}`)
  .peerDependencies?.[PEER_PACKAGE_NAME]

/**
 * Parses `1.2.3` (ignoring any prerelease suffix) into numeric parts.
 * @param {string} versionString The version to parse.
 * @returns {number[]|null} `[major, minor, patch]`, or null if unparseable.
 */
function parseVersion(versionString) {
  const digitGroups = /^(\d+)\.(\d+)\.(\d+)/.exec(versionString)
  if (!digitGroups) return null
  return digitGroups.slice(1, 4).map(Number)
}

/**
 * Compares two `[major, minor, patch]` tuples.
 * @param {number[]} leftVersion Left-hand version.
 * @param {number[]} rightVersion Right-hand version.
 * @returns {number} -1 if left is lower, 1 if higher, 0 if equal.
 */
function compareVersions(leftVersion, rightVersion) {
  for (let position = 0; position < 3; position++) {
    if (leftVersion[position] !== rightVersion[position]) {
      return leftVersion[position] < rightVersion[position] ? -1 : 1
    }
  }
  return 0
}

/**
 * Resolves a range to the versions it admits. Supports the shapes a template
 * peer range realistically takes — `^x.y.z`, `~x.y.z`, `>=x.y.z`, and an exact
 * pin. Anything else returns null so the caller can say so plainly rather than
 * silently passing.
 * @param {string} rangeString The peer-dependency range.
 * @returns {{lowest: number[], firstExcluded: number[]|null}|null} Bounds,
 *   where `firstExcluded` is null for an open-ended range.
 */
function resolveRangeBounds(rangeString) {
  const lowest = parseVersion(rangeString.replace(/^[\^~]|^>=\s*/, ''))
  if (!lowest) return null

  const [lowestMajor, lowestMinor, lowestPatch] = lowest

  if (rangeString.startsWith('^')) {
    // Caret pins the leftmost non-zero component: ^0.2.1 stops at 0.3.0.
    const firstExcluded =
      lowestMajor > 0 ? [lowestMajor + 1, 0, 0] : [0, lowestMinor + 1, 0]
    return { lowest, firstExcluded }
  }
  if (rangeString.startsWith('~')) {
    return { lowest, firstExcluded: [lowestMajor, lowestMinor + 1, 0] }
  }
  if (rangeString.startsWith('>=')) {
    return { lowest, firstExcluded: null }
  }
  if (/^\d/.test(rangeString)) {
    return {
      lowest,
      firstExcluded: [lowestMajor, lowestMinor, lowestPatch + 1],
    }
  }
  return null
}

/**
 * Reports a stale/unreadable range and exits — fatally, unless `--warn`.
 * @param {string} problem What is wrong.
 * @param {string} remedy What to do about it.
 * @returns {void}
 */
function reportAndExit(problem, remedy) {
  const severity = isWarnOnlyMode ? 'warning' : 'error'
  console[isWarnOnlyMode ? 'warn' : 'error'](
    `check-create-release: ${severity}: ${problem}\n  ${remedy}`
  )
  process.exit(isWarnOnlyMode ? 0 : 1)
}

if (!declaredPeerRange) {
  reportAndExit(
    `${TEMPLATE_MANIFEST_PATH} declares no "${PEER_PACKAGE_NAME}" peer dependency.`,
    `Scaffolded projects would not install ${PEER_PACKAGE_NAME} at all.`
  )
}

const currentVersion = parseVersion(rootPackageVersion)
const admittedRange = resolveRangeBounds(declaredPeerRange)

if (!admittedRange) {
  reportAndExit(
    `cannot interpret peer range "${declaredPeerRange}" in ${TEMPLATE_MANIFEST_PATH}.`,
    `Supported shapes: ^x.y.z, ~x.y.z, >=x.y.z, x.y.z. Check it by hand.`
  )
}

const { lowest, firstExcluded } = admittedRange
const rangeAdmitsCurrentVersion =
  compareVersions(currentVersion, lowest) >= 0 &&
  (firstExcluded === null || compareVersions(currentVersion, firstExcluded) < 0)

if (!rangeAdmitsCurrentVersion) {
  reportAndExit(
    `peer range "${declaredPeerRange}" in ${TEMPLATE_MANIFEST_PATH} does not admit ${PEER_PACKAGE_NAME} ${rootPackageVersion}.`,
    `Update it to "^${rootPackageVersion}" — until create-wcb is republished, ` +
      `\`npm create wcb@latest\` scaffolds projects pinned to the old range.`
  )
}

console.log(
  `check-create-release: ${TEMPLATE_MANIFEST_PATH} peer range "${declaredPeerRange}" ` +
    `admits ${PEER_PACKAGE_NAME} ${rootPackageVersion} — ok`
)
