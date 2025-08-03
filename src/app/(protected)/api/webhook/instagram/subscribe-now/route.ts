import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Auto-subscribing webhook with user\'s current token...')
    
    // Get current user and their Instagram integration
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const integration = await client.user.findUnique({
      where: { clerkId: user.id },
      select: {
        integrations: {
          where: { name: 'INSTAGRAM' },
          select: { token: true, instagramId: true }
        }
      }
    })

    if (!integration?.integrations[0]) {
      return NextResponse.json({ 
        error: 'No Instagram integration found',
        message: 'Connect Instagram account first'
      })
    }

    const token = integration.integrations[0].token
    const instagramId = integration.integrations[0].instagramId

    console.log('🔍 Using token and Instagram ID from database:', {
      hasToken: !!token,
      instagramId
    })

    // Try to subscribe to webhooks
    try {
      console.log('🔍 Attempting webhook subscription...')
      const subscribeResponse = await axios.post(
        `https://graph.facebook.com/v21.0/${instagramId}/subscribed_apps`,
        {
          subscribed_fields: 'comments,messages'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      console.log('✅ Webhook subscription successful:', subscribeResponse.data)
      
      return NextResponse.json({
        success: true,
        message: 'Webhook subscription successful!',
        data: subscribeResponse.data,
        testInstructions: [
          '🎉 Webhooks are now subscribed!',
          '1. Go to your Instagram post',
          '2. Comment with your automation keyword',
          '3. Check Vercel logs for webhook delivery',
          '4. Your automation should now trigger!'
        ],
        webhookUrl: `${process.env.NEXT_PUBLIC_HOST_URL}/api/webhook/instagram`,
        subscribedFields: ['comments', 'messages']
      })
      
    } catch (subscribeError: any) {
      console.log('❌ Webhook subscription failed:', subscribeError.response?.data)
      
      const errorData = subscribeError.response?.data
      const errorMessage = errorData?.error?.message || subscribeError.message
      
      return NextResponse.json({
        success: false,
        error: 'Webhook subscription failed',
        details: errorData,
        errorMessage,
        possibleCauses: [
          'Token lacks required permissions (most likely)',
          'Instagram account not connected to Facebook Page',
          'App not approved for webhook subscriptions',
          'Invalid Instagram Business Account ID'
        ],
        nextSteps: [
          'Check if your Instagram is connected to a Facebook Page',
          'Wait for Facebook Page permissions approval',
          'Try using Facebook Graph API Explorer manually'
        ],
        debugInfo: {
          instagramId,
          hasToken: !!token,
          tokenPreview: token ? `${token.substring(0, 10)}...` : 'none'
        }
      })
    }
    
  } catch (error) {
    console.error('❌ Auto-subscription error:', error)
    return NextResponse.json({
      error: 'Auto-subscription failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Auto Webhook Subscription Endpoint',
    description: 'This endpoint automatically uses your stored Instagram token to subscribe to webhooks',
    usage: 'Make a POST request to this endpoint (no body required)',
    note: 'This will attempt to subscribe your Instagram Business account to webhook events'
  })
}
