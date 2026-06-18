import { eq } from 'drizzle-orm'
import { customers, organizations, users } from '~~/server/database/schema'
import { useDb } from '~~/server/utils/database'

const demoUser = {
    email: 'test@example.com',
    password: 'password',
    name: '测试用户',
    role: 'admin' as const
}

const demoOrganization = {
    name: '演示组织',
    slug: 'demo-organization'
}

export default defineTask({
    meta: {
        name: 'seed:users',
        description: '写入演示数据'
    },
    async run() {
        const db = useDb()
        const auth = useAuthServer()

        let [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, demoUser.email))
            .limit(1)

        if (!user) {
            await auth.api.createUser({
                body: {
                    email: demoUser.email,
                    password: demoUser.password,
                    name: demoUser.name,
                    role: demoUser.role,
                    data: {
                        emailVerified: true
                    }
                }
            })

            ;[user] = await db
                .select()
                .from(users)
                .where(eq(users.email, demoUser.email))
                .limit(1)
        }

        if (!user) {
            throw new Error(`写入演示用户失败：${demoUser.email}`)
        }
        if (user.name !== demoUser.name) {
            await db
                .update(users)
                .set({ name: demoUser.name })
                .where(eq(users.id, user.id))
            user.name = demoUser.name
        }

        let [organization] = await db
            .select()
            .from(organizations)
            .where(eq(organizations.slug, demoOrganization.slug))
            .limit(1)

        if (!organization) {
            await auth.api.createOrganization({
                body: {
                    ...demoOrganization,
                    userId: user.id
                }
            })

            ;[organization] = await db
                .select()
                .from(organizations)
                .where(eq(organizations.slug, demoOrganization.slug))
                .limit(1)
        }

        if (!organization) {
            throw new Error(`写入演示组织失败：${demoOrganization.slug}`)
        }
        if (organization.name !== demoOrganization.name) {
            await db
                .update(organizations)
                .set({ name: demoOrganization.name })
                .where(eq(organizations.id, organization.id))
            organization.name = demoOrganization.name
        }

        const existingCustomers = await db
            .select({ id: customers.id })
            .from(customers)
            .limit(1)

        if (!existingCustomers.length) {
            await db.insert(customers).values([
                { name: '示例客户一' },
                { name: '示例客户二' },
                { name: '示例客户三' }
            ])
        }

        return {
            result: true,
            credentials: {
                email: demoUser.email,
                password: demoUser.password
            },
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            organization: {
                id: organization.id,
                name: organization.name,
                slug: organization.slug
            },
            message: `种子数据已完成。可使用 ${demoUser.email} / ${demoUser.password} 登录。`
        }
    }
})
