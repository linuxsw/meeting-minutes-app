'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProcessedTranscript } from '@/lib/transcript-processor'

// This component handles the connection between test page and processing page
export default function ProcessingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  
  useEffect(() => {
    // Check if we have test data in sessionStorage
    const testTranscriptJson = sessionStorage.getItem('testTranscript')
    
    if (!testTranscriptJson) {
      // If no test data, redirect to home
      router.push('/')
      return
    }
    
    // This is a client component, so we can't directly render another component
    // The layout will render the children (processing page) with the transcript data available
    
  }, [router])
  
  return (
    <>{children}</>
  )
}
