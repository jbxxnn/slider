'use server'

import { redirect } from 'next/navigation'
import { onCurrentUser } from '../user'
import { createIntegration, getIntegration } from './queries'
import { generateTokens } from '@/lib/fetch'
import axios from 'axios'

export const onOAuthInstagram = (strategy: 'INSTAGRAM' | 'CRM') => {
  if (strategy === 'INSTAGRAM') {
    return redirect(process.env.INSTAGRAM_EMBEDDED_OAUTH_URL as string)
  }
}

export const onIntegrate = async (code: string) => {
  console.log('🔵 Starting Instagram integration with code:', code ? 'Code exists' : 'No code')
  
  const user = await onCurrentUser()
  console.log('🔵 User found:', user ? `ID: ${user.id}` : 'No user found')

  try {
    const integration = await getIntegration(user.id)
    console.log('🔵 Integration query result:', {
      integration: integration ? 'Found' : 'Not found',
      integrationsArray: integration?.integrations,
      integrationsLength: integration?.integrations?.length,
      integrationType: typeof integration,
      integrationKeys: integration ? Object.keys(integration) : 'N/A'
    })

    // Check if integration exists and has integrations array
    if (!integration) {
      console.log('🔴 Integration is null/undefined - user not found in database')
      return { status: 404, error: 'User not found in database' }
    }

    if (!integration.integrations) {
      console.log('🔴 Integration.integrations is null/undefined')
      return { status: 500, error: 'Integrations array is null/undefined' }
    }

    console.log('🔵 Checking if user already has Instagram integration...')
    if (integration && integration.integrations.length === 0) {
      console.log('🔵 No existing Instagram integration found, proceeding with token generation...')
      
      const token = await generateTokens(code)
      console.log('🔵 Token generation result:', {
        tokenExists: !!token,
        tokenType: typeof token,
        tokenKeys: token ? Object.keys(token) : 'N/A'
      })

      if (token) {
        console.log('🔵 Fetching Instagram user ID...')
        const insta_id = await axios.get(
          `${process.env.INSTAGRAM_BASE_URL}/me?fields=user_id&access_token=${token.access_token}`
        )
        console.log('🔵 Instagram API response:', {
          status: insta_id.status,
          data: insta_id.data,
          userId: insta_id.data?.user_id
        })

        const today = new Date()
        const expire_date = today.setDate(today.getDate() + 60)
        console.log('🔵 Creating integration with expire date:', new Date(expire_date))
        
        const create = await createIntegration(
          user.id,
          token.access_token,
          new Date(expire_date),
          insta_id.data.user_id
        )
        console.log('🔵 Integration creation result:', create)
        
        return { status: 200, data: create }
      }
      console.log('🔴 Token generation failed')
      return { status: 401, error: 'Token generation failed' }
    } else {
      console.log('🔴 User already has Instagram integration, count:', integration.integrations.length)
      return { status: 404, error: 'User already has Instagram integration' }
    }
  } catch (error) {
    console.log('🔴 500 Error in onIntegrate:', {
      error: error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return { status: 500, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
