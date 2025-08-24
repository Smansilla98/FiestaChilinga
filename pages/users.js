import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { database } from '../lib/supabase'
import { Users, Search, Shield, User, Mail, Calendar, Edit3 } from 'lucide-react'
import { useRouter } from 'next/router'

export default function UsersPage() {
  const { isAdmin, loading } = useAuth()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin()) {
      router.push('/profile')
      return
    }

    if (isAdmin()) {
      loadUsers()
    }
  }, [loading, isAdmin])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm])

  const loadUsers = async () => {
    try {
      const { data, error } = await database.getAllUsers()
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }

  const updateUserRole = async (userId, newRole) => {
    setUpdating(true)
    try {
      const { error } = await database.updateUserRole(userId, newRole)
      if (error) throw error

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
      
      setEditingUser(null)
      alert('Rol actualizado exitosamente')
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Error al actualizar el rol del usuario')
    } finally {
      setUpdating(false)
    }
  }

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { icon: Shield, color: 'bg-purple-100 text-purple-800', text: 'Administrador' },
      cliente: { icon: User, color: 'bg-blue-100 text-blue-800', text: 'Cliente' }
    }

    const config = roleConfig[role] || roleConfig.cliente
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        <span>{config.text}</span>
      </span>
    )
  }

  if (loading || loadingUsers) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        </div>
      </Layout>
    )
  }

  if (!isAdmin()) {
    return null
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-2">
              Administra los usuarios y sus roles en el sistema
            </p>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="text-sm text-gray-600">
              {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
              <p className="mt-1 text-sm text-gray-500">
                {users.length === 0 
                  ? 'No se han registrado usuarios todavía.' 
                  : 'No se encontraron usuarios con el término de búsqueda.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || 'Sin nombre'}
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Mail size={14} />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          <Edit3 size={16} />
                          <span>Editar rol</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal para editar rol */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold mb-4">Editar rol de usuario</h3>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {editingUser.full_name || 'Sin nombre'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {editingUser.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600">Selecciona el nuevo rol:</p>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="cliente"
                      defaultChecked={editingUser.role === 'cliente'}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-blue-600" />
                      <span className="text-sm font-medium">Cliente</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      defaultChecked={editingUser.role === 'admin'}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Shield size={16} className="text-purple-600" />
                      <span className="text-sm font-medium">Administrador</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    const selectedRole = document.querySelector('input[name="role"]:checked').value
                    updateUserRole(editingUser.id, selectedRole)
                  }}
                  disabled={updating}
                  className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {updating ? 'Actualizando...' : 'Actualizar rol'}
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}