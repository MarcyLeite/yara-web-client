import semanticRelease from 'semantic-release'
import { writeFileSync } from 'fs'

const getReleaseData = async () => {
	const meta = await semanticRelease({ dryRun: true, ci: false, branches: ['main'] })

	if (!meta) return
	return meta.nextRelease
}

const writeArtifacts = async () => {
	const data = await getReleaseData()
	if (!data) return

	writeFileSync('version', data.version)
	writeFileSync('notes', data.notes)
}

writeArtifacts()
