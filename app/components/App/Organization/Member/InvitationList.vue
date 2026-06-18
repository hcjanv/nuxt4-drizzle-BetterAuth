<script lang="ts" setup>
import type { ColumnDef } from '@tanstack/vue-table'

const { client, organization } = useAuth()
const UBadge = resolveComponent('UBadge')
const toast = useToast()
const dateTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
})

function formatDateTime(date: Date) {
    return dateTimeFormatter.format(new Date(date))
}

type Invitation = typeof client.$Infer.Invitation

const { data: invitations, refresh } = await useAsyncData('organization:member:invitation', async () => {
    const { data } = await client.organization.listInvitations({
        query: {
            organizationId: organization.value?.id
        }
    })
    return (data || []) as Invitation[]
}, {
    watch: [organization]
})

const columns: ColumnDef<Invitation>[] = [
    {
        accessorKey: 'email',
        header: '邮箱'
    },
    {
        accessorKey: 'role', header: '角色', cell: ({ row }) => h('div', { class: 'flex items-center gap-1' }, row.original.role.split(',').map(role => h(UBadge, { ...useEnum(Enum.OrganizationRoles, role), variant: 'soft' })))
    },
    {
        accessorKey: 'status',
        header: '状态',
        cell: ({ row }) => h(UBadge, {
            color: row.original.status === 'pending' ? 'warning' : 'neutral',
            variant: 'soft',
            label: row.original.status === 'pending' ? '待处理' : row.original.status
        })
    },
    {
        accessorKey: 'expiresAt',
        header: '过期时间',
        cell: ({ row }) => row.original.status === 'pending' ? formatDateTime(row.original.expiresAt) : '-'
    },
    {
        id: 'actions',
        header: '',
        meta: { class: { td: 'text-end py-2' } }
    }
]

async function cancelInvitation(invitation: Invitation) {
    const { error } = await client.organization.cancelInvitation({
        invitationId: invitation.id
    })

    if (error) return toast.add({ title: '取消邀请失败', color: 'error' })

    toast.add({ title: '邀请已取消', icon: 'i-lucide-check' })

    await refresh()
}
</script>

<template>
    <UTable
        v-if="invitations?.length"
        :columns="columns"
        :data="invitations"
    >
        <template #actions-cell="{ row }">
            <UButton
                v-if="row.original.status === 'pending'"
                size="sm"
                variant="ghost"
                color="error"
                label="取消"
                @click="cancelInvitation(row.original)"
            />
        </template>
    </UTable>
    <UEmpty
        v-else
        icon="i-lucide-mail"
        title="暂无待处理邀请"
        description="你还没有发送任何邀请。"
    />
</template>
