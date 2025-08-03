import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: NextRequest) {
  try {
    const { instagramBusinessId, accessToken } = await req.json()
    
    if (!instagramBusinessId || !accessToken) {
      return NextResponse.json({
        error: 'Missing required parameters',
        required: ['instagramBusinessId', 'accessToken']
      }, { status: 400 })
    }

    console.log('🔍 Attempting manual webhook subscription...')
    
    // Try to subscribe to webhooks manually
    try {
      const subscribeResponse = await axios.post(
        `https://graph.facebook.com/v21.0/${instagramBusinessId}/subscribed_apps`,
        {
          subscribed_fields: 'comments,messages'
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      console.log('✅ Manual subscription successful:', subscribeResponse.data)
      
      return NextResponse.json({
        success: true,
        message: 'Webhook subscription successful',
        data: subscribeResponse.data,
        nextSteps: [
          'Test by commenting on your Instagram post',
          'Check Vercel logs for webhook delivery',
          'If this works, you may not need additional permissions'
        ]
      })
      
    } catch (subscribeError: any) {
      console.log('❌ Manual subscription failed:', subscribeError.response?.data)
      
      return NextResponse.json({
        success: false,
        error: 'Manual subscription failed',
        details: subscribeError.response?.data || subscribeError.message,
        alternatives: [
          'Wait for Facebook Page permissions approval',
          'Try using Facebook Graph API Explorer to subscribe manually',
          'Check if your Instagram account is properly connected to a Facebook Page'
        ]
      })
    }
    
  } catch (error) {
    console.error('❌ Manual subscription error:', error)
    return NextResponse.json({
      error: 'Manual subscription failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Manual Webhook Subscription Endpoint',
    instructions: {
      method: 'POST',
      body: {
        instagramBusinessId: 'Your Instagram Business Account ID',
        accessToken: 'Your current Instagram access token'
      },
      example: {
        instagramBusinessId: '17841409813859177',
        accessToken: 'slide'
      }
    },
    note: 'This attempts to manually subscribe to webhooks without waiting for Page permissions'
  })
}
