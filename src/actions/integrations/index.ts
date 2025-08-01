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
  console.log('🔍 onIntegrate called with code:', code)
  
  try {
    console.log('🔍 Getting current user...')
    const user = await onCurrentUser()
    console.log('🔍 Current user:', user ? { id: user.id, name: user.firstName } : 'null')

    console.log('🔍 Getting integration for user...')
    const integration = await getIntegration(user.id)
    console.log('🔍 Integration result:', integration)

    if (integration && integration.integrations.length === 0) {
      console.log('🔍 No existing integrations, generating tokens...')
      const token = await generateTokens(code)
      console.log('🔍 Token result:', token)

      if (token) {
        console.log('🔍 Token received, getting Instagram user ID...')
        try {
          const insta_id = await axios.get(
            `${process.env.INSTAGRAM_BASE_URL}/me?fields=user_id&access_token=${token.access_token}`
          )
          console.log('🔍 Instagram user ID response:', insta_id.data)
          
          if (!insta_id.data || !insta_id.data.user_id) {
            console.log('🔴 No user_id in Instagram response:', insta_id.data)
            return { status: 500 }
          }

          const today = new Date()
          const expire_date = today.setDate(today.getDate() + 60)
          console.log('🔍 Creating integration...')
          const create = await createIntegration(
            user.id,
            token.access_token,
            new Date(expire_date),
            insta_id.data.user_id
          )
          console.log('🔍 Integration created:', create)
          return { status: 200, data: create }
        } catch (instaError) {
          console.log('🔴 Error getting Instagram user ID:', instaError)
          return { status: 500 }
        }
      }
      console.log('🔴 401 - No token received')
      return { status: 401 }
    }
    console.log('🔴 404 - Integration already exists or user not found')
    return { status: 404 }
  } catch (error) {
    console.log('🔴 500 - Error in onIntegrate:', error)
    console.log('🔴 Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return { status: 500 }
  }
}
