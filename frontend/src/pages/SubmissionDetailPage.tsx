import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { submissionsApi, formsApi, metadataApi } from '@/api';
import type { FormField } from '@/types';

export default function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: submission, isLoading } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => submissionsApi.get(id!),
    enabled: !!id,
  });

  const { data: form } = useQuery({
    queryKey: ['form', submission?.form_id],
    queryFn: () => formsApi.get(submission!.form_id),
    enabled: !!submission?.form_id,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => metadataApi.getBranches(),
    enabled: !!submission,
  });

  const fieldLabelMap = useMemo(() => {
    const fields: FormField[] = form?.latest_version?.fields_schema || [];
    const map: Record<string, string> = {};
    for (const f of fields) {
      map[f.id] = f.label;
      if (f.name) map[f.name] = f.label;
    }
    return map;
  }, [form]);

  const branchName = useMemo(() => {
    if (!submission) return '';
    const branch = branches.find((b) => b.id === submission.branch_id);
    return branch ? `${branch.name} — ${branch.location}` : submission.branch_id;
  }, [branches, submission]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!submission) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-slate-500">Submission not found</div>
      </AppLayout>
    );
  }

  const isVideoUrl = (val: unknown): boolean => {
    if (typeof val !== 'string') return false;
    return val.includes('cloudinary') || val.match(/\.(mp4|webm|mov)/) !== null;
  };

  const resolveLabel = (key: string): string => {
    if (fieldLabelMap[key]) return fieldLabelMap[key];
    return key.replace(/_/g, ' ');
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 md:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Submission Detail</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-mono truncate">{submission.id}</p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
          {/* Respondent */}
          {(submission.respondent_name || submission.respondent_email) && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2">Respondent</p>
              <p className="text-sm font-semibold text-slate-900">{submission.respondent_name}</p>
              {submission.respondent_email && (
                <p className="text-sm text-slate-600">{submission.respondent_email}</p>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              { label: 'Form', value: form?.title || 'Loading...' },
              { label: 'Form Version', value: `v${submission.form_version}` },
              { label: 'Status', value: submission.status },
              { label: 'Submitted', value: new Date(submission.created_at).toLocaleString() },
              { label: 'Branch', value: branchName },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-slate-900 capitalize wrap-break-word">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Data */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Submitted Data
            </h3>
            <div className="space-y-4">
              {Object.entries(submission.submission_data).map(([key, value]) => (
                <div key={key} className="border-b border-slate-100 pb-3 last:border-0">
                  <p className="text-xs text-slate-500 capitalize mb-1">
                    {resolveLabel(key)}
                  </p>
                  {isVideoUrl(value) ? (
                    <video
                      src={String(value)}
                      controls
                      className="w-full rounded-lg border border-slate-200"
                    />
                  ) : (
                    <p className="text-sm text-slate-900 wrap-break-word">{String(value)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
