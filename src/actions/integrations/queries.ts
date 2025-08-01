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
  console.log('🔍 getIntegration called with clerkId:', clerkId)
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
    console.log('🔍 getIntegration result:', result)
    return result
  } catch (error) {
    console.log('🔴 Error in getIntegration:', error)
    throw error
  }
}

export const createIntegration = async (
  clerkId: string,
  token: string,
  expire: Date,
  igId?: string
) => {
  console.log('🔍 createIntegration called with:', { clerkId, token: token ? 'Set' : 'Not set', expire, igId })
  try {
    const result = await client.user.update({
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
    console.log('🔍 createIntegration result:', result)
    return result
  } catch (error) {
    console.log('🔴 Error in createIntegration:', error)
    throw error
  }
}
