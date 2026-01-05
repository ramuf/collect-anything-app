import React from 'react'
import FormEditor from './components/FormEditor'

export default async function FormBuilderPage({ params }: { params: any }) {
  const { uuid, formId } = await params;

  return <FormEditor projectId={uuid} formId={formId} />;
}
