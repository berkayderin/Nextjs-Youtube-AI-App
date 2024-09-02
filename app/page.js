'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Home() {
	const [url, setUrl] = useState('')
	const [loading, setLoading] = useState(false)
	const [result, setResult] = useState(null)
	const [error, setError] = useState('')

	const analyzeVideo = async () => {
		setLoading(true)
		setError('')
		setResult(null)

		try {
			// Fetch video info and transcription
			const infoResponse = await fetch('/api/video-info', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url })
			})
			const videoData = await infoResponse.json()

			if (!infoResponse.ok)
				throw new Error(
					videoData.error || 'Failed to fetch video info'
				)

			// Generate suggestions using Gemini
			const geminiResponse = await fetch('/api/gemini', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: videoData.title,
					description: videoData.description,
					transcription: videoData.transcription
				})
			})
			const suggestions = await geminiResponse.json()

			if (!geminiResponse.ok)
				throw new Error(
					suggestions.error || 'Failed to generate suggestions'
				)

			setResult({ videoData, suggestions })
		} catch (error) {
			setError(error.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<h2 className="text-2xl font-bold">YouTube Video Analyzer</h2>
			</CardHeader>
			<CardContent>
				<Input
					type="text"
					placeholder="Enter YouTube URL"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					className="mb-4"
				/>
				<Button onClick={analyzeVideo} disabled={loading}>
					{loading ? 'Analyzing...' : 'Analyze Video'}
				</Button>
				{error && <p className="text-red-500 mt-4">{error}</p>}
				{result && (
					<div className="mt-4">
						<h3 className="text-xl font-semibold">Results:</h3>
						<p>
							<strong>Original Title:</strong>{' '}
							{result.videoData.title}
						</p>
						<p>
							<strong>Suggested Title:</strong>{' '}
							{result.suggestions.title}
						</p>
						<p>
							<strong>Suggested Description:</strong>{' '}
							{result.suggestions.description}
						</p>
						<p>
							<strong>Suggested Keywords:</strong>{' '}
							{result.suggestions.keywords.join(', ')}
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
