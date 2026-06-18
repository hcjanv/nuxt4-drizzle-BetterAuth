<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

const { client, auth, organization, signOut, setup } = useAuth()
const toast = useToast()
const leaveForm = useTemplateRef('leaveForm')
const deleteForm = useTemplateRef('deleteForm')

const leaveState = reactive({
    confirmText: undefined
})

const deleteState = reactive({
    password: undefined
})

async function onLeaveOrganization(event: FormSubmitEvent<typeof leaveState>) {
    if (event.data.confirmText !== organization.value?.name) {
        toast.add({
            title: '组织名称不匹配',
            icon: 'i-lucide-alert-circle',
            color: 'error'
        })
        return
    }

    const { error } = await client.organization.leave({
        organizationId: organization.value?.id || ''
    })

    if (error) return handleError(error, leaveForm)

    toast.add({
        description: '已退出组织，你不再拥有该组织的访问权限。',
        icon: 'i-lucide-check',
        color: 'success'
    })

    // Refresh organization state
    await setup()
}

async function onDeleteAccount(event: FormSubmitEvent<typeof deleteState>) {
    try {
        const { error } = await client.deleteUser({
            password: event.data.password
        })

        if (error) throw error

        toast.add({
            title: '账号已永久删除。',
            icon: 'i-lucide-check',
            color: 'success'
        })

        // Sign out after deletion
        await signOut()
    } catch (error) {
        handleError(error, deleteForm)
    }
}
</script>

<template>
    <div class="space-y-4">
        <!-- 退出组织 -->
        <UPageCard
            v-if="organization"
            title="退出组织"
            description="将你自己从当前组织中移除，并失去对组织资源的访问权限。"
            color="error"
            orientation="horizontal"
            variant="naked"
            :ui="{ title: 'text-sm', description: 'text-sm' }"
        >
            <UModal title="退出组织">
                <UButton
                    color="error"
                    label="退出组织"
                    variant="soft"
                    class="w-fit lg:ms-auto"
                />
                <template #description />
                <template #body>
                    <div class="space-y-4">
                        <p class="text-sm text-muted">
                            此操作不可撤销。你将从组织
                            <strong>{{ organization?.name }}</strong> 中移除，并失去所有相关数据的访问权限。
                        </p>

                        <UForm
                            ref="leaveForm"
                            loading-auto
                            :state="leaveState"
                            class="space-y-4"
                            @submit="onLeaveOrganization"
                        >
                            <UFormField
                                name="confirmText"
                                required
                            >
                                <template #label>
                                    输入 <strong>{{ organization?.name }}</strong> 以确认
                                </template>
                                <UInput
                                    v-model="leaveState.confirmText"
                                    placeholder="请输入组织名称"
                                    required
                                />
                            </UFormField>
                            <UButton
                                type="submit"
                                color="error"
                                variant="soft"
                                icon="i-lucide-log-out"
                                label="退出组织"
                            />
                        </UForm>
                    </div>
                </template>
            </UModal>
        </UPageCard>

        <!-- 删除账号 -->
        <UPageCard
            title="删除账号"
            description="永久删除你的账号和所有关联数据。"
            color="error"
            orientation="horizontal"
            variant="naked"
            :ui="{ title: 'text-sm', description: 'text-sm' }"
        >
            <UModal title="删除账号">
                <UButton
                    color="error"
                    label="删除账号"
                    variant="soft"
                    class="w-fit lg:ms-auto"
                />
                <template #description />
                <template #body>
                    <div class="space-y-4">
                        <p class="text-sm text-muted">
                            此操作不可撤销。账号
                            <strong>{{ auth?.user?.email }}</strong> 及其所有关联数据将被永久删除。
                        </p>

                        <UForm
                            ref="deleteForm"
                            loading-auto
                            :state="deleteState"
                            class="space-y-4"
                            @submit="onDeleteAccount"
                        >
                            <UFormField
                                name="password"
                                required
                            >
                                <template #label>
                                    输入当前密码以确认
                                </template>
                                <UInput
                                    v-model="deleteState.password"
                                    type="password"
                                    placeholder="请输入当前密码"
                                    required
                                />
                            </UFormField>
                            <UButton
                                type="submit"
                                color="error"
                                variant="soft"
                                icon="i-lucide-trash"
                                label="删除账号"
                            />
                        </UForm>
                    </div>
                </template>
            </UModal>
        </UPageCard>
    </div>
</template>
