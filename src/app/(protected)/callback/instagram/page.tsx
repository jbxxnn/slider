import { onIntegrate } from '@/actions/integrations'
import { redirect } from 'next/navigation'
import React from 'react'
import { client } from '@/lib/prisma'

type Props = {
  searchParams: {
    code: string
  }
}

const Page = async ({ searchParams: { code } }: Props) => {
  // Early return if no code provided - no logging before redirect
  if (!code) {
    return redirect('/sign-up')
  }

  const processedCode = code.split('#_')[0]
  
  try {
    const user = await onIntegrate(processedCode)
    
    if (user.status === 200) {
      // Redirect immediately on success - no logging before redirect
      return redirect(
        `/dashboard/${user.data?.firstname}${user.data?.lastname}/integrations`
      )
    } else {
      // Redirect on failure - no logging before redirect
      return redirect('/sign-up')
    }
  } catch (error) {
    // Redirect on error - no logging before redirect
    return redirect('/sign-up')
  }
}

export default Page
