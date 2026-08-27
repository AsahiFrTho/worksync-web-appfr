'use client'

import { Filter, X } from 'lucide-react'
import { Select } from '@/components/ui/field'
import {
  DEFAULT_FILTERS,
  STATUS_LABELS,
  type Filters,
} from '@/lib/compute'
import type { ComputeDB } from '@/lib/compute-types'

const SHOW_ALL = [
  'provider',
  'course',
  'district',
  'batch',
  'gender',
  'category',
  'period',
  'outcome',
] as const

export type FilterKey = (typeof SHOW_ALL)[number]

export function FilterBar({
  db,
  filters,
  setFilters,
  show = SHOW_ALL as readonly FilterKey[],
}: {
  db: ComputeDB
  filters: Filters
  setFilters: (f: Filters) => void
  show?: readonly FilterKey[]
}) {
  const set = (k: FilterKey, v: string) => setFilters({ ...filters, [k]: v })

  const providers = db.learners
    .filter((l) => l.trainingProvider)
    .map((l) => l.trainingProvider as string)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
  const courses = db.learners
    .map((l) => l.course)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
  const districts = db.settings?.districts?.length
    ? db.settings.districts
    : [...new Set(db.learners.map((l) => l.district).filter(Boolean))].sort()
  const batches = [
    ...new Set(db.learners.map((l) => l.batchName).filter((b): b is string => !!b)),
  ].sort()
  const genders = [
    ...new Set(db.learners.map((l) => l.gender).filter((g): g is string => !!g)),
  ].sort()
  const categories = [
    ...new Set(db.learners.map((l) => l.category).filter((c): c is string => !!c)),
  ].sort()

  const hasActive = Object.entries(filters).some(([k, v]) => k !== 'search' && v !== 'all')

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Filter className="size-3.5" />
        Filters
      </span>
      {show.includes('provider') && (
        <Select
          value={filters.provider}
          onChange={(v) => set('provider', v)}
          placeholder="All providers"
          options={providers.map((p) => ({ value: p, label: p }))}
        />
      )}
      {show.includes('course') && (
        <Select
          value={filters.course}
          onChange={(v) => set('course', v)}
          placeholder="All courses"
          options={courses.map((c) => ({ value: c, label: c }))}
        />
      )}
      {show.includes('district') && (
        <Select
          value={filters.district}
          onChange={(v) => set('district', v)}
          placeholder="All districts"
          options={districts.map((d) => ({ value: d, label: d }))}
        />
      )}
      {show.includes('batch') && (
        <Select
          value={filters.batch}
          onChange={(v) => set('batch', v)}
          placeholder="All batches"
          options={batches.map((b) => ({ value: b, label: b }))}
        />
      )}
      {show.includes('gender') && (
        <Select
          value={filters.gender}
          onChange={(v) => set('gender', v)}
          placeholder="All genders"
          options={genders.map((g) => ({ value: g, label: g }))}
        />
      )}
      {show.includes('category') && (
        <Select
          value={filters.category}
          onChange={(v) => set('category', v)}
          placeholder="All categories"
          options={categories.map((c) => ({ value: c, label: c }))}
        />
      )}
      {show.includes('period') && (
        <Select
          value={filters.period}
          onChange={(v) => set('period', v)}
          placeholder="All time"
          options={[
            { value: '3', label: 'Last 3 months' },
            { value: '6', label: 'Last 6 months' },
            { value: '12', label: 'Last 12 months' },
            { value: '24', label: 'Last 24 months' },
          ]}
        />
      )}
      {show.includes('outcome') && (
        <Select
          value={filters.outcome}
          onChange={(v) => set('outcome', v)}
          placeholder="All outcomes"
          options={Object.entries(STATUS_LABELS).map(([k, v]) => ({ value: k, label: v.label }))}
        />
      )}
      {hasActive && (
        <button
          onClick={() => setFilters({ ...DEFAULT_FILTERS })}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <X className="size-3" />
          Clear
        </button>
      )}
    </div>
  )
}