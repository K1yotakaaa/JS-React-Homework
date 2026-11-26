import { doc, writeBatch } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { tokenRef, buildTokenDoc } from './spotifyTokenService'

const linkRef = spotifyId => doc(db, 'spotifyLinks', String(spotifyId))

export async function claimSpotifyLink(
	uid,
	spotifyId,
	tokens,
	previousSpotifyId = null,
) {
	const batch = writeBatch(db)
	batch.set(linkRef(spotifyId), { uid, linkedAt: Date.now() })
	batch.set(tokenRef(uid), buildTokenDoc({ ...tokens, spotifyId }))
	if (previousSpotifyId && previousSpotifyId !== spotifyId) {
		batch.delete(linkRef(previousSpotifyId))
	}

	try {
		await batch.commit()
	} catch (e) {
		if (e.code === 'permission-denied') {
			throw new Error('spotify_already_linked')
		}
		throw e
	}
}

export async function releaseSpotifyConnection(uid, spotifyId) {
	const batch = writeBatch(db)
	batch.delete(tokenRef(uid))
	if (spotifyId) batch.delete(linkRef(spotifyId))
	await batch.commit()
}
