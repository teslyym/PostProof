async function request(path, options) {
  let res
  try {
    res = await fetch(path, options)
  } catch {
    throw new Error('Cannot reach the PostProof service. Check that the backend is running.')
  }

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    const detail = body && body.detail
    const message = Array.isArray(detail)
      ? detail.map((d) => d.msg.replace(/^Value error, /, '')).join(' ')
      : detail
    throw new Error(message || `The service returned an error (${res.status}).`)
  }

  return body
}

export const getHealth = () => request('/health')

export const getAudit = () => request('/audit')

export const verify = (payload) =>
  request('/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })