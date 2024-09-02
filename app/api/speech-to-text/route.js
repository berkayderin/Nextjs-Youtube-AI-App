import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import fs from 'fs'
import { pipeline } from 'stream'
import util from 'util'
import ytdl from 'ytdl-core'

const pipelineAsync = util.promisify(pipeline)
const execAsync = util.promisify(exec)

export async function POST(req) {
	try {
		const { url } = await req.json()

		if (!url) {
			return NextResponse.json(
				{ error: 'URL is required' },
				{ status: 400 }
			)
		}

		const audioStream = ytdl(url, { filter: 'audioonly' })
		const outputPath = './audio.mp3'
		await pipelineAsync(audioStream, fs.createWriteStream(outputPath))

		const { stdout, stderr } = await execAsync(
			`whisper ${outputPath} --model tiny --language en --output_format txt`
		)

		if (stderr) {
			console.error('Whisper stderr:', stderr)
		}

		const transcription = fs.readFileSync('audio.txt', 'utf8')

		fs.unlinkSync(outputPath)
		fs.unlinkSync('audio.txt')

		return NextResponse.json({ transcription })
	} catch (error) {
		console.error('Error in speech-to-text:', error)
		return NextResponse.json(
			{ error: 'Failed to convert speech to text' },
			{ status: 500 }
		)
	}
}
