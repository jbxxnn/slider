'use server'

import { client } from '@/lib/prisma'

// Helper function to retry database operations
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error: any) {
      console.log(`🔴 Database operation failed (attempt ${i + 1}/${maxRetries}):`, error.message)
      
      // If it's the last attempt, throw the error
      if (i === maxRetries - 1) {
        throw error
      }
      
      // If it's a connection error, wait before retrying
      if (error.message?.includes('prepared statement') || error.message?.includes('connection')) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
        continue
      }
      
      // For other errors, don't retry
      throw error
    }
  }
  throw new Error('Max retries exceeded')
}

export const updateIntegration = async (
  token: string,
  expire: Date,
  id: string
) => {
  return await retryOperation(async () => {
    return await client.integrations.update({
      where: { id },
      data: {
        token,
        expiresAt: expire,
      },
    })
  })
}

export const getIntegration = async (clerkId: string) => {
  console.log('🔍 getIntegration called with clerkId:', clerkId)
  try {
    const result = await retryOperation(async () => {
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
    const result = await retryOperation(async () => {
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
    })
    console.log('🔍 createIntegration result:', result)
    return result
  } catch (error) {
    console.log('🔴 Error in createIntegration:', error)
    throw error
  }
}
