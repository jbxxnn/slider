import axios from 'axios'

// Updated token generation that includes Page Access Token for webhooks
export const generateTokensWithPageAccess = async (code: string) => {
  console.log('🔍 generateTokensWithPageAccess called with code:', code)
  
  try {
    // Step 1: Exchange code for short-lived token
    const insta_form = new FormData()
    insta_form.append('client_id', process.env.INSTAGRAM_CLIENT_ID!)
    insta_form.append('client_secret', process.env.INSTAGRAM_CLIENT_SECRET!)
    insta_form.append('grant_type', 'authorization_code')
    insta_form.append('redirect_uri', `${process.env.NEXT_PUBLIC_HOST_URL}/callback/instagram`)
    insta_form.append('code', code)

    const token = await axios.post(process.env.INSTAGRAM_TOKEN_URL!, insta_form)
    console.log('🔍 Short token response:', token.data)

    if (token.data.access_token) {
      // Step 2: Exchange for long-lived token
      const long_token = await axios.get(
        `${process.env.INSTAGRAM_BASE_URL}/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${token.data.access_token}`
      )
      console.log('🔍 Long token response:', long_token.data)

      // Step 3: Get user's Facebook Pages (required for webhooks)
      try {
        const pagesResponse = await axios.get(
          `https://graph.facebook.com/v21.0/me/accounts?access_token=${long_token.data.access_token}`
        )
        console.log('🔍 User pages:', pagesResponse.data)

        if (pagesResponse.data.data && pagesResponse.data.data.length > 0) {
          // Get the first page's access token (you might want to let user choose)
          const pageAccessToken = pagesResponse.data.data[0].access_token
          const pageId = pagesResponse.data.data[0].id

          console.log('🔍 Page access token obtained for page:', pageId)

          // Step 4: Get Instagram Business Account ID connected to this page
          try {
            const igBusinessResponse = await axios.get(
              `https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
            )
            console.log('🔍 Instagram business account:', igBusinessResponse.data)

            const instagramBusinessId = igBusinessResponse.data.instagram_business_account?.id

            return {
              access_token: long_token.data.access_token,
              expires_in: long_token.data.expires_in,
              instagram_business_id: instagramBusinessId,
              page_access_token: pageAccessToken,
              page_id: pageId,
              token_type: 'instagram_business_with_page'
            }
          } catch (igBusinessError) {
            console.log('🔴 Error getting Instagram business account:', igBusinessError)
            // Return regular token if page connection fails
            return {
              access_token: long_token.data.access_token,
              expires_in: long_token.data.expires_in,
              token_type: 'instagram_business_only'
            }
          }
        } else {
          console.log('🔴 No Facebook pages found')
          return {
            access_token: long_token.data.access_token,
            expires_in: long_token.data.expires_in,
            token_type: 'instagram_business_only'
          }
        }
      } catch (pageError) {
        console.log('🔴 Error getting pages:', pageError)
        return {
          access_token: long_token.data.access_token,
          expires_in: long_token.data.expires_in,
          token_type: 'instagram_business_only'
        }
      }
    }

    return null
  } catch (error) {
    console.log('🔴 Error in token generation:', error)
    return null
  }
}

// Test webhook subscription with proper token
export const testWebhookSubscription = async (instagramBusinessId: string, pageAccessToken: string) => {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v21.0/${instagramBusinessId}/subscribed_apps?access_token=${pageAccessToken}`
    )
    console.log('🔍 Webhook subscription test result:', response.data)
    return response.data
  } catch (error: any) {
    console.log('🔴 Webhook subscription test failed:', error.response?.data || error.message)
    return null
  }
}
