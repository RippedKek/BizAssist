'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Filter, ArrowUpDown, MoreHorizontal } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import InputIdeaModal from '../../components/InputIdeaModal'
import Link from 'next/link'
import { useAppSelector } from '../redux/hooks'
import { db } from '../firebase/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  documentId,
} from 'firebase/firestore'
import { deletePitchById } from '../firebase/pitches'
import { removePitchIdFromUser } from '../firebase/users'

const MyPitchesPage = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date')
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'Validated' | 'Draft'
  >('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pitches, setPitches] = useState<
    Array<{
      id: string
      title: string
      lastUpdated: string
      status: 'Validated' | 'Draft'
    }>
  >([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    title: string
  } | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const isDark = theme === 'dark'
  const { user } = useAppSelector((state) => state.user)

  useEffect(() => {
    const fetchUserPitches = async () => {
      if (!user?.email) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        // Read user's pitches array from users/{email}
        const userRef = doc(db, 'users', user.email)
        const userSnap = await getDoc(userRef)
        const userData = userSnap.exists() ? (userSnap.data() as any) : null
        const pitchIds: string[] = Array.isArray(userData?.pitches)
          ? userData.pitches.filter((x: any) => typeof x === 'string')
          : []

        if (pitchIds.length === 0) {
          setPitches([])
          setLoading(false)
          return
        }

        // Firestore 'in' supports up to 10 ids. Chunk if necessary.
        const chunk = <T,>(arr: T[], size: number) =>
          arr.reduce(
            (acc: T[][], _, i) =>
              i % size ? acc : [...acc, arr.slice(i, i + size)],
            []
          )

        const chunks = chunk(pitchIds, 10)
        const results: Array<{ id: string; data: any }> = []
        for (const ids of chunks) {
          const q = query(
            collection(db, 'pitches'),
            where(documentId(), 'in', ids)
          )
          const snap = await getDocs(q)
          snap.forEach((d) => results.push({ id: d.id, data: d.data() }))
        }

        // Map to UI items
        const toRel = (d: any): string => {
          try {
            const ts: any = d?.updatedAt || d?.createdAt
            const millis = ts?.toMillis
              ? ts.toMillis()
              : typeof ts === 'number'
              ? ts
              : Date.now()
            const diff = Date.now() - millis
            const mins = Math.floor(diff / 60000)
            if (mins < 60) return `${mins} min ago`
            const hours = Math.floor(mins / 60)
            if (hours < 24) return `${hours} hr ago`
            const days = Math.floor(hours / 24)
            return `${days} day${days === 1 ? '' : 's'} ago`
          } catch {
            return '—'
          }
        }

        const mapped = results
          .sort((a, b) => {
            const aMs = a.data?.updatedAt?.toMillis?.() || 0
            const bMs = b.data?.updatedAt?.toMillis?.() || 0
            return bMs - aMs
          })
          .map(({ id, data }) => ({
            id,
            title:
              data?.businessTitle ||
              data?.draftIdea?.aiSummary?.slice(0, 40) ||
              'Untitled Pitch',
            lastUpdated: toRel(data),
            status: (data?.status === 'completed' ? 'Validated' : 'Draft') as
              | 'Validated'
              | 'Draft',
          }))

        setPitches(mapped)
      } catch (e) {
        console.error('Error loading pitches:', e)
        setError('Failed to load pitches')
      } finally {
        setLoading(false)
      }
    }

    fetchUserPitches()
  }, [user])

  const filteredAndSortedPitches = useMemo(() => {
    let filtered = pitches.filter((pitch) => {
      const matchesSearch = pitch.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesStatus =
        filterStatus === 'all' || pitch.status === filterStatus
      return matchesSearch && matchesStatus
    })

    if (sortBy === 'date') {
      // already sorted by updatedAt desc during fetch; keep as-is
    } else if (sortBy === 'status') {
      filtered.sort((a, b) => a.status.localeCompare(b.status))
    }

    return filtered
  }, [pitches, searchQuery, filterStatus, sortBy])

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900'
      }`}
    >
      <Navbar
        theme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
        showHomeLink={true}
        showMyPitchesLink={false}
        showLogout={true}
      />

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-6 py-8'>
        {/* Page Heading */}
        <div className='flex flex-wrap items-center justify-between gap-4 mb-8'>
          <h1
            className={`text-4xl font-black ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            My Pitches
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className={`group flex h-14 px-8 items-center justify-center rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl ${
              isDark
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white'
            }`}
          >
            Create New Pitch
            <svg
              className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 7l5 5m0 0l-5 5m5-5H6'
              />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div
          className={`flex flex-wrap items-center justify-between gap-4 p-2 rounded-lg mb-6 ${
            isDark ? 'bg-gray-800/40' : 'bg-white/40 border border-gray-200'
          }`}
        >
          <div className='relative flex-1 min-w-[250px]'>
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}
            />
            <input
              type='text'
              placeholder='Search pitches...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-md border-0 ${
                isDark
                  ? 'bg-gray-800 text-gray-200 placeholder:text-gray-400'
                  : 'bg-gray-50 text-gray-800 placeholder:text-gray-500'
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() =>
                setFilterStatus(
                  filterStatus === 'all'
                    ? 'Validated'
                    : filterStatus === 'Validated'
                    ? 'Draft'
                    : 'all'
                )
              }
              className={`flex items-center gap-2 h-9 px-3 rounded-md text-sm font-medium ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <Filter className='w-4 h-4' />
              <span>
                Status: {filterStatus === 'all' ? 'All' : filterStatus}
              </span>
            </button>
            <button
              onClick={() => setSortBy(sortBy === 'date' ? 'status' : 'date')}
              className={`flex items-center gap-2 h-9 px-3 rounded-md text-sm font-medium ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <ArrowUpDown className='w-4 h-4' />
              <span>Sort: {sortBy === 'date' ? 'Date' : 'Status'}</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className='overflow-hidden rounded-xl border border-gray-700'>
          <div
            className={`overflow-x-auto ${
              isDark ? 'bg-gray-800/30' : 'bg-white'
            }`}
          >
            <table className='w-full'>
              <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <tr>
                  <th
                    className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    Pitch Title
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    Last Updated
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    Status
                  </th>
                  <th
                    className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-700'>
                {(() => {
                  if (loading) {
                    return (
                      <tr>
                        <td
                          colSpan={4}
                          className={`px-6 py-8 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Loading pitches...
                        </td>
                      </tr>
                    )
                  }
                  if (error) {
                    return (
                      <tr>
                        <td
                          colSpan={4}
                          className={`px-6 py-8 ${
                            isDark ? 'text-red-400' : 'text-red-600'
                          }`}
                        >
                          {error}
                        </td>
                      </tr>
                    )
                  }
                  if (filteredAndSortedPitches.length === 0) {
                    return (
                      <tr>
                        <td
                          colSpan={4}
                          className={`px-6 py-8 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          No pitches yet. Click "Create New Pitch" to start.
                        </td>
                      </tr>
                    )
                  }
                  return filteredAndSortedPitches.map((pitch) => (
                    <tr
                      key={pitch.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td
                        className={`px-6 py-4 font-semibold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        <Link
                          href={`/pitch-dashboard?id=${encodeURIComponent(
                            String(pitch.id)
                          )}`}
                          className='hover:underline'
                        >
                          {pitch.title}
                        </Link>
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {pitch.lastUpdated}
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            pitch.status === 'Validated'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {pitch.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <div className='relative inline-block text-left'>
                          <button
                            onClick={() =>
                              setOpenMenuId((prev) =>
                                prev === String(pitch.id)
                                  ? null
                                  : String(pitch.id)
                              )
                            }
                            className={`p-2 rounded-full ${
                              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                            aria-label='More actions'
                          >
                            <MoreHorizontal className='w-5 h-5' />
                          </button>
                          {openMenuId === String(pitch.id) && (
                            <div
                              className={`absolute right-0 mt-2 w-40 rounded-md shadow-lg ring-1 ring-black/5 z-10 ${
                                isDark
                                  ? 'bg-gray-900 border border-gray-800'
                                  : 'bg-white border border-gray-200'
                              }`}
                            >
                              <button
                                onClick={() => {
                                  setOpenMenuId(null)
                                  setDeleteTarget({
                                    id: String(pitch.id),
                                    title: pitch.title,
                                  })
                                  setConfirmText('')
                                  setShowDeleteModal(true)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm rounded-md ${
                                  isDark
                                    ? 'hover:bg-gray-800 text-red-300'
                                    : 'hover:bg-gray-50 text-red-700'
                                }`}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showDeleteModal && deleteTarget && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
          <div
            className={`w-full max-w-lg rounded-xl border ${
              isDark
                ? 'bg-gray-900 border-gray-800'
                : 'bg-white border-gray-200'
            } shadow-2xl`}
          >
            <div
              className={`p-6 border-b ${
                isDark ? 'border-gray-800' : 'border-gray-200'
              }`}
            >
              <h2 className='text-xl font-bold'>Delete pitch</h2>
              <p
                className={`mt-2 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                This action cannot be undone. This will permanently delete the
                pitch
                <span
                  className={`font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {' '}
                  "{deleteTarget.title}"
                </span>
                .
              </p>
            </div>
            <div className='p-6 space-y-4'>
              <p
                className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Please type the pitch title to confirm:
              </p>
              <input
                type='text'
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={deleteTarget.title}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 ${
                  isDark ? 'focus:ring-red-500/20' : 'focus:ring-red-500/20'
                }`}
              />
            </div>
            <div
              className={`p-6 border-t ${
                isDark ? 'border-gray-800' : 'border-gray-200'
              } flex justify-end gap-3`}
            >
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteTarget(null)
                  setConfirmText('')
                }}
                className={`${
                  isDark
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                } px-4 py-2 rounded-lg`}
              >
                Cancel
              </button>
              <button
                disabled={confirmText !== deleteTarget.title || isDeleting}
                onClick={async () => {
                  if (!user?.email) return
                  setIsDeleting(true)
                  try {
                    await deletePitchById(deleteTarget.id)
                    await removePitchIdFromUser(user.email, deleteTarget.id)
                    setPitches((prev) =>
                      prev.filter(
                        (p) => String(p.id) !== String(deleteTarget.id)
                      )
                    )
                    setShowDeleteModal(false)
                    setDeleteTarget(null)
                    setConfirmText('')
                  } catch (e) {
                    console.error('Delete failed:', e)
                  } finally {
                    setIsDeleting(false)
                  }
                }}
                className={`${
                  confirmText !== deleteTarget.title || isDeleting
                    ? isDark
                      ? 'bg-red-700/40 text-red-300 cursor-not-allowed'
                      : 'bg-red-200 text-red-500 cursor-not-allowed'
                    : isDark
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } px-4 py-2 rounded-lg`}
              >
                {isDeleting ? 'Deleting...' : 'Delete this pitch'}
              </button>
            </div>
          </div>
        </div>
      )}

      <InputIdeaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        theme={theme}
      />
    </div>
  )
}

export default MyPitchesPage
