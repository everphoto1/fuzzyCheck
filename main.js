const glados = async () => {
  const cookie = process.env.GLADOS
  if (!cookie) throw new Error('Missing GLADOS cookie')

  const baseURL = 'https://glados.rocks'

  try {
    const headers = {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
      cookie,
      origin: baseURL,
      referer: `${baseURL}/console/checkin`,
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
    }

    const checkin = await fetch(`${baseURL}/api/user/checkin`, {
      method: 'POST',
      headers: {
        ...headers,
        'content-type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({ token: 'glados.rocks' }),
    }).then((r) => r.json())

    if (checkin.code) {
      throw new Error(`Checkin failed: ${checkin.message}`)
    }

    const status = await fetch(`${baseURL}/api/user/status`, {
      method: 'GET',
      headers,
    }).then((r) => r.json())

    if (status.code) {
      throw new Error(`Status failed: ${status.message}`)
    }

    return [
      'Checkin OK',
      `${checkin.message}`,
      `Left Days ${Number(status.data.leftDays).toFixed(2)}`,
    ]
  } catch (error) {
    // 抛出异常，交由外层处理使 workflow 失败并触发通知
    throw new Error(`Checkin Error: ${error?.message ?? error}`)
  }
}

const main = async () => {
  const result = await glados()
  console.log(result)
}

// 未捕获的错误会在这里被捕获并以非 0 退出，从而让 GitHub Actions 标记为失败并触发通知
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
