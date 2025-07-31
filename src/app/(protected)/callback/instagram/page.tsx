import { onIntegrate } from '@/actions/integrations'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  searchParams: {
    code: string
  }
}

const Page = async ({ searchParams: { code } }: Props) => {
  console.log('🔵 Instagram callback page loaded')
  console.log('🔵 Search params:', { code: code ? 'Code exists' : 'No code' })
  
  if (code) {
    console.log('🔵 Processing Instagram integration with code:', code.substring(0, 10) + '...')
    try {
      const user = await onIntegrate(code.split('#_')[0])
      console.log('🔵 Integration result:', user)
      
      if (user.status === 200) {
        console.log('🔵 Integration successful, redirecting to dashboard')
        return redirect(
          `/dashboard/${user.data?.firstname}${user.data?.lastname}/integrations`
        )
      } else {
        console.log('🔴 Integration failed with status:', user.status, 'Error:', user.error)
        // Redirect to integrations page with error
        return redirect('/dashboard/integrations?error=instagram_failed')
      }
    } catch (error) {
      console.log('🔴 Error in Instagram callback page:', error)
      return redirect('/dashboard/integrations?error=instagram_error')
    }
  }
  
  console.log('🔴 No code provided, redirecting to sign-up')
  return redirect('/sign-up')
}

export default Page
