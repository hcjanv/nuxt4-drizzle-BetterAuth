import type { Color } from '~~/shared/types'

type EnumItem<T = string> = {
    value: T
    label: string
    color: Color
    icon?: string
    description?: string
}

export const Enum = {
    OrganizationRoles: [
        { value: 'owner', label: '所有者', color: 'primary', icon: 'i-lucide-shield-check', description: '拥有所有设置和数据的完整权限。' },
        { value: 'admin', label: '管理员', color: 'success', icon: 'i-lucide-user-check', description: '可以管理设置和用户。' },
        { value: 'member', label: '成员', color: 'info', icon: 'i-lucide-user', description: '可以查看内容并参与协作。' }
    ] satisfies EnumItem[]
}
