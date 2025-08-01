'use server'

import { redirect } from 'next/navigation'
import { onCurrentUser } from '../user'
import { createIntegration, getIntegration } from './queries'
import { generateTokens } from '@/lib/fetch'
import axios from 'axios'

// Retry function for database operations
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.log(`🔴 Attempt ${attempt} failed:`, error)
      
      // If it's a database connection error and we have retries left, wait and retry
      if (error instanceof Error && 
          error.message.includes('prepared statement') && 
          attempt < maxRetries) {
        console.log(`🔵 Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
        continue
      }
      
      // For other errors or final attempt, throw the error
      throw error
    }
  }
  
  throw lastError!
}

export const onOAuthInstagram = (strategy: 'INSTAGRAM' | 'CRM') => {
  if (strategy === 'INSTAGRAM') {
    return redirect(process.env.INSTAGRAM_EMBEDDED_OAUTH_URL as string)
  }
}

export const onIntegrate = async (code: string) => {
  const user = await onCurrentUser()

  try {
    console.log('🔵 Getting current user from Clerk...')
    console.log('🔵 Clerk user result:', {
      userExists: !!user,
      userId: user?.id,
      userEmail: user?.emailAddresses?.[0]?.emailAddress
    })
    console.log('🔵 User found: ID:', user.id)

    console.log('🔵 Querying database for user integrations, clerkId:', user.id)
    
    // Use retry mechanism for database operations
    const integration = await retryOperation(() => getIntegration(user.id))
    
    console.log('🔵 Database query result:', {
      resultExists: !!integration,
      resultType: typeof integration,
      integrationsArray: integration?.integrations || [],
      integrationsLength: integration?.integrations?.length || 0,
      resultKeys: integration ? Object.keys(integration) : []
    })

    if (integration && integration.integrations.length === 0) {
      console.log('🔵 No existing Instagram integration found, proceeding with token generation...')
      console.log('🔵 Starting token generation with code:', code.substring(0, 10) + '...')
      
      const token = await generateTokens(code)
      console.log('🔵 Token generation result:', { tokenExists: !!token, tokenType: typeof token, tokenKeys: token ? Object.keys(token) : 'N/A' })

      if (token) {
        console.log('🔵 Token generated successfully, getting Instagram user ID...')
        const insta_id = await axios.get(
          `${process.env.INSTAGRAM_BASE_URL}/me?fields=user_id&access_token=${token.access_token}`
        )

        const today = new Date()
        const expire_date = today.setDate(today.getDate() + 60)
        
        console.log('🔵 Creating integration in database...')
        
        // Use retry mechanism for database creation
        const create = await retryOperation(() => 
          createIntegration(
            user.id,
            token.access_token,
            new Date(expire_date),
            insta_id.data.user_id
          )
        )
        
        console.log('🔵 Integration created successfully:', create)
        return { status: 200, data: create }
      }
      console.log('🔴 Token generation failed')
      return { status: 401, hasData: false, error: 'Token generation failed' }
    }
    console.log('🔴 User already has integrations')
    return { status: 404, hasData: false, error: 'User already has integrations' }
  } catch (error) {
    console.log('🔴 500', error)
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('prepared statement')) {
      console.log('🔴 Database connection error detected, this might be a temporary issue')
      return { status: 503, hasData: false, error: 'Database connection temporarily unavailable. Please try again.' }
    }
    
    return { status: 500, hasData: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
