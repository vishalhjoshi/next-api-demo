'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApi, useFetch, useMutation } from '@/lib/api-hooks'
import { UserService } from '@/lib/api-services'

interface User {
  id: string
  name: string
  email: string
}

interface UserListProps {
  initialUsers: User[]
}

export function UserList({ initialUsers }: UserListProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [newUser, setNewUser] = useState({ name: '', email: '' })
  
  // Using custom hooks for API calls
  const { data: refreshedUsers, loading: fetchLoading, refetch } = useFetch<User[]>('/users')
  const { mutate: createUser, loading: createLoading } = useMutation<User>()
  const { mutate: deleteUser, loading: deleteLoading } = useMutation<any>()

  const handleCreateUser = async () => {
    const response = await createUser(() => UserService.createUser(newUser))
    
    if (!response.error && response.data) {
      setUsers(prev => [...prev, response.data])
      setNewUser({ name: '', email: '' })
    }
  }

  const handleDeleteUser = async (id: string) => {
    const response = await deleteUser(() => UserService.deleteUser(id))
    
    if (!response.error) {
      setUsers(prev => prev.filter(user => user.id !== id))
    }
  }

  const handleRefresh = () => {
    refetch()
    if (refreshedUsers) {
      setUsers(refreshedUsers)
    }
  }

  return (
    <div className="space-y-6">
      {/* Create User Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newUser.name}
              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email"
            />
          </div>
          <Button 
            onClick={handleCreateUser} 
            disabled={createLoading || !newUser.name || !newUser.email}
          >
            {createLoading ? 'Creating...' : 'Create User'}
          </Button>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Users ({users.length})</h2>
        <Button onClick={handleRefresh} disabled={fetchLoading}>
          {fetchLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="text-lg">{user.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{user.email}</p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteUser(user.id)}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No users found. Create your first user above.
        </div>
      )}
    </div>
  )
}
