const taskUrl = process.env.SEED_TASK_URL || 'http://localhost:3699/_nitro/tasks/seed:users'

try {
    const response = await fetch(taskUrl, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: '{}'
    })

    const text = await response.text()

    if (!response.ok) {
        throw new Error(text || `种子任务执行失败，HTTP 状态码：${response.status}`)
    }

    console.log(text)
} catch (error) {
    console.error(`无法在 ${taskUrl} 执行种子任务。请确认 \`pnpm dev\` 正在运行。`)
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
}
