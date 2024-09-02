import { NextResponse } from 'next/server'
import { google } from 'googleapis'

const youtube = google.youtube({
	version: 'v3',
	auth: process.env.YOUTUBE_API_KEY
})

export async function POST(req) {
	try {
		const { url } = await req.json()

		if (!url) {
			return NextResponse.json(
				{ error: 'URL is required' },
				{ status: 400 }
			)
		}

		// Extract video ID from URL
		const videoId = new URL(url).searchParams.get('v')

		if (!videoId) {
			return NextResponse.json(
				{ error: 'Invalid YouTube URL' },
				{ status: 400 }
			)
		}

		// Fetch video details
		const videoResponse = await youtube.videos.list({
			part: ['snippet', 'contentDetails'],
			id: [videoId]
		})

		const videoInfo = videoResponse.data.items?.[0]

		if (!videoInfo) {
			return NextResponse.json(
				{ error: 'Video not found' },
				{ status: 404 }
			)
		}

		// Fetch captions (if available)
		const captionsResponse = await youtube.captions.list({
			part: ['snippet'],
			videoId: videoId
		})

		let transcription = ''

		if (
			captionsResponse.data.items &&
			captionsResponse.data.items.length > 0
		) {
			const captionTrack = captionsResponse.data.items.find(
				(item) => item.snippet?.language === 'en'
			)
			if (captionTrack) {
				const captionResponse = await youtube.captions.download({
					id: captionTrack.id ? captionTrack.id : null
				})
				transcription = captionResponse.data
			}
		}

		return NextResponse.json({
			title: videoInfo.snippet?.title,
			description: videoInfo.snippet?.description,
			transcription: transcription || 'Transcription not available'
		})
	} catch (error) {
		console.error('Error fetching video info:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch video information' },
			{ status: 500 }
		)
	}
}
