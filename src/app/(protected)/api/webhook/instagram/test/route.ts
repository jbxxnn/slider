import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  console.log('🔍 Test endpoint accessed')
  return NextResponse.json({
    message: 'Webhook test endpoint is working!',
    timestamp: new Date().toISOString(),
    url: req.url
  })
}

export async function POST(req: NextRequest) {
  console.log('🔍 Test POST endpoint accessed')
  const body = await req.json()
  
  return NextResponse.json({
    message: 'Test webhook received!',
    timestamp: new Date().toISOString(),
    receivedData: body
  })
} 