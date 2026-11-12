import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	signOut,
	updateProfile,
	onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

const googleProvider = new GoogleAuthProvider()

export function subscribeToAuth(callback) {
	return onAuthStateChanged(auth, callback)
}

export async function signUp(email, password, displayName) {
	const cred = await createUserWithEmailAndPassword(auth, email, password)
	if (displayName) {
		await updateProfile(cred.user, { displayName })
	}
	return cred.user
}

export function signIn(email, password) {
	return signInWithEmailAndPassword(auth, email, password)
}

export function signInWithGoogle() {
	return signInWithPopup(auth, googleProvider)
}

export function logOut() {
	return signOut(auth)
}
