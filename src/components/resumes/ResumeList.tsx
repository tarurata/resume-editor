'use client'

import React, { useState, useEffect } from 'react'
import { ResumeListItem, ResumeFilters, ResumeService } from '@/lib/resumeService'
import ResumeCard from './ResumeCard'
import ResumeListItemComponent from './ResumeListItem'
import SearchBar from './SearchBar'
// Icons as inline SVG components
const FunnelIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
  </svg>
)

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

const DocumentTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
)

const Squares2X2Icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
  </svg>
)

const ListBulletIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
)

interface ResumeListProps {
  onEditResume: (id: string) => void
  onCreateResume: () => void
}

type SortOption = 'date' | 'company' | 'job_title'
type SortOrder = 'asc' | 'desc'
type ViewType = 'card' | 'list'

export default function ResumeList({ onEditResume, onCreateResume }: ResumeListProps) {
  const [resumes, setResumes] = useState<ResumeListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ResumeFilters>({
    search: '',
    sortBy: 'date',
    sortOrder: 'desc'
  })
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [viewType, setViewType] = useState<ViewType>('card')

  // Load resumes
  const loadResumes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ResumeService.getResumes(filters)
      setResumes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resumes')
    } finally {
      setLoading(false)
    }
  }

  // Load resumes when filters change
  useEffect(() => {
    loadResumes()
  }, [filters])

  // Handle search
  const handleSearchChange = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
  }

  // Handle sort change
  const handleSortChange = (sortBy: SortOption, sortOrder: SortOrder) => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder }))
    setShowSortMenu(false)
  }

  // Handle edit
  const handleEdit = (id: string) => {
    onEditResume(id)
  }

  // Handle duplicate
  const handleDuplicate = async (id: string) => {
    try {
      const originalResume = resumes.find(r => r.id === id)
      if (!originalResume) return

      const newCompanyName = `${originalResume.company_name} (Copy)`
      const newJobTitle = originalResume.job_title

      const duplicatedResume = await ResumeService.duplicateResume(id, newCompanyName, newJobTitle)
      setResumes(prev => [duplicatedResume, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate resume')
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingIds(prev => new Set(prev).add(id))
      await ResumeService.deleteResume(id)
      setResumes(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resume')
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  // Handle set active
  const handleSetActive = async (id: string) => {
    try {
      await ResumeService.setActiveResume(id)
      // Update the resumes to reflect the new active state
      setResumes(prev => prev.map(r => ({
        ...r,
        is_active: r.id === id
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set active resume')
    }
  }

  // Sort options
  const sortOptions = [
    { value: 'date', label: 'Date Modified', order: 'desc' as SortOrder },
    { value: 'date', label: 'Date Modified (Oldest)', order: 'asc' as SortOrder },
    { value: 'company', label: 'Company (A-Z)', order: 'asc' as SortOrder },
    { value: 'company', label: 'Company (Z-A)', order: 'desc' as SortOrder },
    { value: 'job_title', label: 'Job Title (A-Z)', order: 'asc' as SortOrder },
    { value: 'job_title', label: 'Job Title (Z-A)', order: 'desc' as SortOrder },
  ]

  const getCurrentSortLabel = () => {
    const option = sortOptions.find(opt =>
      opt.value === filters.sortBy && opt.order === filters.sortOrder
    )
    return option?.label || 'Sort by...'
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resumes</h1>
            <p className="text-gray-600">Manage your resume versions</p>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              searchTerm=""
              onSearchChange={() => { }}
              className="pointer-events-none"
            />
          </div>
          <div className="relative">
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            >
              <FunnelIcon className="h-4 w-4" />
              Sort by...
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 shadow-sm animate-pulse">
              <div className="p-4 border-b border-gray-100">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resumes</h1>
            <p className="text-gray-600">Manage your resume versions</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading resumes</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={loadResumes}
                className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (resumes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resumes</h1>
            <p className="text-gray-600">Manage your resume versions</p>
          </div>
          <button
            onClick={onCreateResume}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <PlusIcon className="h-4 w-4" />
            Create Resume
          </button>
        </div>

        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.search
              ? 'No resumes match your search criteria. Try adjusting your search terms.'
              : 'Get started by creating your first resume.'
            }
          </p>
          <div className="mt-6">
            <button
              onClick={onCreateResume}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <PlusIcon className="h-4 w-4" />
              Create Resume
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resumes</h1>
          <p className="text-gray-600">
            {resumes.length} resume{resumes.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={onCreateResume}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <PlusIcon className="h-4 w-4" />
          Create Resume
        </button>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            searchTerm={filters.search}
            onSearchChange={handleSearchChange}
            placeholder="Search by company, job title, or resume title..."
          />
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg bg-white">
            <button
              onClick={() => setViewType('card')}
              className={`p-2 rounded-l-lg transition-colors duration-200 ${viewType === 'card'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              title="Card view"
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`p-2 rounded-r-lg transition-colors duration-200 ${viewType === 'list'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              title="List view"
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Sort Menu */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <FunnelIcon className="h-4 w-4" />
              {getCurrentSortLabel()}
              <ChevronDownIcon className="h-4 w-4" />
            </button>

            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  {sortOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSortChange(option.value as SortOption, option.order)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-200 ${filters.sortBy === option.value && filters.sortOrder === option.order
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resume Display */}
      {viewType === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onSetActive={handleSetActive}
              isDeleting={deletingIds.has(resume.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((resume) => (
            <ResumeListItemComponent
              key={resume.id}
              resume={resume}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onSetActive={handleSetActive}
              isDeleting={deletingIds.has(resume.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
