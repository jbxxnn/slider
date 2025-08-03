import { client } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Simple webhook activity logger
export async function GET(req: NextRequest) {
  try {
    // Get recent webhook activity from database if you want to store logs
    // For now, just return a simple status
    
    return NextResponse.json({
      message: 'Webhook logs endpoint active',
      timestamp: new Date().toISOString(),
      instructions: {
        vercelLogs: 'Check Vercel Dashboard > Functions > api/webhook/instagram for real-time logs',
        testWebhook: 'POST to /api/webhook/instagram/test to test webhook reception',
        debugInfo: 'GET /api/webhook/instagram/debug for webhook status'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasInstagramClientId: !!process.env.INSTAGRAM_CLIENT_ID,
        hasInstagramClientSecret: !!process.env.INSTAGRAM_CLIENT_SECRET,
        hasInstagramBaseUrl: !!process.env.INSTAGRAM_BASE_URL,
        webhookUrl: `${process.env.NEXT_PUBLIC_HOST_URL}/api/webhook/instagram`
      }
    })
  } catch (error) {
    console.error('❌ Logs endpoint error:', error)
    return NextResponse.json({
      error: 'Failed to fetch logs',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Log webhook activity (you can call this from your main webhook)
export async function POST(req: NextRequest) {
  try {
    const logData = await req.json()
    
    console.log('📝 Webhook Activity Log:', {
      timestamp: new Date().toISOString(),
      ...logData
    })
    
    return NextResponse.json({
      message: 'Log recorded',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Failed to log webhook activity:', error)
    return NextResponse.json({
      error: 'Failed to log activity'
    }, { status: 500 })
  }
}
