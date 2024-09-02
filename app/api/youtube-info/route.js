import { NextResponse } from 'next/server'
import ytdl from 'ytdl-core'

export async function POST(req) {
	try {
		const { url } = await req.json()

		if (!url) {
			return NextResponse.json(
				{ error: 'URL is required' },
				{ status: 400 }
			)
		}

		const videoInfo = await ytdl.getInfo(url)
		const videoDetails = videoInfo.videoDetails

		return NextResponse.json({
			title: videoDetails.title,
			description: videoDetails.description,
			lengthSeconds: videoDetails.lengthSeconds,
			videoId: videoDetails.videoId
		})
	} catch (error) {
		console.error('Error fetching YouTube video info:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch video info' },
			{ status: 500 }
		)
	}
}
