'use server'

import { client } from '@/lib/prisma'

export const updateIntegration = async (
  token: string,
  expire: Date,
  id: string
) => {
  return await client.integrations.update({
    where: { id },
    data: {
      token,
      expiresAt: expire,
    },
  })
}

export const getIntegration = async (clerkId: string) => {
  console.log('🔵 Querying database for user integrations, clerkId:', clerkId)
  
  try {
    const result = await client.user.findUnique({
      where: {
        clerkId,
      },
      select: {
        integrations: {
          where: {
            name: 'INSTAGRAM',
          },
        },
      },
    })
    
    console.log('🔵 Database query result:', {
      resultExists: !!result,
      resultType: typeof result,
      integrationsArray: result?.integrations,
      integrationsLength: result?.integrations?.length,
      resultKeys: result ? Object.keys(result) : 'N/A'
    })
    
    return result
  } catch (error) {
    console.log('🔴 Database query error:', {
      error: error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  }
}

export const createIntegration = async (
  clerkId: string,
  token: string,
  expire: Date,
  igId?: string
) => {
  return await client.user.update({
    where: {
      clerkId,
    },
    data: {
      integrations: {
        create: {
          token,
          expiresAt: expire,
          instagramId: igId,
        },
      },
    },
    select: {
      firstname: true,
      lastname: true,
    },
  })
}
