import { createError } from 'h3'
import type { H3Event } from 'h3'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, twoFactor, organization } from 'better-auth/plugins'
import { useDb } from '~~/server/utils/database'
import { renderResetPasswordEmail, renderWelcomeEmail } from '~~/server/emails/templates'
import { ulid } from 'ulid'

const emailVerificationExpiresIn = 3600 // 1 小时
const resetPasswordExpiresIn = 3600 // 1 小时

export const auth = betterAuth({
    database: drizzleAdapter(useDb(), {
        provider: 'mysql',
        usePlural: true
    }),
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            const runtimeConfig = useRuntimeConfig()
            const html = renderWelcomeEmail({
                appName: runtimeConfig.public.appName,
                expirationHours: emailVerificationExpiresIn / 3600,
                user,
                url
            })

            await sendEmail({
                to: user.email,
                subject: '请验证你的邮箱地址',
                html
            })
        },
        sendOnSignUp: process.env.NODE_ENV === 'production',
        autoSignInAfterVerification: true,
        expiresIn: emailVerificationExpiresIn
    },
    plugins: [
        twoFactor(),
        admin(),
        organization({
            schema: {
                organization: {
                    additionalFields: {}
                },
                member: {
                    additionalFields: {}
                },
                invitation: {
                    additionalFields: {}
                }
            }
        })
    ],
    user: {
        changeEmail: {
            enabled: true
        }
    },
    rateLimit: {
        enabled: true
    },
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            const runtimeConfig = useRuntimeConfig()
            const html = renderResetPasswordEmail({
                appName: runtimeConfig.public.appName,
                expirationHours: resetPasswordExpiresIn / 3600,
                user,
                url
            })

            await sendEmail({
                to: user.email,
                subject: '重置你的密码',
                html
            })
        },
        disableSignUp: false,
        requireEmailVerification: false
    },
    telemetry: {
        enabled: false
    },
    advanced: {
        database: {
            generateId: () => ulid()
        },
        cookies: {
            session_token: {
                name: 'auth_session'
            }
        }
    }
})

type Session = typeof auth.$Infer.Session | null

declare module 'h3' {
    interface H3EventContext {
        auth?: Session
    }
}

export const useAuthServer = () => auth

export const useAuthSession = async (event: H3Event) => {
    const session = await auth.api.getSession({
        headers: event.headers
    })

    if (!session || !session.user) throw createError({
        statusCode: 401,
        statusMessage: '未授权'
    })

    if (!session.session.activeOrganizationId) throw createError({
        statusCode: 403,
        statusMessage: '当前没有激活的组织，请先选择组织。'
    })

    return session as typeof session & { session: { activeOrganizationId: string } }
}

export default auth
