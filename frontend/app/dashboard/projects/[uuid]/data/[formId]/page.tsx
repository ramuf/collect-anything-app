import React from 'react'
import SubmissionsTable from './components/SubmissionsTable'

export default async function FormDataPage({ params }: { params: any }) {
    const { uuid, formId } = await params;
    return <SubmissionsTable projectId={uuid} formId={formId} />
}
