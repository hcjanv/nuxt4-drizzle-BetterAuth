<template>
    <UContainer class="px-0 max-w-4xl lg:py-4 space-y-6 xl:space-y-12">
        <UPageCard
            title="组织资料"
            description="更新组织名称、标识和头像。"
            variant="naked"
        >
            <AppOrganizationEditForm />
        </UPageCard>
        <UPageCard
            title="成员"
            description="管理组织成员和权限。"
            :ui="{ container: 'max-w-full' }"
            variant="naked"
        >
            <AppOrganizationMemberList />
        </UPageCard>
        <UPageCard
            title="邀请"
            description="邀请新成员加入组织。"
            :ui="{ container: 'max-w-full' }"
            variant="naked"
        >
            <AppOrganizationMemberInvitationForm @on-success="refreshNuxtData('organization:member:invitation')" />
            <AppOrganizationMemberInvitationList />
        </UPageCard>
        <UPageCard
            title="危险操作"
            description="删除或转让当前组织。"
            variant="naked"
        >
            <USeparator />
            <AppOrganizationDangerZone />
        </UPageCard>
    </UContainer>
</template>
