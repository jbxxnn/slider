import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Starting Instagram integration diagnosis...')
    
    // Get current user
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    // Get user's Instagram integration
    const integration = await client.user.findUnique({
      where: { clerkId: user.id },
      select: {
        integrations: {
          where: { name: 'INSTAGRAM' },
          select: {
            token: true,
            instagramId: true,
            expiresAt: true,
            createdAt: true
          }
        }
      }
    })

    if (!integration?.integrations[0]) {
      return NextResponse.json({ 
        error: 'No Instagram integration found',
        diagnosis: 'User needs to connect Instagram account first'
      })
    }

    const token = integration.integrations[0].token
    const instagramId = integration.integrations[0].instagramId

    console.log('🔍 Found integration:', {
      hasToken: !!token,
      instagramId,
      expiresAt: integration.integrations[0].expiresAt
    })

    // Test token validity and type
    const tokenTests = []

    // Test 1: Check if it's a valid Instagram token
    try {
      const meResponse = await axios.get(`https://graph.instagram.com/me?access_token=${token}`)
      tokenTests.push({
        test: 'Instagram Graph API /me',
        status: 'success',
        data: meResponse.data
      })
    } catch (error: any) {
      tokenTests.push({
        test: 'Instagram Graph API /me',
        status: 'failed',
        error: error.response?.data || error.message
      })
    }

    // Test 2: Check if it's a Business Account
    try {
      const businessResponse = await axios.get(`https://graph.instagram.com/me?fields=account_type&access_token=${token}`)
      tokenTests.push({
        test: 'Account Type Check',
        status: 'success',
        data: businessResponse.data
      })
    } catch (error: any) {
      tokenTests.push({
        test: 'Account Type Check',
        status: 'failed',
        error: error.response?.data || error.message
      })
    }

    // Test 3: Check webhook subscriptions
    try {
      const subscriptionsResponse = await axios.get(`https://graph.facebook.com/v21.0/${instagramId}/subscribed_apps?access_token=${token}`)
      tokenTests.push({
        test: 'Webhook Subscriptions',
        status: 'success',
        data: subscriptionsResponse.data
      })
    } catch (error: any) {
      tokenTests.push({
        test: 'Webhook Subscriptions',
        status: 'failed',
        error: error.response?.data || error.message
      })
    }

    // Test 4: Check if we can access media (posts)
    try {
      const mediaResponse = await axios.get(`https://graph.instagram.com/me/media?fields=id,caption,media_type&limit=5&access_token=${token}`)
      tokenTests.push({
        test: 'Media Access',
        status: 'success',
        data: { count: mediaResponse.data.data?.length || 0 }
      })
    } catch (error: any) {
      tokenTests.push({
        test: 'Media Access',
        status: 'failed',
        error: error.response?.data || error.message
      })
    }

    return NextResponse.json({
      diagnosis: 'Instagram Integration Analysis',
      integration: {
        connected: true,
        instagramId,
        tokenExpiry: integration.integrations[0].expiresAt,
        connectedAt: integration.integrations[0].createdAt
      },
      tests: tokenTests,
      recommendations: [
        'Check if your Instagram account is a Business account',
        'Verify your Facebook app has Instagram Business API permissions',
        'Ensure your Instagram Business account is connected to a Facebook Page',
        'Check if webhook subscriptions are active'
      ],
      webhookUrl: `${process.env.NEXT_PUBLIC_HOST_URL}/api/webhook/instagram`,
      environment: {
        hasInstagramClientId: !!process.env.INSTAGRAM_CLIENT_ID,
        hasInstagramClientSecret: !!process.env.INSTAGRAM_CLIENT_SECRET,
        hasWebhookVerifyToken: !!process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN
      }
    })

  } catch (error) {
    console.error('❌ Diagnosis error:', error)
    return NextResponse.json({
      error: 'Diagnosis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
