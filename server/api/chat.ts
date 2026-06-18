import type { UIMessage } from 'ai'
import { streamText, convertToModelMessages, stepCountIs, tool } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { sql as dsql } from 'drizzle-orm'
import { createError } from 'h3'
import { useDb } from '../utils/database'
import { z } from 'h3-zod'

const DEFAULT_AI_PROVIDER_NAME = 'siliconflow'
const DEFAULT_AI_BASE_URL = 'https://api.siliconflow.cn/v1'
const DEFAULT_AI_MODEL = 'Qwen/Qwen2.5-7B-Instruct'
const WRITE_SQL_PATTERN = /\b(insert|update|delete|drop|alter|truncate|create|replace|grant|revoke|merge|call|execute)\b/i
const SQL_COMMENT_PATTERN = /(--|#|\/\*)/

function normalizeApiKey(apiKey?: string) {
    const trimmedKey = apiKey?.trim().replace(/^['"]|['"]$/g, '')
    const siliconFlowKey = trimmedKey?.match(/sk-[^\s'"]+/)?.[0]

    return siliconFlowKey || trimmedKey
}

function validateSelectSql(sql: string) {
    const normalizedSql = sql.trim()

    if (!normalizedSql) return 'SQL 不能为空。'
    if (!/^select\b/i.test(normalizedSql)) return '只允许执行只读 SELECT 查询。'
    if (normalizedSql.includes(';')) return 'SQL 必须是不带分号的单条 SELECT 语句。'
    if (SQL_COMMENT_PATTERN.test(normalizedSql)) return '不允许在 SQL 中使用注释。'
    if (WRITE_SQL_PATTERN.test(normalizedSql)) return '不允许执行写入或修改表结构的 SQL。'

    return null
}

function formatAiError(error: unknown) {
    const statusCode = (error as { statusCode?: number })?.statusCode
    const responseBody = (error as { responseBody?: string })?.responseBody
    const message = (error as { message?: string })?.message

    if (responseBody?.includes('balance is insufficient')) {
        return 'AI 服务调用失败：硅基流动账号余额不足，或免费额度不可用。请确认已开通免费模型权限、完成账号认证，或补充余额。'
    }

    if (statusCode === 403) {
        return 'AI 服务调用失败：服务商返回 403。请检查 API Key、模型权限、账号认证状态和余额。'
    }

    return message || 'AI 服务调用失败。'
}

export default defineLazyEventHandler(async () => {
    const runtimeConfig = useRuntimeConfig()
    const aiConfig = runtimeConfig.ai
    const apiKey = normalizeApiKey(aiConfig.apiKey)

    if (!apiKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'AI 服务未配置',
            message: '缺少 AI_API_KEY。请在 .env 中设置 AI_API_KEY，并重启 Nuxt 开发服务器。'
        })
    }

    const aiProvider = createOpenAICompatible({
        name: aiConfig.providerName || DEFAULT_AI_PROVIDER_NAME,
        apiKey,
        baseURL: aiConfig.baseURL || DEFAULT_AI_BASE_URL
    })

    return defineEventHandler(async (event) => {
        const db = useDb()

        const { messages }: {
            messages: UIMessage[]
        } = await readBody(event)

        const result = streamText({
            model: aiProvider.chatModel(aiConfig.model || DEFAULT_AI_MODEL),
            system: '你是这个 SaaS 应用的中文 AI 助手。默认使用中文回答。只有当用户询问数据库数据时，才使用 query_sql 工具，并且只能使用只读 SELECT 语句。',
            messages: convertToModelMessages(messages),
            maxOutputTokens: 500,
            stopWhen: stepCountIs(3),
            tools: {
                query_sql: tool({
                    description: '执行只读 SQL 查询，仅允许 SELECT。用于读取数据库数据，SQL 末尾不能带分号。',
                    inputSchema: z.object({
                        sql: z.string().min(1, 'SQL 不能为空').describe('合法的 SELECT SQL 查询，末尾不能带分号。')
                    }),
                    execute: async ({ sql }: { sql: string }) => {
                        const validationError = validateSelectSql(sql)

                        if (validationError) {
                            return { ok: false, error: validationError }
                        }

                        try {
                            const rows = await db.execute(dsql.raw(sql))
                            return { ok: true, rows }
                        } catch (error) {
                            return { ok: false, error: (error as { message?: string })?.message || '查询执行失败' }
                        }
                    }
                })
            }
        })

        return result.toUIMessageStreamResponse({
            onError: formatAiError
        })
    })
})
