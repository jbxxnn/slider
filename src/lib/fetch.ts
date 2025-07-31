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
  console.log('🔵 Starting token generation with code:', code ? 'Code exists' : 'No code')
  
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

  console.log('🔵 Making token request to Instagram...')
  const shortTokenRes = await fetch(process.env.INSTAGRAM_TOKEN_URL as string, {
    method: 'POST',
    body: insta_form,
  })

  console.log('🔵 Token response status:', shortTokenRes.status)
  const token = await shortTokenRes.json()
  console.log('🔵 Token response:', {
    tokenExists: !!token,
    tokenKeys: token ? Object.keys(token) : 'N/A',
    hasPermissions: !!token?.permissions,
    permissionsType: typeof token?.permissions,
    permissionsLength: token?.permissions?.length
  })

  // Add null check for token and permissions
  if (!token) {
    console.log('🔴 Token response is null/undefined')
    return null
  }

  if (!token.permissions) {
    console.log('🔴 Token has no permissions property')
    return null
  }

  if (token.permissions.length > 0) {
    console.log('🔵 Got permissions, exchanging for long-lived token...')
    const long_token = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${token.access_token}`
    )
    console.log('🔵 Long-lived token response:', {
      status: long_token.status,
      hasData: !!long_token.data,
      dataKeys: long_token.data ? Object.keys(long_token.data) : 'N/A'
    })

    return long_token.data
  } else {
    console.log('🔴 No permissions in token response')
    return null
  }
}
