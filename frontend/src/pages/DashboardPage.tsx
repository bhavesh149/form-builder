import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { formsApi } from '@/api';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import Pagination from '@/components/Pagination';
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  FileText,
  Search,
  ClipboardList,
  Link2,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import type { FormListItem } from '@/types';

const PAGE_SIZE = 10;

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-700 border-amber-200',
  published: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  archived: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 350);

  const skip = (page - 1) * PAGE_SIZE;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['forms', debouncedSearch, page],
    queryFn: () =>
      formsApi.list({
        search: debouncedSearch || undefined,
        skip,
        limit: PAGE_SIZE,
      }),
  });

  const forms = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete form "${title}"? This cannot be undone.`)) return;
    try {
      await formsApi.delete(id);
      toast.success(`Form "${title}" deleted`);
      refetch();
    } catch {
      toast.error('Failed to delete form');
    }
  };

  const publishedCount = forms.filter(f => f.status === 'published').length;
  const draftCount = forms.filter(f => f.status === 'draft').length;

  return (
    <AppLayout>
      <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8 bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search forms..."
                className="w-full sm:w-64 rounded-lg bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary border border-slate-200"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/forms/builder"
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover w-full sm:w-auto justify-center"
              >
                <Plus className="h-4 w-4" />
                <span className="sm:inline">Create Form</span>
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 md:mb-8">
          {[
            { label: 'Total Forms', value: total, icon: FileText, color: 'text-primary' },
            { label: 'Published', value: publishedCount, icon: Eye, color: 'text-emerald-600' },
            { label: 'Drafts', value: draftCount, icon: ClipboardList, color: 'text-amber-600' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 sm:block">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 sm:mb-4", stat.color.replace('text-', 'text-'))}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-0.5 sm:mb-1">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Area */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">Form Templates</h2>
          <p className="text-xs text-slate-500">{total} total</p>
        </div>

        {/* Table / Cards */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        ) : forms.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 sm:p-16 text-center shadow-sm">
            <FileText className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-slate-400" />
            <p className="mt-4 text-base sm:text-lg font-medium text-slate-900">No forms yet</p>
            <p className="mt-1 text-sm text-slate-500">
              {isAdmin ? 'Create your first form to get started' : 'No published forms available'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Form Name</th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Version</th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Fields</th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Created</th>
                      <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {forms.map((form: FormListItem) => (
                        <motion.tr
                          key={form.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          onClick={() => { if (isAdmin) navigate(`/forms/${form.id}/submissions`); }}
                          className={cn('border-b border-slate-100 transition-colors hover:bg-slate-50', isAdmin && 'cursor-pointer')}
                        >
                          <td className="px-5 py-4">
                            <p className="font-medium text-slate-900">{form.title}</p>
                            {form.description && <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{form.description}</p>}
                          </td>
                          <td className="px-5 py-4">
                            <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[form.status] || STATUS_COLORS.draft)}>
                              {form.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500">v{form.current_version}</td>
                          <td className="px-5 py-4 text-sm text-slate-500">{form.fields_count}</td>
                          <td className="px-5 py-4 text-sm text-slate-500">{new Date(form.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              {isAdmin && (
                                <Link to={`/forms/${form.id}/edit`} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/20">
                                  <Pencil className="h-3.5 w-3.5" />Edit
                                </Link>
                              )}
                              <Link to={`/forms/${form.id}/preview`} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900" title="Preview">
                                <Eye className="h-4 w-4" />
                              </Link>
                              {form.status === 'published' && (
                                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/forms/${form.id}/submit`); toast.success("Public link copied"); }} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary" title="Copy Public Link">
                                  <Link2 className="h-4 w-4" />
                                </button>
                              )}
                              {isAdmin && (
                                <button onClick={() => handleDelete(form.id, form.title)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-500" title="Delete">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              <div className="px-5 pb-4">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={total}
                  pageSize={PAGE_SIZE}
                />
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {forms.map((form: FormListItem) => (
                <div
                  key={form.id}
                  onClick={() => { if (isAdmin) navigate(`/forms/${form.id}/submissions`); }}
                  className={cn('rounded-xl border border-slate-200 bg-white p-4 shadow-sm', isAdmin && 'cursor-pointer active:bg-slate-50')}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 truncate">{form.title}</p>
                      {form.description && <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{form.description}</p>}
                    </div>
                    <span className={cn('shrink-0 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize', STATUS_COLORS[form.status] || STATUS_COLORS.draft)}>
                      {form.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span>v{form.current_version}</span>
                    <span>{form.fields_count} fields</span>
                    <span>{new Date(form.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 border-t border-slate-100 pt-3" onClick={(e) => e.stopPropagation()}>
                    {isAdmin && (
                      <Link to={`/forms/${form.id}/edit`} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                        <Pencil className="h-3 w-3" />Edit
                      </Link>
                    )}
                    <Link to={`/forms/${form.id}/preview`} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-900">
                      <Eye className="h-4 w-4" />
                    </Link>
                    {form.status === 'published' && (
                      <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/forms/${form.id}/submit`); toast.success("Link copied"); }} className="rounded-lg p-1.5 text-slate-400 hover:text-primary">
                        <Link2 className="h-4 w-4" />
                      </button>
                    )}
                    {isAdmin && (
                      <button onClick={() => handleDelete(form.id, form.title)} className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 ml-auto">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={total}
                pageSize={PAGE_SIZE}
              />
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
