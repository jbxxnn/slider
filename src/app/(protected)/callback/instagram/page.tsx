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
      console.log('🔵 Integration result:', {
        status: user.status,
        hasData: !!user.data,
        error: user.error
      })
      
      if (user.status === 200) {
        console.log('🔵 Integration successful, redirecting to:', `/dashboard/${user.data?.firstname}${user.data?.lastname}/integrations`)
        return redirect(
          `/dashboard/${user.data?.firstname}${user.data?.lastname}/integrations`
        )
      } else {
        console.log('🔴 Integration failed with status:', user.status, 'Error:', user.error)
        return redirect('/sign-up')
      }
    } catch (error) {
      console.log('🔴 Error in Instagram callback page:', {
        error: error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      })
      return redirect('/sign-up')
    }
  } else {
    console.log('🔴 No code provided in callback')
    return redirect('/sign-up')
  }
}

export default Page
