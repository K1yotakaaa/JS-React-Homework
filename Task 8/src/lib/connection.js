export async function checkConnection(timeoutMs = 4000) {
	if (typeof navigator !== 'undefined' && navigator.onLine === false)
		return false
	const controller = new AbortController()
	const timer = setTimeout(() => controller.abort(), timeoutMs)
	try {
		const res = await fetch(`/manifest.json?__ping=${Date.now()}`, {
			cache: 'no-store',
			signal: controller.signal,
		})
		return res.ok
	} catch {
		return false
	} finally {
		clearTimeout(timer)
	}
}