import { useState, useRequestHeaders, navigateTo, useRequestURL, useRequestEvent } from '#imports'
import { computed, ref } from 'vue'
import { createAuthClient } from 'better-auth/vue'
import { twoFactorClient, adminClient, organizationClient, inferOrgAdditionalFields } from 'better-auth/client/plugins'
import type { auth as Auth } from '#auth'
import type { RouteLocationRaw } from 'vue-router'

const AUTH_SETUP_TIMEOUT_MS = 8000

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Auth setup timed out while trying to ${label}`))
        }, AUTH_SETUP_TIMEOUT_MS)

        promise.then(
            (value) => {
                clearTimeout(timer)
                resolve(value)
            },
            (error) => {
                clearTimeout(timer)
                reject(error)
            }
        )
    })
}

type Session<T extends boolean | 'user' | 'guest' | undefined>
    = T extends 'guest' ? null
        : T extends false ? (typeof Auth.$Infer.Session | null) : typeof Auth.$Infer.Session

type ActiveOrganization<T extends boolean | 'user' | 'guest' | undefined>
    = T extends 'guest' ? null
        : T extends false ? (typeof Auth.$Infer.ActiveOrganization | null) : typeof Auth.$Infer.ActiveOrganization

type Organization<T extends boolean | 'user' | 'guest' | undefined>
    = T extends 'guest' ? null
        : T extends false ? (typeof Auth.$Infer.Organization | null) : typeof Auth.$Infer.Organization

export function useAuth<T extends boolean | 'user' | 'guest' | undefined = undefined>() {
    const url = useRequestURL()
    const headers = import.meta.server ? useRequestHeaders(['cookie', 'authorization', 'user-agent', 'host', 'referer']) : undefined

    const client = createAuthClient({
        baseURL: url.origin,
        fetchOptions: { headers },
        plugins: [
            twoFactorClient(),
            adminClient(),
            organizationClient({
                schema: inferOrgAdditionalFields<typeof Auth>()
            })
        ]
    })

    const auth = useState<Session<T>>(`auth:session`, () => null as Session<T>)

    const loggedIn = computed(() => !!auth.value)

    const organizations = useState<Organization<T>[]>('auth:organizations', () => [])
    const organization = useState<ActiveOrganization<T>>('auth:activeOrganization', () => null as ActiveOrganization<T>)

    const sessionFetching = import.meta.server ? ref(false) : useState('auth:sessionFetching', () => false)

    async function signOut({ redirectTo = '/' }: { redirectTo?: RouteLocationRaw | string } = {}) {
        await client.signOut({
            fetchOptions: {
                onSuccess: () => {
                    auth.value = null as Session<T>
                    navigateTo(redirectTo)
                }
            }
        })
    }

    async function setActiveOrganization(org: { organizationId?: string, organizationSlug?: string }) {
        const { data } = await client.organization.setActive(org)
        organization.value = data as ActiveOrganization<T>
    }

    async function setup() {
        if (sessionFetching.value) {
            return auth.value
        }
        sessionFetching.value = true

        try {
            if (import.meta.server) {
                const event = useRequestEvent()

                if (!event) {
                    auth.value = null as Session<T>
                    return auth.value
                }

                const { auth: serverAuth } = await import('#auth')
                const data = await withTimeout(
                    serverAuth.api.getSession({
                        headers: event.headers
                    }),
                    'get server session'
                )

                auth.value = data as Session<T>

                if (data) {
                    const [{ eq }, { useDb }, schema] = await Promise.all([
                        import('drizzle-orm'),
                        import('~~/server/utils/database'),
                        import('~~/server/database/schema')
                    ])
                    const db = useDb()
                    const userOrganizations = await db
                        .select({
                            id: schema.organizations.id,
                            name: schema.organizations.name,
                            slug: schema.organizations.slug,
                            logo: schema.organizations.logo,
                            createdAt: schema.organizations.createdAt,
                            metadata: schema.organizations.metadata
                        })
                        .from(schema.members)
                        .innerJoin(schema.organizations, eq(schema.members.organizationId, schema.organizations.id))
                        .where(eq(schema.members.userId, data.user.id))

                    organizations.value = userOrganizations as Organization<T>[]
                    organization.value = (
                        userOrganizations.find(org => org.id === data.session.activeOrganizationId)
                        || userOrganizations[0]
                        || null
                    ) as ActiveOrganization<T>
                } else {
                    organizations.value = []
                    organization.value = null as ActiveOrganization<T>
                }

                return auth.value
            }

            const { data } = await withTimeout(client.getSession(), 'get session')
            auth.value = data as Session<T>

            if (auth.value) {
                const { data: orgs } = await withTimeout(client.organization.list(), 'list organizations')
                organizations.value = orgs as Organization<T>[]

                if (organizations.value?.length) {
                    const orgId = data?.session.activeOrganizationId || organizations.value[0]?.id
                    await withTimeout(setActiveOrganization({ organizationId: orgId }), 'set active organization')
                } else {
                    // Automatically redirect to create organization page via middleware
                    organization.value = null as ActiveOrganization<T>
                }
            }

            return auth.value
        } catch (error) {
            console.error('[Auth] Setup failed:', error)
            auth.value = null as Session<T>
            organizations.value = []
            organization.value = null as ActiveOrganization<T>
            return auth.value
        } finally {
            sessionFetching.value = false
        }
    }

    if (import.meta.client) {
        client.$store.listen('$sessionSignal', async (signal) => {
            if (!signal) return
            await setup()
        })
    }

    return {
        client,
        organizations,
        organization,
        setActiveOrganization,
        setup,
        auth,
        loggedIn,
        signOut
    }
}
