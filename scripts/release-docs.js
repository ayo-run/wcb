// Sibling of scripts/release.js, for the documentation site only.
//
// The production docs site builds from the `docs-release` branch, so it
// redeploys when this script force-syncs that branch to `main` — not on every
// push to `main`. There is no tag to watch and nothing to publish, so unlike
// `release` this is the whole job.
import { simpleGit } from 'simple-git'

const git = simpleGit()
const remote = 'gh'
const source = 'main'
const branch = 'docs-release'

const hash = await git.revparse([source])

console.log(`Fetch remote ${remote} repo`)
await git.fetch(remote)

// The commit being deployed is whatever local `main` points at, so say plainly
// when that is behind (or ahead of) the remote rather than quietly shipping it.
const remoteHash = await git
  .revparse(['--verify', `${remote}/${source}`])
  .catch(() => null)
if (remoteHash && remoteHash !== hash) {
  console.warn(
    `Warning: local ${source} (${hash}) does not match ${remote}/${source} (${remoteHash})`
  )
}

console.log(`Push ${source} (${hash}) to ${branch} branch`)
await git.push([remote, `${source}:${branch}`, '--force'])

console.log(`Done: ${remote}/${branch} now matches ${source}`)
