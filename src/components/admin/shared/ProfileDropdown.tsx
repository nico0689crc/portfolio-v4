'use client'

// Third-party Imports
import { LogOutIcon } from 'lucide-react'

// Component Imports
import { useAdminUser } from '@/components/admin/admin-user-context'
import { Avatar, AvatarFallback } from '@/components/admin/ui/avatar'
import { Button } from '@/components/admin/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/admin/ui/dropdown-menu'

// Action Imports
import { signOut } from '@/lib/admin/actions'

// Sin foto de perfil: el panel tiene un único editor y Supabase Auth no guarda
// avatar, así que las iniciales del mail alcanzan y evitan un request más.
const initialsFrom = (email: string) =>
  email
    .split('@')[0]
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || '?'

const ProfileDropdown = () => {
  const user = useAdminUser()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant='ghost' size='icon' className='relative rounded-full hover:bg-transparent' />}
      >
        <Avatar>
          <AvatarFallback>{initialsFrom(user.email)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-60'>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='flex items-center gap-4 px-2 py-2.5 font-normal'>
            <Avatar className='size-10'>
              <AvatarFallback>{initialsFrom(user.email)}</AvatarFallback>
            </Avatar>
            <div className='flex min-w-0 flex-1 flex-col items-start'>
              <span className='text-foreground text-sm font-semibold'>Editor</span>
              <span className='text-muted-foreground w-full truncate text-sm'>{user.email}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem variant='destructive' onClick={() => void signOut()}>
            <LogOutIcon />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropdown
