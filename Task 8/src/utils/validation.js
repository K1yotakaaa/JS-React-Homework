export const NAME_MAX = 40
export const PASSWORD_MIN = 8
export const PASSWORD_MAX = 128

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const NAME_RE = /^[\p{L}\p{N} .'_-]+$/u

export const PASSWORD_RULES = [
	{
		id: 'length',
		label: `At least ${PASSWORD_MIN} characters`,
		short: `${PASSWORD_MIN}+ characters`,
		test: p => p.length >= PASSWORD_MIN,
	},
	{
		id: 'lower',
		label: 'One lowercase letter',
		short: 'a lowercase letter',
		test: p => /[a-z]/.test(p),
	},
	{
		id: 'upper',
		label: 'One uppercase letter',
		short: 'an uppercase letter',
		test: p => /[A-Z]/.test(p),
	},
	{
		id: 'number',
		label: 'One number',
		short: 'a number',
		test: p => /\d/.test(p),
	},
]

export function validateEmail(value) {
	const email = (value || '').trim()
	if (!email) return 'Email is required.'
	if (email.length > 254 || !EMAIL_RE.test(email)) {
		return 'Enter a valid email address, like name@example.com.'
	}
	return null
}

export function validateNewPassword(value) {
	if (!value) return 'Password is required.'
	if (value.length > PASSWORD_MAX) {
		return `Password must be at most ${PASSWORD_MAX} characters.`
	}
	const failed = PASSWORD_RULES.filter(r => !r.test(value))
	if (failed.length) {
		return `Password needs ${failed.map(r => r.short).join(', ')}.`
	}
	return null
}

export function validateLoginPassword(value) {
	if (!value) return 'Password is required.'
	if (value.length > PASSWORD_MAX) return 'Password is too long.'
	return null
}

export function validateConfirm(password, confirm) {
	if (!confirm) return 'Please confirm your password.'
	if (password !== confirm) return 'Passwords do not match.'
	return null
}

export function validateName(value) {
	const name = (value || '').trim()
	if (!name) return null
	if (name.length > NAME_MAX) {
		return `Display name must be at most ${NAME_MAX} characters.`
	}
	if (!NAME_RE.test(name)) {
		return "Use only letters, numbers, spaces and . ' _ -"
	}
	return null
}

function collect(entries) {
	const errors = {}
	for (const [key, msg] of entries) if (msg) errors[key] = msg
	return errors
}

export function validateLogin({ email, password }) {
	return collect([
		['email', validateEmail(email)],
		['password', validateLoginPassword(password)],
	])
}

export function validateSignup({ name, email, password, confirm }) {
	return collect([
		['name', validateName(name)],
		['email', validateEmail(email)],
		['password', validateNewPassword(password)],
		['confirm', validateConfirm(password, confirm)],
	])
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']

export function getPasswordStrength(password) {
	if (!password) return { level: 0, label: '' }
	const passed = PASSWORD_RULES.filter(r => r.test(password)).length
	let level = passed <= 1 ? 1 : passed <= 3 ? 2 : 3
	if (
		passed === PASSWORD_RULES.length &&
		(password.length >= 12 || /[^A-Za-z0-9]/.test(password))
	) {
		level = 4
	}
	return { level, label: STRENGTH_LABELS[level] }
}
