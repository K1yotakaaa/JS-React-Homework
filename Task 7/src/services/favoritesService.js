import {
	collection,
	doc,
	addDoc,
	deleteDoc,
	updateDoc,
	query,
	orderBy,
	getDocs,
	serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

function favoritesCol(uid) {
	return collection(db, 'users', uid, 'favorites')
}

export async function fetchFavorites(uid) {
	const q = query(favoritesCol(uid), orderBy('createdAt', 'desc'))
	const snap = await getDocs(q)
	return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addFavorite(uid, data) {
	const ref = await addDoc(favoritesCol(uid), {
		...data,
		createdAt: serverTimestamp(),
	})
	return { id: ref.id, ...data }
}

export async function removeFavorite(uid, favId) {
	await deleteDoc(doc(db, 'users', uid, 'favorites', favId))
}

export async function updateFavorite(uid, favId, patch) {
	await updateDoc(doc(db, 'users', uid, 'favorites', favId), patch)
}
