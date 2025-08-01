import { onIntegrate } from '@/actions/integrations'
import { permanentRedirect } from 'next/navigation'
import React from 'react'

type Props = {
  searchParams: {
    code: string
  }
}

const Page = async ({ searchParams: { code } }: Props) => {
  // Early return if no code provided
  if (!code) {
    permanentRedirect('/sign-up')
  }

  const processedCode = code.split('#_')[0]
  
  try {
    const user = await onIntegrate(processedCode)
    
    if (user.status === 200 && user.data) {
      const redirectUrl = `/dashboard/${user.data.firstname}${user.data.lastname}/integrations`
      console.log('Redirecting to:', redirectUrl)
      permanentRedirect(redirectUrl)
    } else {
      permanentRedirect('/sign-up')
    }
  } catch (error) {
    console.error('Integration error:', error)
    permanentRedirect('/sign-up')
  }
}

export default Page
