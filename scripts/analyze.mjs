import semanticRelease from 'semantic-release'
import { writeFileSync } from 'fs'
import { execSync } from 'child_process'

const getReleaseData = async () => {
	const meta = await semanticRelease({
		dryRun: true,
		ci: false,
		branches: ['main', 'release'],
	})

	if (!meta) return
	return meta.nextRelease
}

const writeArtifacts = async () => {
	const data = await getReleaseData()
	if (!data) {
		console.log('')
		return
	}

	execSync(`npm version --no-git-tag-version --allow-same-version=true ${data.version}`)
	writeFileSync('CHANGELOG.md', data.notes)
	console.log(data.version)
}

writeArtifacts()
