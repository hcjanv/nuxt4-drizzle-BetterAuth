import type { EmailProvider, SendEmailOptions, EmailResponse } from '../../../../types'

export class SMTPProvider implements EmailProvider {
    private host: string
    private port: number
    private username: string
    private password: string
    private secure: boolean

    constructor(config: {
        host: string
        port: number
        username: string
        password: string
        secure?: boolean
    }) {
        this.host = config.host
        this.port = config.port
        this.username = config.username
        this.password = config.password
        this.secure = config.secure ?? false
    }

    async send(options: SendEmailOptions): Promise<EmailResponse> {
        // TODO: 使用 nodemailer 或同类库实现 SMTP 服务。
        console.log('SMTP 配置：', {
            host: this.host,
            port: this.port,
            username: this.username,
            secure: this.secure
        })
        console.log('邮件参数：', options)
        console.warn('SMTP 邮件服务尚未实现')
        return {
            success: false,
            error: 'SMTP 邮件服务尚未实现'
        }
    }
}
