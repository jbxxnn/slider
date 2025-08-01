import { onIntegrate } from '@/actions/integrations'
import { permanentRedirect } from 'next/navigation'

type Props = {
  searchParams: {
    code: string
  }
}

export default async function Page({ searchParams: { code } }: Props) {
  if (!code) {
    return permanentRedirect('/sign-up') // ✅ return it!
  }

  const processedCode = code.split('#_')[0]

  try {
    const user = await onIntegrate(processedCode)

    if (user.status === 200 && user.data) {
      const redirectUrl = `/dashboard/${user.data.firstname}${user.data.lastname}/integrations`
      console.log('✅ Redirecting to:', redirectUrl)
      return permanentRedirect(redirectUrl) // ✅ return it!
    }

    return permanentRedirect('/sign-up')
  } catch (error) {
    console.error('Integration error:', error)
    return permanentRedirect('/sign-up')
  }
}
