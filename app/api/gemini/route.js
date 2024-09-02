import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(req) {
	try {
		const { title, description, transcription } = await req.json()

		if (!title || !description) {
			return NextResponse.json(
				{ error: 'Title and description are required' },
				{ status: 400 }
			)
		}

		const model = genAI.getGenerativeModel({
			model: 'gemini-1.5-pro'
		})

		const prompt = `
    Analyze the following YouTube video information and suggest:
    1. An engaging YouTube title (max 100 characters)
    2. A compelling description (5-6 sentences)
    3. 5-7 relevant keywords or tags

    Original Title: ${title}
    Original Description: ${description}
    Transcription: ${transcription || 'Not available'}

    Please format your response as JSON with the following structure:
    {
      "title": "Suggested title",
      "description": "Suggested description",
      "keywords": ["keyword1", "keyword2", "..."]
    }
    `

		const result = await model.generateContent(prompt)
		const response = result.response
		const generatedText = response.text()

		const suggestions = JSON.parse(generatedText)

		return NextResponse.json(suggestions)
	} catch (error) {
		console.error('Error in Gemini API:', error)
		return NextResponse.json(
			{ error: 'Failed to generate suggestions' },
			{ status: 500 }
		)
	}
}
