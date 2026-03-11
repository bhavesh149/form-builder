import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, ClipboardList } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { formsApi, metadataApi } from '@/api';
import DynamicFieldRenderer from '@/components/form-renderer/DynamicFieldRenderer';
import { useAuth } from '@/context/AuthContext';
import type { FormField } from '@/types';

export default function FormPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const { data: form, isLoading } = useQuery({
    queryKey: ['form', id],
    queryFn: () => formsApi.get(id!),
    enabled: !!id,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => metadataApi.getBranches(),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!form) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-slate-500">Form not found</div>
      </AppLayout>
    );
  }

  const rawFields = form.latest_version?.fields_schema || [];
  const enrichedFields: FormField[] = rawFields.map((field) => {
    if (field.data_source === '/metadata/branches') {
      return {
        ...field,
        options: branches.map((b) => ({ label: `${b.name} — ${b.location}`, value: b.id })),
      };
    }
    return field;
  });

  return (
    <AppLayout>
      <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{form.title}</h1>
              <p className="text-sm text-slate-500">Preview — v{form.current_version}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isAdmin && (
              <Link
                to={`/forms/${id}/edit`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Link>
            )}
            {form.status === 'published' && (
              <Link
                to={`/forms/${id}/submit`}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover"
              >
                <ClipboardList className="h-3.5 w-3.5" />
                Fill & Submit
              </Link>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">{form.title}</h2>
          {form.description && (
            <p className="text-sm text-slate-500 mb-6">{form.description}</p>
          )}
          <div className="space-y-5">
            {enrichedFields.map((field) => (
              <DynamicFieldRenderer key={field.id} field={field} disabled />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
