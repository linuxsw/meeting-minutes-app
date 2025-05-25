import { NextRequest, NextResponse } from 'next/server'
import type { RouteHandlerContext } from 'next/dist/server/web/types'

export async function GET(
  req: NextRequest,
  context: RouteHandlerContext<{ documentId: string }>
): Promise<NextResponse> {
  const { documentId } = context.params
  const searchParams = req.nextUrl.searchParams
  const format = searchParams.get('format') || 'pdf'

  if (!documentId) {
    return NextResponse.json(
      { error: 'Document ID is required' },
      { status: 400 }
    )
  }

  let content = ''
  let contentType = ''
  let fileExtension = ''

  switch (format) {
    case 'pdf':
      content = 'Sample PDF content'
      contentType = 'application/pdf'
      fileExtension = 'pdf'
      break
    case 'word':
      content = 'Sample Word document content'
      contentType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      fileExtension = 'docx'
      break
    case 'html':
      content = `<!DOCTYPE html>
<html>
<head>
  <title>Meeting Minutes</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #333; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; }
  </style>
</head>
<body>
  <h1>Meeting Minutes</h1>
  <div class="section">
    <div class="section-title">Date:</div>
    <div>${new Date().toLocaleDateString()}</div>
  </div>
  <div class="section">
    <div class="section-title">Attendees:</div>
    <div>John Doe, Jane Smith, Bob Johnson</div>
  </div>
  <div class="section">
    <div class="section-title">Agenda:</div>
    <div>1. Project updates<br>2. Timeline review<br>3. Action items</div>
  </div>
  <div class="section">
    <div class="section-title">Discussion:</div>
    <div>Sample discussion content would appear here based on the transcript.</div>
  </div>
  <div class="section">
    <div class="section-title">Action Items:</div>
    <div>- John to complete task A by Friday<br>- Jane to review document B<br>- Bob to schedule follow-up meeting</div>
  </div>
</body>
</html>`
      contentType = 'text/html'
      fileExtension = 'html'
      break
    default:
      content = `Meeting Minutes
Date: ${new Date().toLocaleDateString()}
Attendees: John Doe, Jane Smith, Bob Johnson

Agenda:
1. Project updates
2. Timeline review
3. Action items

Discussion:
Sample discussion content would appear here based on the transcript.

Action Items:
- John to complete task A by Friday
- Jane to review document B
- Bob to schedule follow-up meeting`
      contentType = 'text/plain'
      fileExtension = 'txt'
  }

  const headers = new Headers()
  headers.set('Content-Type', contentType)
  headers.set(
    'Content-Disposition',
    `attachment; filename="meeting-minutes-${documentId}.${fileExtension}"`
  )

  return new NextResponse(content, {
    status: 200,
    headers
  })
}
