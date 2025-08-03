import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Testing Facebook Page API calls to unlock permissions...')
    
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
    const testResults = []

    // Test 1: Try to get user's Facebook pages (this should work with current token)
    try {
      console.log('🔍 Test 1: Getting Facebook pages...')
      const pagesResponse = await axios.get(
        `https://graph.facebook.com/v21.0/me/accounts?access_token=${token}`
      )
      
      testResults.push({
        test: 'Get Facebook Pages',
        status: 'success',
        data: pagesResponse.data,
        message: 'Successfully retrieved Facebook pages'
      })

      // If we have pages, try to make API calls with page tokens
      if (pagesResponse.data.data && pagesResponse.data.data.length > 0) {
        const page = pagesResponse.data.data[0]
        const pageToken = page.access_token
        const pageId = page.id

        // Test 2: Try to get page info (tests pages_read_engagement)
        try {
          console.log('🔍 Test 2: Getting page info...')
          const pageInfoResponse = await axios.get(
            `https://graph.facebook.com/v21.0/${pageId}?fields=name,category,fan_count&access_token=${pageToken}`
          )
          
          testResults.push({
            test: 'Page Info Access (pages_read_engagement)',
            status: 'success',
            data: pageInfoResponse.data,
            message: 'Successfully accessed page information'
          })
        } catch (pageInfoError: any) {
          testResults.push({
            test: 'Page Info Access (pages_read_engagement)',
            status: 'failed',
            error: pageInfoError.response?.data || pageInfoError.message,
            message: 'Need pages_read_engagement permission'
          })
        }

        // Test 3: Try to get page's Instagram account (tests pages_manage_metadata)
        try {
          console.log('🔍 Test 3: Getting Instagram business account...')
          const igBusinessResponse = await axios.get(
            `https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
          )
          
          testResults.push({
            test: 'Instagram Business Account (pages_manage_metadata)',
            status: 'success',
            data: igBusinessResponse.data,
            message: 'Successfully accessed Instagram business account info'
          })
        } catch (igBusinessError: any) {
          testResults.push({
            test: 'Instagram Business Account (pages_manage_metadata)',
            status: 'failed',
            error: igBusinessError.response?.data || igBusinessError.message,
            message: 'Need pages_manage_metadata permission'
          })
        }

        // Test 4: Try to check messaging capabilities (tests pages_messaging)
        try {
          console.log('🔍 Test 4: Checking messaging capabilities...')
          const messagingResponse = await axios.get(
            `https://graph.facebook.com/v21.0/${pageId}/messaging_feature_review?access_token=${pageToken}`
          )
          
          testResults.push({
            test: 'Messaging Capabilities (pages_messaging)',
            status: 'success',
            data: messagingResponse.data,
            message: 'Successfully accessed messaging features'
          })
        } catch (messagingError: any) {
          testResults.push({
            test: 'Messaging Capabilities (pages_messaging)',
            status: 'failed',
            error: messagingError.response?.data || messagingError.message,
            message: 'Need pages_messaging permission'
          })
        }
      }
    } catch (pagesError: any) {
      testResults.push({
        test: 'Get Facebook Pages',
        status: 'failed',
        error: pagesError.response?.data || pagesError.message,
        message: 'Cannot access Facebook pages - may need to update OAuth scope first'
      })
    }

    // Count successful vs failed tests
    const successCount = testResults.filter(r => r.status === 'success').length
    const failCount = testResults.filter(r => r.status === 'failed').length

    return NextResponse.json({
      message: 'Permission test API calls completed',
      summary: {
        total: testResults.length,
        successful: successCount,
        failed: failCount,
        readyForPermissionRequest: successCount > 0
      },
      tests: testResults,
      nextSteps: successCount > 0 
        ? [
            'Wait up to 24 hours for Facebook to enable permission requests',
            'Go to Facebook Developer Console > App Review > Permissions and Features',
            'Request advanced access for the failed permissions',
            'After approval, re-authenticate your Instagram account'
          ]
        : [
            'Update your OAuth scope to include basic page permissions first',
            'Re-authenticate your Instagram account',
            'Run this test again'
          ],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Permission test error:', error)
    return NextResponse.json({
      error: 'Permission test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
