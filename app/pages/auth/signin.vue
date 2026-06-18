<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
    layout: 'auth',
    auth: false
})

type SignInFormState = {
    email: string
    password: string
    remember?: boolean
}

type SignInFormRef = {
    state: Partial<SignInFormState>
}

const form = useTemplateRef<SignInFormRef>('form')
const route = useRoute()
const { client, loggedIn, setup, signOut } = useAuth()

const demoCredentials = {
    email: 'test@example.com',
    password: 'password'
}

const fields: AuthFormField[] = [{
    name: 'email',
    type: 'email',
    label: '邮箱',
    required: true,
    defaultValue: demoCredentials.email
}, {
    name: 'password',
    label: '密码',
    type: 'password',
    defaultValue: demoCredentials.password
}, {
    name: 'remember',
    label: '记住登录状态',
    type: 'checkbox',
    defaultValue: false
}]

async function onSubmit(payload: FormSubmitEvent<SignInFormState>): Promise<void> {
    const { email, password } = payload.data
    const { error } = await client.signIn.email({ email, password })

    if (error) return handleError(error, form)

    await setup()
    await navigateTo('/')
}

async function fillDemoCredentials() {
    if (import.meta.dev) {
        await nextTick()
        if (form.value?.state) {
            Object.assign(form.value.state, demoCredentials)
        }
    }
}

onMounted(async () => {
    await fillDemoCredentials()
    if (route.query.resetSession === '1' && loggedIn.value) {
        await signOut({ redirectTo: '/auth/signin' })
        await fillDemoCredentials()
    }
})

useHead({
    title: '登录'
})
</script>

<template>
    <UAuthForm
        ref="form"
        title="登录"
        description="使用账号和密码进入系统。"
        :fields="fields"
        :submit="{ label: '登录' }"
        loading-auto
        :on-submit="onSubmit"
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
        <template #password-hint>
            <ULink
                to="/auth/password/forgot"
                class="text-xs text-default"
                tabindex="-1"
            >忘记密码？</ULink>
        </template>
        <template #footer>
            <div class="text-center text-sm">
                还没有账号？
                <ULink
                    to="/auth/signup"
                    class="text-default"
                >注册</ULink>
            </div>
        </template>
    </UAuthForm>
</template>
