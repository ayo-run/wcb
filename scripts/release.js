// Forked from https://github.com/elk-zone/elk/blob/main/scripts/release.ts
//
// Runs after `bumpp` in `pnpm release`. It pushes the tag `bumpp` just made —
// that tag push is what triggers .github/workflows/release.yml, which is what
// actually publishes to npm — and force-syncs the `release` branch to whatever
// is now on npm's `latest`.
//
// `release` means "the commit behind the current `latest`": the marker for what
// someone running `npm i web-component-base` actually has. It must never point
// at anything they would not get. (The docs site builds from `v6`, not from
// here — see docs/README.md.)
//
// Three rules follow from that, plus `main` tracking the next major while the
// current major ships from its own maintenance line:
//
//   1. It mirrors HEAD, not `main`. Cutting a v6 patch from the `v6` branch
//      used to force-push v7's `main` onto `release`, and then leave you
//      checked out on `main` rather than the branch you released from.
//   2. It only mirrors when this release actually takes `latest`. A prerelease
//      publishes to `beta`/`rc`/…, so `latest` is unchanged and `release` must
//      stay where it is.
//   3. It refuses to release a stable version from `main`, because the publish
//      workflow derives the dist-tag from the version alone: anything without a
//      prerelease suffix goes to `latest`, in front of every
//      `npm i web-component-base` user.
//
// The push is a plain refspec rather than a local `release` branch on purpose:
// a temp branch by that name collides with any `release/*` branch (git cannot
// have both a ref and a directory at `refs/heads/release`), and a failed
// checkout leaves the working tree swapped to the old release commit.
import { readFileSync } from 'node:fs'
import { simpleGit } from 'simple-git'

const git = simpleGit()
const remote = 'gh'
const releaseBranch = 'release'
// The branch tracking the next major — the one whose releases must never reach
// `latest` by accident.
const nextMajorBranch = 'main'

const branch = (await git.revparse(['--abbrev-ref', 'HEAD'])).trim()
const hash = await git.revparse(['HEAD'])

if (branch === 'HEAD') {
  console.error(
    'Refusing to release from a detached HEAD — check out the branch you mean to release first.'
  )
  process.exit(1)
}

const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
)

// Mirrors the dist-tag rule in .github/workflows/release.yml: strip everything
// up to the first `-`, then everything from the first `.`, so `7.0.0-beta.0`
// publishes to `beta` and a bare `7.0.0` publishes to `latest`. Keep the two in
// step — the workflow is the one that actually runs `npm publish --tag`.
const distTag = version.includes('-')
  ? version.slice(version.indexOf('-') + 1).split('.')[0]
  : 'latest'

if (
  branch === nextMajorBranch &&
  distTag === 'latest' &&
  !process.env.ALLOW_LATEST_FROM_MAIN
) {
  console.error(
    `Refusing to release ${version} from ${nextMajorBranch}: it carries no prerelease
suffix, so the publish workflow would put it on npm's 'latest' dist-tag, in
front of every consumer of the current major.

${nextMajorBranch} tracks the next major. Release a prerelease from it instead
(e.g. 7.0.0-beta.1), or cut this release from the maintenance line.

Nothing has been pushed, but bumpp has already committed and tagged ${version}
locally. Undo that with:

  git tag -d v${version} && git reset --hard HEAD~1

If the next major really is ready to become 'latest', re-run with
ALLOW_LATEST_FROM_MAIN=1.`
  )
  process.exit(1)
}

console.log(
  `Releasing ${version} from ${branch} (${hash}) to dist-tag '${distTag}'`
)

// `release` tracks `latest`, so a prerelease must leave it alone — it is still
// describing the last stable release, which is what consumers are installing.
if (distTag === 'latest') {
  console.log(`Push ${branch} (${hash}) to ${releaseBranch} branch`)
  await git.push([remote, `HEAD:refs/heads/${releaseBranch}`, '--force'])
} else {
  console.log(
    `Leaving ${releaseBranch} alone: ${version} publishes to '${distTag}', not 'latest'`
  )
}

// TODO: handle multiple remotes with a data structure
console.log('Push tags')
await git.push(['--tags', remote])
