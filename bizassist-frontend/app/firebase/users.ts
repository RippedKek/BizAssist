import { db } from './firebase'
import { arrayUnion, doc, setDoc } from 'firebase/firestore'

// Appends a pitchId to the user's document (keyed by email) under users/{email}
// Creates the document/field if missing via merge.
export async function appendPitchIdToUser(email: string, pitchId: string) {
  const ref = doc(db, 'users', email)
  await setDoc(
    ref,
    {
      pitches: arrayUnion(pitchId),
    },
    { merge: true }
  )
}
