import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Send, RotateCcw, CheckCircle2, FileText, User, Mail } from 'lucide-react';

import DynamicFieldRenderer from '@/components/form-renderer/DynamicFieldRenderer';
import { formsApi, submissionsApi, metadataApi, uploadsApi } from '@/api';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useLogicEngine } from '@/hooks/useLogicEngine';
import { useDraftSave } from '@/hooks/useDraftSave';
import { cn } from '@/lib/utils';
import type { FormField } from '@/types';

export default function FormSubmitPage() {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [respondentName, setRespondentName] = useState('');
  const [respondentEmail, setRespondentEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const { data: form, isLoading } = useQuery({
    queryKey: ['form', id],
    queryFn: () => formsApi.get(id!),
    enabled: !!id,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => metadataApi.getBranches(),
  });

  const fields = form?.latest_version?.fields_schema || [];
  const logicRules = form?.latest_version?.logic_rules || [];

  // Logic engine — evaluates conditional visibility, dynamic required, highlighting
  const { visibleFields, requiredFields, highlightedFields } = useLogicEngine(
    logicRules,
    fields,
    formData,
  );

  // Draft autosave
  const { loadDraft, clearDraft, hasDraft } = useDraftSave(id, formData);

  // Load saved draft on mount
  useEffect(() => {
    if (hasDraft()) {
      const draft = loadDraft();
      if (draft) {
        setFormData(draft);
        toast.info('Draft restored', { description: 'Your previous progress has been loaded' });
      }
    }
  }, []);

  // Add branch options to dynamic select fields
  const enrichedFields: FormField[] = fields.map((field) => {
    if (field.data_source === '/metadata/branches') {
      return {
        ...field,
        options: branches.map((b) => ({ label: `${b.name} — ${b.location}`, value: b.id })),
      };
    }
    return field;
  });

  const handleChange = (fieldId: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const handleFileUpload = async (fieldId: string, file: File) => {
    setUploadingField(fieldId);
    try {
      const result = await uploadsApi.upload(file);
      setFormData((prev) => ({ ...prev, [fieldId]: result.url }));
      toast.success('File uploaded successfully');
    } catch {
      toast.error('File upload failed');
    } finally {
      setUploadingField(null);
    }
  };

  const collectRespondentInfo = form?.collect_respondent_info ?? false;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (collectRespondentInfo) {
      if (!respondentName.trim()) newErrors['respondent_name'] = 'Name is required';
      if (!respondentEmail.trim()) {
        newErrors['respondent_email'] = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(respondentEmail)) {
        newErrors['respondent_email'] = 'Please enter a valid email';
      }
    }

    if (!formData['branch_id']) {
      newErrors['branch_id'] = 'Please select a branch';
    }

    for (const field of fields) {
      const isRequired = requiredFields.has(field.id);
      const isVisible = visibleFields.has(field.id);
      if (isRequired && isVisible && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildSubmissionData = (): Record<string, unknown> => {
    const { branch_id: _, ...rawData } = formData;
    const mapped: Record<string, unknown> = {};
    const fieldMap = new Map(fields.map((f) => [f.id, f]));

    for (const [key, value] of Object.entries(rawData)) {
      const field = fieldMap.get(key);
      const outKey = field?.name || key;
      mapped[outKey] = value;
    }
    return mapped;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.warning('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await submissionsApi.create(id!, {
        branch_id: formData['branch_id'] as string,
        submission_data: buildSubmissionData(),
        ...(collectRespondentInfo && {
          respondent_name: respondentName.trim(),
          respondent_email: respondentEmail.trim(),
        }),
      });
      clearDraft();
      setSubmitted(true);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'object' && detail?.field_errors) {
        const fieldErrors = detail.field_errors as Record<string, string>;
        setErrors(fieldErrors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error(typeof detail === 'string' ? detail : 'Submission failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    );
  }

  if (!form) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-12 text-slate-500">
        Form not found
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="mx-auto max-w-md w-full text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Thank You!</h1>
          <p className="text-slate-500 mb-8">
            Your form <span className="font-medium text-slate-700">"{form.title}"</span> has been submitted successfully.
          </p>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm mb-8">
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{form.title}</p>
                <p className="text-xs text-slate-500">Submission received &middot; {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({});
              setErrors({});
              setRespondentName('');
              setRespondentEmail('');
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover"
          >
            <Send className="h-4 w-4" />
            Submit Another Response
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{form.title}</h1>
            <p className="text-sm text-slate-500">Fill and submit this form</p>
          </div>
          {hasDraft() && (
            <button
              onClick={() => { setFormData({}); clearDraft(); toast.info('Draft cleared'); }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 self-start sm:self-auto shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear Draft
            </button>
          )}
        </div>

        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
          {/* Respondent info */}
          {collectRespondentInfo && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-slate-800">Your Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={respondentName}
                      onChange={(e) => { setRespondentName(e.target.value); setErrors((p) => { const n = {...p}; delete n['respondent_name']; return n; }); }}
                      placeholder="John Doe"
                      className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  {errors['respondent_name'] && <p className="mt-1 text-xs text-red-500">{errors['respondent_name']}</p>}
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={respondentEmail}
                      onChange={(e) => { setRespondentEmail(e.target.value); setErrors((p) => { const n = {...p}; delete n['respondent_email']; return n; }); }}
                      placeholder="john@example.com"
                      className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  {errors['respondent_email'] && <p className="mt-1 text-xs text-red-500">{errors['respondent_email']}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Branch selector */}
          <div className="mb-6">
            <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
              Branch / Site <span className="text-red-500">*</span>
            </label>
            <select
              value={(formData['branch_id'] as string) || ''}
              onChange={(e) => handleChange('branch_id', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="" className="bg-white">Select branch...</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-white">
                  {b.name} — {b.location}
                </option>
              ))}
            </select>
            {errors['branch_id'] && (
              <p className="mt-1 text-xs text-red-500">{errors['branch_id']}</p>
            )}
          </div>

          <hr className="border-slate-200 mb-6" />

          {/* Dynamic fields */}
          <div className="space-y-5">
            {enrichedFields.filter((f) => visibleFields.has(f.id)).map((field) => (
              <div
                key={field.id}
                className={cn(
                  highlightedFields.has(field.id) && 'rounded-lg ring-2 ring-amber-500/30 p-3 bg-amber-500/5'
                )}
              >
                {field.type === 'video_upload' || field.type === 'file_upload' ? (
                  <MediaUploadField
                    field={{ ...field, required: requiredFields.has(field.id) }}
                    value={formData[field.id]}
                    onUpload={(file) => handleFileUpload(field.id, file)}
                    uploading={uploadingField === field.id}
                    error={errors[field.id]}
                  />
                ) : (
                  <DynamicFieldRenderer
                    field={{ ...field, required: requiredFields.has(field.id) }}
                    value={formData[field.id]}
                    onChange={(val) => handleChange(field.id, val)}
                    error={errors[field.id]}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            {submitting ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </div>
    </main>
  );
}

function MediaUploadField({
  field,
  value,
  onUpload,
  uploading,
  error,
}: {
  field: FormField;
  value: unknown;
  onUpload: (file: File) => void;
  uploading: boolean;
  error?: string;
}) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0]);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'video/*': ['.mp4', '.webm', '.mov'],
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
  });

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </label>
      <div
        {...getRootProps()}
        className={`rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors cursor-pointer ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary/30'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-primary">Uploading...</span>
          </div>
        ) : value ? (
          <div>
            <p className="text-sm font-medium text-emerald-600">✅ File uploaded</p>
            <p className="mt-1 text-xs text-slate-500 truncate">{String(value)}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              {isDragActive ? 'Drop the file here' : 'Click or drag to upload media'}
            </p>
            <p className="mt-1 text-xs text-slate-500">Images or Video up to 100MB</p>
          </>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
