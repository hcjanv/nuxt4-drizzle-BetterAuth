import type { EmailProvider, SendEmailOptions, EmailResponse, EmailProviderType } from '../../../types'
import { ResendProvider } from './providers/resend'
import { SMTPProvider } from './providers/smtp'

// 邮件服务实例缓存
const emailProviders = new Map<EmailProviderType, EmailProvider>()

// 根据配置初始化邮件服务
function initializeEmailProvider(): EmailProvider {
    const provider = process.env.MAIL_PROVIDER as EmailProviderType || 'resend'

    if (emailProviders.has(provider)) {
        return emailProviders.get(provider)!
    }

    let providerInstance: EmailProvider

    switch (provider) {
        case 'resend': {
            const resendKey = process.env.MAIL_RESEND_KEY
            if (!resendKey) {
                throw new Error('使用 Resend 邮件服务时必须配置 MAIL_RESEND_KEY')
            }
            providerInstance = new ResendProvider(resendKey)
            break
        }

        case 'smtp': {
            const smtpConfig = {
                host: process.env.MAIL_SMTP_HOST || 'localhost',
                port: parseInt(process.env.MAIL_SMTP_PORT || '587'),
                username: process.env.MAIL_SMTP_USERNAME || '',
                password: process.env.MAIL_SMTP_PASSWORD || '',
                secure: process.env.MAIL_SMTP_SECURE === 'true'
            }
            providerInstance = new SMTPProvider(smtpConfig)
            break
        }

        default:
            throw new Error(`不支持的邮件服务：${provider}`)
    }

    emailProviders.set(provider, providerInstance)
    return providerInstance
}

/**
 * 使用已配置的服务发送邮件
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResponse> {
    try {
        // 未传入发件人时使用默认发件地址。
        const fromAddress = options.from || process.env.MAIL_FROM

        if (!fromAddress) {
            throw new Error('必须配置发件地址')
        }

        const emailOptions: SendEmailOptions = {
            ...options,
            from: fromAddress
        }

        const provider = initializeEmailProvider()
        return await provider.send(emailOptions)
    } catch (error) {
        console.error('邮件发送失败：', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : '邮件发送失败'
        }
    }
}

// 导出类型给外部使用。
export type { SendEmailOptions, EmailResponse, EmailAttachment } from '../../../types'
