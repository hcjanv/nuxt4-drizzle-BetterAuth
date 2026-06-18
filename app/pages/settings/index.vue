<template>
    <UContainer class="px-0 max-w-4xl lg:py-4 space-y-6 xl:space-y-12">
        <UPageCard
            title="我的资料"
            description="更新你的个人信息和头像设置。"
            variant="naked"
        >
            <AppAccountUpdateProfileForm />
        </UPageCard>
        <UPageCard
            title="修改邮箱"
            description="更新当前账号的邮箱地址。"
            variant="naked"
            class="mt-6"
        >
            <AppAccountUpdateEmailForm />
        </UPageCard>
        <UPageCard
            title="修改密码"
            description="更新当前账号的登录密码。"
            variant="naked"
            class="mt-6"
        >
            <AppAccountUpdatePasswordForm />
        </UPageCard>
        <UPageCard
            title="危险操作"
            description="退出组织或删除账号。"
            variant="naked"
        >
            <USeparator />
            <AppAccountDangerZone />
        </UPageCard>
    </UContainer>
</template>
