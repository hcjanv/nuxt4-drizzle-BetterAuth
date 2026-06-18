type EmailUser = {
    name?: string | null
}

type EmailTemplateOptions = {
    appName: string
    expirationHours: number
    user: EmailUser
    url: string
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function renderLayout({
    appName,
    body,
    url
}: {
    appName: string
    body: string
    url: string
}) {
    const safeAppName = escapeHtml(appName)

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeAppName}</title>
</head>
<body style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#374151;">
  <div style="max-width:672px;margin:0 auto;padding:32px 24px;">
    <a href="/" style="text-decoration:none;">
      <h1 style="font-size:18px;line-height:28px;margin:0 0 32px;font-weight:700;color:#1f2937;">${safeAppName}</h1>
    </a>
    ${body}
    <p style="margin:32px 0 0;font-size:14px;line-height:22px;color:#6b7280;">&copy; 2025 ${safeAppName}. 保留所有权利。</p>
  </div>
  <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(url)}</div>
</body>
</html>`
}

function actionButton(url: string, label: string) {
    return `<p style="margin:24px 0;">
  <a href="${escapeHtml(url)}" style="display:inline-block;padding:10px 24px;border-radius:8px;background:#0f766e;color:#ffffff;font-size:14px;font-weight:600;letter-spacing:.02em;text-decoration:none;">${escapeHtml(label)}</a>
</p>`
}

export function renderWelcomeEmail({ appName, expirationHours, user, url }: EmailTemplateOptions) {
    const safeAppName = escapeHtml(appName)
    const safeName = escapeHtml(user.name || '用户')

    return renderLayout({
        appName,
        url,
        body: `
    <h2 style="font-size:24px;line-height:32px;margin:0;color:#374151;">你好，${safeName}：</h2>
    <p style="margin:16px 0 0;font-size:16px;line-height:28px;color:#4b5563;">
      感谢你注册 ${safeAppName}。请点击下方按钮验证邮箱地址，完成账号启用。
    </p>
    ${actionButton(url, '验证邮箱')}
    <p style="margin:24px 0 0;font-size:16px;line-height:26px;color:#4b5563;">出于安全考虑，此验证链接将在 ${expirationHours} 小时后失效。</p>
    <p style="margin:24px 0 0;font-size:16px;line-height:26px;color:#4b5563;">谢谢，<br>${safeAppName} 团队</p>`
    })
}

export function renderResetPasswordEmail({ appName, expirationHours, user, url }: EmailTemplateOptions) {
    const safeAppName = escapeHtml(appName)
    const safeName = escapeHtml(user.name || '用户')

    return renderLayout({
        appName,
        url,
        body: `
    <h2 style="font-size:24px;line-height:32px;margin:0;color:#374151;">你好，${safeName}：</h2>
    <p style="margin:16px 0 0;font-size:16px;line-height:28px;color:#4b5563;">
      我们收到了重置 ${safeAppName} 账号密码的请求。请点击下方按钮设置新密码。该链接只能使用一次，并会在过期后失效。
    </p>
    ${actionButton(url, '重置密码')}
    <p style="margin:24px 0 0;font-size:16px;line-height:26px;color:#4b5563;">此密码重置链接将在 ${expirationHours} 小时后失效。</p>
    <p style="margin:24px 0 0;font-size:16px;line-height:26px;color:#4b5563;">如果这不是你本人操作，可以忽略这封邮件。</p>
    <p style="margin:24px 0 0;font-size:16px;line-height:26px;color:#4b5563;">谢谢，<br>${safeAppName} 团队</p>`
    })
}
