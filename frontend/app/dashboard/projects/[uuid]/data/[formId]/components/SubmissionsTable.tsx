'use client'

import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form } from './types'
import SearchBar from './SearchBar'
import SelectionActions from './SelectionActions'
import EmptyState from './EmptyState'
import CollectDialog from '@/app/dashboard/projects/[uuid]/components/CollectDialog'
import SubmissionsTableHeader from './SubmissionsTableHeader'
import SubmissionTableRow from './SubmissionTableRow'
import PageHeader from './PageHeader'
import { useSubmissionsData } from './hooks/useSubmissionsData'
import { useSubmissionSorting } from './hooks/useSubmissionSorting'
import { useSubmissionSelection } from './hooks/useSubmissionSelection'
import { useSubmissionActions } from './hooks/useSubmissionActions'

export default function SubmissionsTable({ projectId, formId }: { projectId: string; formId: string }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const {
    form,
    submissions,
    loading,
    refreshing,
    referenceCache,
    fetchData,
    updateSubmission,
    removeSubmissions
  } = useSubmissionsData(formId)

  const {
    sortConfig,
    filteredAndSortedSubmissions,
    handleSort
  } = useSubmissionSorting(submissions, searchQuery)

  const {
    selectedSubmissions,
    handleSelectSubmission,
    handleSelectAll,
    clearSelection
  } = useSubmissionSelection(filteredAndSortedSubmissions)

  const {
    editingSubmission,
    setEditingSubmission,
    handleEditSelected,
    performDeleteSelected,
    handleExportCSV,
    handleSubmissionSaved
  } = useSubmissionActions(
    formId,
    form,
    submissions,
    filteredAndSortedSubmissions,
    selectedSubmissions,
    updateSubmission,
    removeSubmissions,
    clearSelection
  )

  const requestDeleteSelected = () => {
    if (selectedSubmissions.size > 0) {
      setShowDeleteDialog(true)
    }
  }

  if (loading) {
    return (
      <main className="w-full px-8 py-8">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      </main>
    )
  }

  if (!form) {
    return (
      <main className="w-full px-8 py-8">
        <div className="text-center text-[var(--muted-foreground)]">
          Form not found
        </div>
      </main>
    )
  }

  const fields = form.schema_ || []

  return (
    <main className="w-full px-8 py-8">
      <PageHeader
        projectId={projectId}
        form={form}
        submissionsCount={submissions.length}
        refreshing={refreshing}
        filteredCount={filteredAndSortedSubmissions.length}
        onRefresh={() => fetchData(true)}
        onExport={handleExportCSV}
        onCreate={() => setShowCreateDialog(true)}
      />

      {/* Search and Selection Actions */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <SelectionActions
          selectedCount={selectedSubmissions.size}
          onEdit={handleEditSelected}
          onDelete={requestDeleteSelected}
        />
      </div>

      {/* Table */}
      {submissions.length === 0 ? (
        <EmptyState formId={form.id} />
      ) : (
        <div className="border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <SubmissionsTableHeader
                fields={fields}
                sortConfig={sortConfig}
                selectedCount={selectedSubmissions.size}
                totalCount={filteredAndSortedSubmissions.length}
                onSort={handleSort}
                onSelectAll={handleSelectAll}
              />
              <TableBody>
                {filteredAndSortedSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={fields.length + 2}
                      className="h-24 text-center text-[var(--muted-foreground)]"
                    >
                      No results found for &quot;{searchQuery}&quot;
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedSubmissions.map((submission) => (
                    <SubmissionTableRow
                      key={submission.id}
                      submission={submission}
                      fields={fields}
                      referenceCache={referenceCache}
                      isSelected={selectedSubmissions.has(submission.id)}
                      onSelect={handleSelectSubmission}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer with count */}
          <div className="border-t border-[var(--border)] bg-[var(--secondary)]/30 px-4 py-3 text-sm text-[var(--muted-foreground)]">
            Showing {filteredAndSortedSubmissions.length} of {submissions.length} submissions
          </div>
        </div>
      )}

      {/* Edit modal */}
      <CollectDialog
        formId={formId}
        submission={editingSubmission}
        onSave={handleSubmissionSaved}
        open={!!editingSubmission}
        onOpenChange={(open: boolean) => !open && setEditingSubmission(null)}
      />

      {/* Create modal */}
      <CollectDialog
        formId={formId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSave={() => fetchData(true)}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Submissions</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedSubmissions.size} submission{selectedSubmissions.size > 1 ? 's' : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await performDeleteSelected()
                setShowDeleteDialog(false)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}