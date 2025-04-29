import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

// Create uploads directory if it doesn't exist
const uploadDir = join(process.cwd(), 'uploads')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Validate file type
    if (type === 'video' && !file.name.endsWith('.mp4')) {
      return NextResponse.json(
        { error: 'Invalid video file format. Only MP4 files are supported.' },
        { status: 400 }
      )
    }
    
    if (type === 'transcript' && !['txt', 'vtt', 'srt'].some(ext => file.name.endsWith(`.${ext}`))) {
      return NextResponse.json(
        { error: 'Invalid transcript file format. Only TXT, VTT, and SRT files are supported.' },
        { status: 400 }
      )
    }
    
    // Generate a unique file ID
    const fileId = uuidv4()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${fileId}.${fileExtension}`
    const filePath = join(uploadDir, fileName)
    
    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Write the file to disk
    await writeFile(filePath, buffer)
    
    // Store file metadata (in a real app, this would go to a database)
    const fileMetadata = {
      id: fileId,
      originalName: file.name,
      type,
      path: filePath,
      uploadedAt: new Date().toISOString()
    }
    
    // In a real application, you would save this metadata to a database
    // For now, we'll just return it
    return NextResponse.json({
      success: true,
      fileId,
      fileName: file.name,
      type
    })
  } catch (error) {
    console.error('Error handling file upload:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
