<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
    layout: 'auth',
    auth: {
        only: 'guest',
        redirectGuestTo: '/auth/signup'
    }
})

const toast = useToast()
const form = useTemplateRef('form')
const { client, setup } = useAuth()

const fields: AuthFormField[] = [{
    name: 'name',
    type: 'text',
    label: '姓名',
    required: true
}, {
    name: 'email',
    type: 'text',
    label: '邮箱',
    required: true
}, {
    name: 'password',
    label: '密码',
    type: 'password',
    required: true
}, {
    name: 'confirmPassword',
    label: '确认密码',
    type: 'password',
    required: true
}, {
    name: 'acceptTerms',
    label: '我已阅读并同意服务条款',
    type: 'checkbox',
    required: true
}]

async function onSubmit(payload: FormSubmitEvent<{ name: string, email: string, password: string, confirmPassword: string, acceptTerms: boolean }>) {
    const { error } = await client.signUp.email({
        name: payload.data.name,
        email: payload.data.email,
        password: payload.data.password
    })

    if (error) return handleError(error, form)

    toast.add({
        title: '账号创建成功，请查看邮箱完成验证。',
        icon: 'i-lucide-check-circle',
        color: 'success'
    })

    await setup()
    await navigateTo('/')
}

useHead({
    title: '注册'
})
</script>

<template>
    <UAuthForm
        ref="form"
        title="注册"
        description="创建账号后即可开始使用。"
        :fields="fields"
        :submit="{ label: '注册' }"
        loading-auto
        @submit="onSubmit"
    >
        <template #leading>
            <UButton
                icon="i-lucide-box"
                to="/"
                variant="link"
                size="xl"
                :ui="{ leadingIcon: 'size-8' }"
                class="mb-4"
            />
        </template>
        <template #footer>
            <div class="text-center text-sm">
                已有账号？
                <ULink
                    to="/auth/signin"
                    class="text-default"
                >登录</ULink>
            </div>
        </template>
    </UAuthForm>
</template>
