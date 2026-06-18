<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

const { client } = useAuth()
const toast = useToast()
const form = useTemplateRef('form')

const state = reactive({
    newEmail: ''
})

async function onSubmit(payload: FormSubmitEvent<typeof state>) {
    try {
        await client.changeEmail({
            ...payload.data,
            callbackURL: '/'
        })

        toast.add({
            title: '请查看新邮箱中的验证链接。',
            icon: 'i-lucide-mail',
            color: 'success'
        })

        form.value?.clear()
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
            label="新邮箱地址"
            name="newEmail"
            required
        >
            <UInput
                v-model="state.newEmail"
                type="email"
                placeholder="newemail@example.com"
                required
            />
        </UFormField>
        <UAlert
            color="neutral"
            variant="subtle"
            icon="i-lucide-info"
            description="提交后，请打开新邮箱里的验证链接以确认修改。"
            class="p-3!"
        />
        <UButton
            type="submit"
            label="修改邮箱"
        />
    </UForm>
</template>
