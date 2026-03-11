import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, Download } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Pagination from '@/components/Pagination';
import { submissionsApi, formsApi, metadataApi } from '@/api';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

export default function SubmissionsListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const skip = (page - 1) * PAGE_SIZE;

  const { data: form } = useQuery({
    queryKey: ['form', id],
    queryFn: () => formsApi.get(id!),
    enabled: !!id,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['submissions', id, page],
    queryFn: () => submissionsApi.list(id!, { skip, limit: PAGE_SIZE }),
    enabled: !!id,
  });

  const submissions = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => metadataApi.getBranches(),
  });

  const branchMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const b of branches) {
      map[b.id] = `${b.name} — ${b.location}`;
    }
    return map;
  }, [branches]);

  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    const headers = Object.keys(submissions[0]).join(',');
    const rows = submissions.map((s) =>
      Object.values(s)
        .map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v)))
        .join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions-${form?.title || id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/')}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">Submissions</h1>
              <p className="text-sm text-slate-500 truncate">
                {form?.title || 'Loading...'}{total > 0 && ` · ${total} total`}
              </p>
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={submissions.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 self-start sm:self-auto"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 sm:p-16 text-center shadow-sm">
            <p className="text-base sm:text-lg font-medium text-slate-500">No submissions yet</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">ID</th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Respondent</th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Branch</th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Submitted</th>
                      <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <motion.tr
                        key={sub.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                      >
                        <td className="px-5 py-3.5 text-sm text-slate-700 font-mono">
                          {sub.id.substring(0, 8)}...
                        </td>
                        <td className="px-5 py-3.5">
                          {sub.respondent_name ? (
                            <div>
                              <p className="text-sm font-medium text-slate-800">{sub.respondent_name}</p>
                              {sub.respondent_email && <p className="text-xs text-slate-400">{sub.respondent_email}</p>}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Anonymous</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-700">
                          {branchMap[sub.branch_id] || sub.branch_id.substring(0, 8) + '...'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
                              STATUS_COLORS[sub.status] || STATUS_COLORS.pending
                            )}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-500">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            to={`/submissions/${sub.id}`}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 inline-flex"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
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
              {submissions.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/submissions/${sub.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm active:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      {sub.respondent_name ? (
                        <p className="text-sm font-medium text-slate-800 truncate">{sub.respondent_name}</p>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Anonymous</span>
                      )}
                      {sub.respondent_email && <p className="text-xs text-slate-400 truncate">{sub.respondent_email}</p>}
                    </div>
                    <span
                      className={cn(
                        'shrink-0 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
                        STATUS_COLORS[sub.status] || STATUS_COLORS.pending
                      )}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-1 truncate">
                    {branchMap[sub.branch_id] || sub.branch_id.substring(0, 8) + '...'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>v{sub.form_version}</span>
                    <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
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
