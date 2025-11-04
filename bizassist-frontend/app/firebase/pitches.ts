import { db } from './firebase'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  deleteDoc,
} from 'firebase/firestore'

export type PitchId = string

export interface PitchBase {
  user: { uid: string; email: string | null }
  businessTitle?: string
  summary?: string
  status: 'draft' | 'in_progress' | 'completed'
  currentStep?:
    | 'idea_summary'
    | 'market_analysis'
    | 'idea_ranking'
    | 'pitch_generation'
    | 'visual_branding'
}

export interface PitchDocument extends PitchBase {
  draftIdea?: {
    ideaText?: string
    aiSummary?: string
  }
  marketAnalysis?: any
  ideaRanking?: {
    rankerData?: any
    competitors?: any
  }
  pitchGeneration?: any
  visualBranding?: any
  createdAt: Timestamp
  updatedAt: Timestamp
}

const PITCHES = 'pitches'

export async function createPitchForUser(
  user: { uid: string; email: string | null },
  initial: Partial<PitchDocument>
): Promise<PitchId> {
  const now = serverTimestamp()
  const payload: any = {
    user,
    status: initial.status ?? 'in_progress',
    currentStep: initial.currentStep ?? 'idea_summary',
    businessTitle: initial.businessTitle ?? null,
    summary: initial.summary ?? null,
    draftIdea: initial.draftIdea ?? {},
    createdAt: now,
    updatedAt: now,
  }
  const ref = await addDoc(collection(db, PITCHES), payload)
  return ref.id
}

export async function updatePitch(
  pitchId: PitchId,
  updates: Partial<PitchDocument>
): Promise<void> {
  const ref = doc(db, PITCHES, pitchId)
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() })
}

export async function upsertStep(
  pitchId: PitchId,
  step:
    | 'idea_summary'
    | 'market_analysis'
    | 'idea_ranking'
    | 'pitch_generation'
    | 'visual_branding',
  data: any,
  extra?: Partial<PitchDocument>
): Promise<void> {
  const ref = doc(db, PITCHES, pitchId)
  const stepFieldMap: Record<string, string> = {
    idea_summary: 'draftIdea',
    market_analysis: 'marketAnalysis',
    idea_ranking: 'ideaRanking',
    pitch_generation: 'pitchGeneration',
    visual_branding: 'visualBranding',
  }
  const field = stepFieldMap[step]
  await updateDoc(ref, {
    [field]: data,
    currentStep: step,
    ...(extra ?? {}),
    updatedAt: serverTimestamp(),
  })
}

export async function getPitchById(
  pitchId: PitchId
): Promise<PitchDocument | null> {
  const ref = doc(db, PITCHES, pitchId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as PitchDocument
}

export async function getPitchesForUser(
  uid: string,
  max: number = 20
): Promise<Array<{ id: string; data: PitchDocument }>> {
  const q = query(
    collection(db, PITCHES),
    where('user.uid', '==', uid),
    orderBy('updatedAt', 'desc'),
    fsLimit(max)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, data: d.data() as PitchDocument }))
}

export async function deletePitchById(pitchId: PitchId): Promise<void> {
  const ref = doc(db, PITCHES, pitchId)
  await deleteDoc(ref)
}
