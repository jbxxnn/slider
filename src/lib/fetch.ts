import axios from 'axios'

export const refreshToken = async (token: string) => {
  const refresh_token = await axios.get(
    `${process.env.INSTAGRAM_BASE_URL}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`
  )

  return refresh_token.data
}

export const sendDM = async (
  userId: string,
  recieverId: string,
  prompt: string,
  token: string
) => {
  console.log('sending message')
  return await axios.post(
    `${process.env.INSTAGRAM_BASE_URL}/v21.0/${userId}/messages`,
    {
      recipient: {
        id: recieverId,
      },
      message: {
        text: prompt,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )
}

export const sendPrivateMessage = async (
  userId: string,
  recieverId: string,
  prompt: string,
  token: string
) => {
  console.log('sending message')
  return await axios.post(
    `${process.env.INSTAGRAM_BASE_URL}/${userId}/messages`,
    {
      recipient: {
        comment_id: recieverId,
      },
      message: {
        text: prompt,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )
}


export const generateTokens = async (code: string) => {
  console.log('🔍 generateTokens called with code:', code)
  console.log('🔍 Environment variables check:')
  console.log('🔍 INSTAGRAM_CLIENT_ID:', process.env.INSTAGRAM_CLIENT_ID ? 'Set' : 'Not set')
  console.log('🔍 INSTAGRAM_CLIENT_SECRET:', process.env.INSTAGRAM_CLIENT_SECRET ? 'Set' : 'Not set')
  console.log('🔍 INSTAGRAM_TOKEN_URL:', process.env.INSTAGRAM_TOKEN_URL ? 'Set' : 'Not set')
  console.log('🔍 NEXT_PUBLIC_HOST_URL:', process.env.NEXT_PUBLIC_HOST_URL ? 'Set' : 'Not set')
  
  const insta_form = new FormData()
  insta_form.append('client_id', process.env.INSTAGRAM_CLIENT_ID as string)

  insta_form.append(
    'client_secret',
    process.env.INSTAGRAM_CLIENT_SECRET as string
  )
  insta_form.append('grant_type', 'authorization_code')
  insta_form.append(
    'redirect_uri',
    `${process.env.NEXT_PUBLIC_HOST_URL}/callback/instagram`
  )
  insta_form.append('code', code)

  console.log('🔍 Making token request to:', process.env.INSTAGRAM_TOKEN_URL)
  try {
    const shortTokenRes = await fetch(process.env.INSTAGRAM_TOKEN_URL as string, {
      method: 'POST',
      body: insta_form,
    })

    console.log('🔍 Token response status:', shortTokenRes.status)
    
    if (!shortTokenRes.ok) {
      console.log('🔴 Token request failed with status:', shortTokenRes.status)
      const errorText = await shortTokenRes.text()
      console.log('🔴 Error response:', errorText)
      return null
    }
    
    const token = await shortTokenRes.json()
    console.log('🔍 Token response:', token)
    
    // Check if token has the expected structure
    if (!token) {
      console.log('🔴 Token is null or undefined')
      return null
    }
    
    if (!token.permissions) {
      console.log('🔴 Token.permissions is undefined:', token)
      return null
    }
    
    console.log('🔍 Token permissions:', token.permissions)
    console.log('🔍 Token permissions length:', token.permissions.length)
    
    if (token.permissions.length > 0) {
      console.log('🔍 Got permissions, exchanging for long token...')
      try {
        const long_token = await axios.get(
          `${process.env.INSTAGRAM_BASE_URL}/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${token.access_token}`
        )
        console.log('🔍 Long token response:', long_token.data)
        return long_token.data
      } catch (longTokenError) {
        console.log('🔴 Error exchanging for long token:', longTokenError)
        return null
      }
    } else {
      console.log('🔴 No permissions in token')
      return null
    }
  } catch (error) {
    console.log('🔴 Error in token request:', error)
    return null
  }
}
