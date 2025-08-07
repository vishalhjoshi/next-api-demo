import { UserService } from '@/lib/api-services'
import { UserList } from './user-list'

// Server Component - fetches data on the server
export default async function UsersPage() {
  const response = await UserService.getUsersServer()
  
  if (response.error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <div className="text-red-500">Error: {response.error}</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <UserList initialUsers={response.data || []} />
    </div>
  )
}
