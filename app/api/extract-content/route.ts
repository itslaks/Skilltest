import { requireManagerForApi } from '@/lib/rbac'
import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

export async function POST(request: NextRequest) {
  const auth = await requireManagerForApi()
  if (auth instanceof NextResponse) return auth

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const pastedText = formData.get('text') as string | null

    let extractedText = ''

    if (pastedText && pastedText.trim()) {
      // Direct text input
      extractedText = pastedText.trim()
    } else if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileName = file.name.toLowerCase()

      if (fileName.endsWith('.docx')) {
        // Extract text from DOCX
        const result = await mammoth.extractRawText({ buffer })
        extractedText = result.value
      } else if (fileName.endsWith('.pdf')) {
        // Extract text from PDF using pdf-parse
        const pdfParseModule = await import('pdf-parse')
        // @ts-ignore - handle both ESM and CJS exports
        const parser = pdfParseModule.default ?? pdfParseModule
        const pdfData = await parser(buffer)
        extractedText = pdfData.text
      } else if (fileName.endsWith('.txt')) {
        // Plain text file
        extractedText = buffer.toString('utf-8')
      } else {
        return NextResponse.json({ 
          error: 'Unsupported file type. Please upload PDF, DOCX, or TXT files.' 
        }, { status: 400 })
      }
    } else {
      return NextResponse.json({ 
        error: 'No content provided. Please upload a file or paste text.' 
      }, { status: 400 })
    }

    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json({ 
        error: 'Extracted content is too short. Please provide more content (at least 50 characters).' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      text: extractedText,
      wordCount: extractedText.split(/\s+/).length,
      charCount: extractedText.length,
    })

  } catch (error: any) {
    console.error('Content extraction error:', error)
    return NextResponse.json({ 
      error: `Failed to extract content: ${error.message}` 
    }, { status: 500 })
  }
}
