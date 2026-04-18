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

    extractedText = cleanExtractedText(extractedText)

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json({ 
        error: 'Extracted content is too short. Please provide more content (at least 50 characters).' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      text: extractedText,
      wordCount: extractedText.split(/\s+/).length,
      charCount: extractedText.length,
      lineCount: extractedText.split('\n').filter(Boolean).length,
    })

  } catch (error: any) {
    console.error('Content extraction error:', error)
    return NextResponse.json({ 
      error: `Failed to extract content: ${error.message}` 
    }, { status: 500 })
  }
}

function cleanExtractedText(text: string) {
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/-\n(?=[a-z])/g, '')
    .replace(/[ \t]*\n[ \t]*/g, '\n')

  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const repeated = new Map<string, number>()
  for (const line of lines) {
    repeated.set(line, (repeated.get(line) || 0) + 1)
  }

  return lines
    .filter((line) => {
      const lower = line.toLowerCase()
      if (/^page\s+\d+(\s+of\s+\d+)?$/i.test(line)) return false
      if (/^\d+$/.test(line)) return false
      if ((repeated.get(line) || 0) > 2 && line.length < 80) return false
      return !['confidential', 'draft'].includes(lower)
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
