<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
    layout: 'auth',
    auth: {
        only: 'guest',
        redirectGuestTo: '/auth/password/forgot'
    }
})

const runtimeConfig = useRuntimeConfig()
const toast = useToast()
const form = useTemplateRef('form')
const { client, setup } = useAuth()

const fields: AuthFormField[] = [{
    name: 'email',
    type: 'text',
    label: '邮箱',
    required: true
}]

async function onSubmit(payload: FormSubmitEvent<{ email: string }>) {
    const { error } = await client.requestPasswordReset({
        ...payload.data,
        redirectTo: runtimeConfig.public.appUrl + '/auth/password/reset'
    })

    toast.add({ title: '如果该邮箱存在对应账号，密码重置链接已发送。' })

    if (error) return handleError(error, form)

    await setup()
    await navigateTo('/')
}

useHead({
    title: '忘记密码'
})
</script>

<template>
    <UAuthForm
        ref="form"
        title="忘记密码"
        description="输入邮箱地址以重置密码。"
        :fields="fields"
        :submit="{ label: '发送密码重置链接' }"
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
        <template #footer>
            <div class="text-center text-sm">
                <ULink
                    to="/auth/signin"
                    class="text-default"
                >返回登录</ULink>
            </div>
        </template>
    </UAuthForm>
</template>
