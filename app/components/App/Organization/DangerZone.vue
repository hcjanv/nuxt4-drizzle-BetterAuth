<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'

const { client, organization } = useAuth()
const toast = useToast()
const form = useTemplateRef('form')

const state = reactive({
    confirmText: undefined
})

async function onDelete(event: FormSubmitEvent<typeof state>) {
    if (event.data.confirmText !== organization.value?.slug) {
        toast.add({
            title: '组织标识不匹配',
            icon: 'i-lucide-alert-circle',
            color: 'error'
        })
        return
    }

    const { error } = await client.organization.delete({
        organizationId: organization.value?.id || ''
    })

    if (error) return handleError(error, form)

    toast.add({
        title: '组织已删除',
        icon: 'i-lucide-check',
        color: 'success'
    })

    await navigateTo('/auth/organization/create')
}
</script>

<template>
    <div class="space-y-6">
        <UPageCard
            title="转让所有权"
            description="将当前组织的所有权转让给其他用户。该功能即将上线。"
            color="primary"
            orientation="horizontal"
            variant="naked"
            :ui="{ title: 'text-sm', description: 'text-sm' }"
        >
            <UButton
                label="转让所有权"
                variant="soft"
                icon="i-lucide-arrow-left-right"
                disabled
                class="w-fit lg:ms-auto"
            />
        </UPageCard>
        <UPageCard
            title="删除组织"
            description="永久删除当前组织和所有关联数据。"
            color="error"
            orientation="horizontal"
            variant="naked"
            :ui="{ title: 'text-sm', description: 'text-sm' }"
        >
            <UModal title="删除组织">
                <UButton
                    color="error"
                    label="删除组织"
                    variant="soft"
                    class="w-fit lg:ms-auto"
                />
                <template #description />
                <template #body>
                    <div class="space-y-4">
                        <p class="text-sm text-muted">
                            此操作不可撤销。组织
                            <strong>{{ organization?.name }}</strong> 及其所有关联数据将被永久删除。
                        </p>

                        <UForm
                            ref="form"
                            loading-auto
                            :state="state"
                            class="space-y-4"
                            @submit="onDelete"
                        >
                            <UFormField
                                name="confirmText"
                                required
                            >
                                <template #label>
                                    输入 <strong>{{ organization?.slug }}</strong> 以确认
                                </template>
                                <UInput
                                    v-model="state.confirmText"
                                    placeholder="请输入组织标识"
                                    required
                                />
                            </UFormField>
                            <UButton
                                type="submit"
                                color="error"
                                variant="soft"
                                icon="i-lucide-trash"
                                label="删除组织"
                            />
                        </UForm>
                    </div>
                </template>
            </UModal>
        </UPageCard>
    </div>
</template>
