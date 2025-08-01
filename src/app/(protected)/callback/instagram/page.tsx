import { onIntegrate } from '@/actions/integrations'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  searchParams: {
    code: string
  }
}

const Page = async ({ searchParams: { code } }: Props) => {
  console.log('🔍 Instagram callback received with searchParams:', { code })
  console.log('🔍 Code value:', code)
  
  // Debug environment variables (without exposing sensitive data)
  console.log('🔍 Environment check:')
  console.log('🔍 INSTAGRAM_CLIENT_ID:', process.env.INSTAGRAM_CLIENT_ID ? 'Set' : 'Not set')
  console.log('🔍 INSTAGRAM_CLIENT_SECRET:', process.env.INSTAGRAM_CLIENT_SECRET ? 'Set' : 'Not set')
  console.log('🔍 INSTAGRAM_TOKEN_URL:', process.env.INSTAGRAM_TOKEN_URL ? 'Set' : 'Not set')
  console.log('🔍 INSTAGRAM_BASE_URL:', process.env.INSTAGRAM_BASE_URL ? 'Set' : 'Not set')
  console.log('🔍 NEXT_PUBLIC_HOST_URL:', process.env.NEXT_PUBLIC_HOST_URL ? 'Set' : 'Not set')
  
  if (code) {
    console.log('🔍 Processing code:', code)
    const processedCode = code.split('#_')[0]
    console.log('🔍 Processed code:', processedCode)
    
    console.log('🔍 Calling onIntegrate...')
    const user = await onIntegrate(processedCode)
    console.log('🔍 onIntegrate result:', user)
    
    if (user.status === 200) {
      console.log('🔍 Integration successful, redirecting to dashboard')
      const redirectUrl = `/dashboard/${user.data?.firstname}${user.data?.lastname}/integrations`
      console.log('🔍 Redirecting to:', redirectUrl)
      redirect(redirectUrl)
    } else {
      console.log('🔴 Integration failed with status:', user.status)
      redirect('/sign-up')
    }
  }
  
  console.log('🔴 No code provided, redirecting to sign-up')
  redirect('/sign-up')
}

export default Page
