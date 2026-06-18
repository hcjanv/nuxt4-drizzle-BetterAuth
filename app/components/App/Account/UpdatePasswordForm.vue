<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

const { client } = useAuth()
const toast = useToast()
const form = useTemplateRef('form')

const state = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

async function onSubmit(payload: FormSubmitEvent<typeof state>) {
    try {
        // Validate password confirmation
        if (payload.data.newPassword !== payload.data.confirmPassword) {
            throw createError({
                statusCode: 400,
                statusMessage: '两次输入的新密码不一致'
            })
        }

        const { error } = await client.changePassword({
            currentPassword: payload.data.currentPassword,
            newPassword: payload.data.newPassword
        })

        if (error) return handleError(error, form)

        toast.add({
            title: '密码已修改',
            icon: 'i-lucide-check',
            color: 'success'
        })

        // Reset form
        state.currentPassword = ''
        state.newPassword = ''
        state.confirmPassword = ''
    } catch (error) {
        handleError(error, form)
    }
}
</script>

<template>
    <UForm
        ref="form"
        :state="state"
        class="space-y-4"
        loading-auto
        @submit="onSubmit"
    >
        <UFormField
            label="当前密码"
            name="currentPassword"
            required
        >
            <UInput
                v-model="state.currentPassword"
                type="password"
                placeholder="请输入当前密码"
                required
            />
        </UFormField>

        <UFormField
            label="新密码"
            name="newPassword"
            required
        >
            <UInput
                v-model="state.newPassword"
                type="password"
                placeholder="请输入新密码"
                required
            />
        </UFormField>

        <UFormField
            label="确认新密码"
            name="confirmPassword"
            required
        >
            <UInput
                v-model="state.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                required
            />
        </UFormField>

        <UButton
            type="submit"
            label="修改密码"
        />
    </UForm>
</template>
