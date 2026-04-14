import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

/**
 * API endpoint to extract text content from uploaded files (PDF, DOCX)
 * or process pasted text for question generation
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Verify manager role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'manager' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

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
