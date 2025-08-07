'use server'

import { revalidatePath } from 'next/cache'
import { UserService } from '@/lib/api-services'

export async function createUserAction(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  if (!name || !email) {
    return { error: 'Name and email are required' }
  }

  const response = await UserService.createUser({ name, email })
  
  if (response.error) {
    return { error: response.error }
  }

  revalidatePath('/users')
  return { success: true, data: response.data }
}

export async function deleteUserAction(userId: string) {
  const response = await UserService.deleteUser(userId)
  
  if (response.error) {
    return { error: response.error }
  }

  revalidatePath('/users')
  return { success: true }
}
