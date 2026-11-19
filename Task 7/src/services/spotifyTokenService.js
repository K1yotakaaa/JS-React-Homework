import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export const tokenRef = uid => doc(db, 'users', uid, 'integrations', 'spotify')

export function buildTokenDoc(tokens) {
	return {
		access_token: tokens.access_token,
		refresh_token: tokens.refresh_token,
		expires_at: tokens.expires_at,
		...(tokens.spotifyId ? { spotifyId: tokens.spotifyId } : {}),
		lastActiveAt: Date.now(),
	}
}

export async function fetchSpotifyTokens(uid) {
	const snap = await getDoc(tokenRef(uid))
	return snap.exists() ? snap.data() : null
}

export function saveSpotifyTokens(uid, tokens) {
	return setDoc(tokenRef(uid), buildTokenDoc(tokens))
}
