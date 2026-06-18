<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
    layout: 'auth',
    auth: {
        only: 'guest',
        redirectGuestTo: '/auth/password/reset'
    }
})

const route = useRoute()
const toast = useToast()
const form = useTemplateRef('form')
const { client, setup } = useAuth()

const fields: AuthFormField[] = [{
    name: 'newPassword',
    type: 'password',
    label: '新密码',
    required: true
}]

async function onSubmit(payload: FormSubmitEvent<{ newPassword: string }>) {
    const { error } = await client.resetPassword({
        ...payload.data,
        token: route.query.token as string
    })

    toast.add({ title: '密码已重置成功。' })

    if (error) return handleError(error, form)

    await setup()
    await navigateTo('/')
}

useHead({
    title: '重置密码'
})
</script>

<template>
    <UAuthForm
        ref="form"
        title="重置密码"
        description="请在下方输入新密码。"
        :fields="fields"
        :submit="{ label: '更新密码' }"
        loading-auto
        @submit="onSubmit"
    >
        <template #leading>
            <UBadge
                icon="i-lucide-box"
                variant="soft"
                color="neutral"
                size="xl"
                class="p-4 rounded-xl mb-4"
            />
        </template>
    </UAuthForm>
</template>
