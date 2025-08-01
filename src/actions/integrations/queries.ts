'use server'

import { client } from '@/lib/prisma'

export const updateIntegration = async (
  token: string,
  expire: Date,
  id: string
) => {
  try {
    return await client.integrations.update({
      where: { id },
      data: {
        token,
        expiresAt: expire,
      },
    })
  } catch (error) {
    console.error('🔴 Error updating integration:', error)
    throw error
  }
}

export const getIntegration = async (clerkId: string) => {
  try {
    return await client.user.findUnique({
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
  } catch (error) {
    console.error('🔴 Error getting integration:', error)
    throw error
  }
}

export const createIntegration = async (
  clerkId: string,
  token: string,
  expire: Date,
  igId?: string
) => {
  try {
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
  } catch (error) {
    console.error('🔴 Error creating integration:', error)
    throw error
  }
}
