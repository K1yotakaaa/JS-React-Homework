const FIREBASE_MESSAGES = {
	'auth/invalid-credential': 'Invalid email or password.',
	'auth/wrong-password': 'Invalid email or password.',
	'auth/user-not-found': 'Invalid email or password.',
	'auth/invalid-email': 'Please enter a valid email address.',
	'auth/user-disabled': 'This account has been disabled.',
	'auth/email-already-in-use': 'An account with this email already exists.',
	'auth/weak-password':
		'Password is too weak. Use 8+ characters with upper and lower case letters and a number.',
	'auth/password-does-not-meet-requirements':
		'Password does not meet the security requirements.',
	'auth/missing-password': 'Please enter your password.',
	'auth/too-many-requests': 'Too many attempts. Please try again later.',
	'auth/network-request-failed':
		'Network error. Check your connection and try again.',
	'auth/popup-closed-by-user': 'Sign-in cancelled.',
	'auth/cancelled-popup-request': 'Sign-in cancelled.',
	'auth/popup-blocked':
		'Your browser blocked the sign-in popup. Please allow popups and try again.',
	'auth/account-exists-with-different-credential':
		'An account already exists with this email using a different sign-in method.',
}

const FALLBACK = 'Something went wrong. Please try again.'

export function getAuthErrorMessage(err) {
	if (!err) return null
	const raw = typeof err === 'string' ? err : err.code || err.message || ''

	const fbCode = raw.match(/auth\/[\w-]+/)?.[0]
	if (fbCode) return FIREBASE_MESSAGES[fbCode] || FALLBACK

	const s = raw.toLowerCase()

	if (s.includes('spotify_already_linked'))
		return 'This Spotify account is already linked to another Tunescape account. Sign in with that account, or disconnect Spotify there first.'
	if (s.includes('permission-denied') || s.includes('insufficient permissions'))
		return "We couldn't save your Spotify connection. Please try again."
	if (s.includes('access_denied')) return 'Spotify connection cancelled.'
	if (s.includes('invalid_grant') || s.includes('token exchange'))
		return "We couldn't complete the Spotify connection. Please try again."
	if (s.includes('state mismatch') || s.includes('pkce'))
		return 'Your Spotify session expired. Please try connecting again.'
	if (s.includes('refresh failed'))
		return 'Your Spotify session expired. Please reconnect.'

	return FALLBACK
}
