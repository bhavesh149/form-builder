import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { metadataApi } from '@/api';
import { toast } from 'sonner';
import { X, Plus, MapPin, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function BranchManagerModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => metadataApi.getBranches(),
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; location: string }) =>
      metadataApi.createBranch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Branch created');
      setName('');
      setLocation('');
      setShowForm(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || 'Failed to create branch';
      toast.error(typeof msg === 'string' ? msg : 'Failed to create branch');
    },
  });

  const handleCreate = () => {
    if (!name.trim()) { toast.warning('Branch name is required'); return; }
    if (!location.trim()) { toast.warning('Location is required'); return; }
    createMutation.mutate({ name: name.trim(), location: location.trim() });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
        <motion.div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Branches / Sites</h2>
                <p className="text-xs text-slate-500">{branches.length} branch{branches.length !== 1 ? 'es' : ''} configured</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Branch list */}
          <div className="max-h-72 overflow-y-auto px-6 py-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : branches.length === 0 ? (
              <div className="py-8 text-center">
                <MapPin className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No branches yet. Add your first one below.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <MapPin className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{branch.name}</p>
                      <p className="text-xs text-slate-500 truncate">{branch.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add new form */}
          <div className="border-t border-slate-200 px-6 py-4">
            {showForm ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Branch Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. East Wing"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Boston, MA"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-primary-hover disabled:opacity-50',
                    )}
                  >
                    {createMutation.isPending ? 'Adding...' : 'Add Branch'}
                  </button>
                  <button
                    onClick={() => { setShowForm(false); setName(''); setLocation(''); }}
                    className="rounded-lg px-4 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-medium text-slate-500 transition-colors hover:border-primary/30 hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                Add New Branch
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
