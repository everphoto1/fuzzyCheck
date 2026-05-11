const glados = async () => {
  const cookie = process.env.GLADOS
  if (!cookie) return ['Checkin Skip', 'Missing GLADOS cookie']

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
    return [
      'Checkin Error',
      `${error}`,
      `<${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}>`,
    ]
  }
}

const main = async () => {
  console.log(await glados())
}

main()
