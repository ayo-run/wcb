// forked from https://github.com/elk-zone/elk/blob/main/scripts/release.ts
import { simpleGit } from 'simple-git'

const git = simpleGit()
const hash = await git.revparse(['main'])
const remote = 'gh'

console.log('Fetch remote gh repo')
await git.fetch(remote)

console.log('Checkout release branch')
await git.checkout(['-b', 'release', '--track', 'gh/release'])

console.log(`Reset to main branch (${hash})`)
await git.reset(['--hard', hash])

console.log('Push to release branch')
await git.push(['--force', remote])

console.log('Checkout main branch')
await git.checkout('main')

console.log('Deleting local release branch')
await git.branch(['-D', 'release'])

// TODO: handle multiple remotes with a data structure
console.log('Push tags')
await git.push(['--tags', remote])
