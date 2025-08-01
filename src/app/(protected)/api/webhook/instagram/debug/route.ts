import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const hubMode = req.nextUrl.searchParams.get('hub.mode')
  const hubChallenge = req.nextUrl.searchParams.get('hub.challenge')
  const hubVerifyToken = req.nextUrl.searchParams.get('hub.verify_token')
  
  console.log('🔍 Debug endpoint accessed with params:', {
    hubMode,
    hubChallenge,
    hubVerifyToken
  })
  
  // If this is a webhook verification request
  if (hubMode === 'subscribe' && hubChallenge) {
    console.log('✅ Webhook verification successful')
    return new NextResponse(hubChallenge)
  }
  
  return NextResponse.json({
    message: 'Debug endpoint working',
    webhookVerification: {
      mode: hubMode,
      challenge: hubChallenge,
      verifyToken: hubVerifyToken
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasInstagramBaseUrl: !!process.env.INSTAGRAM_BASE_URL,
      hasInstagramClientId: !!process.env.INSTAGRAM_CLIENT_ID
    },
    timestamp: new Date().toISOString()
  })
} 