import { useFormBuilderStore } from '@/store/formBuilderStore';
import type { FormField } from '@/types';
import {
  GripVertical,
  Copy,
  Trash2,
  Type,
  Hash,
  ChevronDown,
  Circle,
  Video,
  CheckSquare,
  Image as ImageIcon,
  Layers,
  Asterisk,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_ICONS: Record<FormField['type'], typeof Type> = {
  text: Type,
  number: Hash,
  select: ChevronDown,
  radio: Circle,
  checkbox_group: CheckSquare,
  video_upload: Video,
  file_upload: ImageIcon,
};

const TYPE_META: Record<FormField['type'], { color: string; bg: string; label: string }> = {
  text: { color: 'text-blue-600', bg: 'bg-blue-500', label: 'Text' },
  number: { color: 'text-emerald-600', bg: 'bg-emerald-500', label: 'Number' },
  select: { color: 'text-purple-600', bg: 'bg-purple-500', label: 'Dropdown' },
  radio: { color: 'text-amber-600', bg: 'bg-amber-500', label: 'Radio' },
  checkbox_group: { color: 'text-orange-600', bg: 'bg-orange-500', label: 'Checkboxes' },
  video_upload: { color: 'text-rose-600', bg: 'bg-rose-500', label: 'Video' },
  file_upload: { color: 'text-rose-600', bg: 'bg-rose-500', label: 'Media' },
};

function FieldMiniPreview({ field }: { field: FormField }) {
  switch (field.type) {
    case 'text':
      return (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-400">
          {field.placeholder || 'Enter text...'}
        </div>
      );
    case 'number':
      return (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-400">
          {field.placeholder || '0'}
        </div>
      );
    case 'select':
      return (
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-400">
          <span>Select option...</span>
          <ChevronDown className="h-3 w-3" />
        </div>
      );
    case 'radio':
      return (
        <div className="flex items-center gap-3">
          {(field.options || []).slice(0, 3).map((opt, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="h-3 w-3 rounded-full border-2 border-slate-300" />
              {opt.label}
            </div>
          ))}
          {(field.options || []).length > 3 && (
            <span className="text-[10px] text-slate-400">+{(field.options || []).length - 3} more</span>
          )}
        </div>
      );
    case 'checkbox_group':
      return (
        <div className="flex items-center gap-3">
          {(field.options || []).slice(0, 3).map((opt, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="h-3 w-3 rounded-sm border-2 border-slate-300" />
              {opt.label}
            </div>
          ))}
        </div>
      );
    case 'video_upload':
    case 'file_upload':
      return (
        <div className="rounded-md border-2 border-dashed border-slate-200 bg-slate-50 py-2 text-center text-[10px] text-slate-400">
          Drop files or click to upload
        </div>
      );
    default:
      return null;
  }
}

function SortableFieldCard({ field }: { field: FormField }) {
  const { selectField, selectedFieldId, removeField, duplicateField } = useFormBuilderStore();
  const isSelected = selectedFieldId === field.id;
  const Icon = TYPE_ICONS[field.type];
  const meta = TYPE_META[field.type];

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, transition: { duration: 0.15 } }}
      className={cn(
        'group relative rounded-xl border bg-white transition-all cursor-pointer',
        isSelected
          ? 'border-primary ring-2 ring-primary/15 shadow-md'
          : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300',
        isDragging && 'opacity-40 shadow-xl scale-[1.02]'
      )}
      onClick={() => selectField(field.id)}
    >
      <div className="flex items-start gap-3 p-4">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab rounded p-0.5 text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className={cn('flex h-5 w-5 items-center justify-center rounded', meta.bg + '/10')}>
              <Icon className={cn('h-3 w-3', meta.color)} />
            </div>
            <span className="text-sm font-semibold text-slate-900 truncate">{field.label}</span>
            {field.required && (
              <span className="flex items-center gap-0.5 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-500 ring-1 ring-red-100">
                <Asterisk className="h-2.5 w-2.5" />
                Required
              </span>
            )}
            {field.name && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                {field.name}
              </span>
            )}
          </div>
          <FieldMiniPreview field={field} />
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {isSelected && (
        <div className={cn('h-0.5 rounded-b-xl', meta.bg)} />
      )}
    </motion.div>
  );
}

export default function FormCanvas() {
  const { fields } = useFormBuilderStore();

  const { setNodeRef, isOver } = useDroppable({ id: 'form-canvas' });

  if (fields.length === 0) {
    return (
      <div
        ref={setNodeRef}
        className={cn(
          'flex h-full items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-colors',
          isOver ? 'border-primary bg-primary/5' : 'border-slate-300 bg-white/50'
        )}
      >
        <div className="text-center max-w-xs">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Layers className="h-7 w-7 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-700">Build your form</p>
          <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
            Drag a field from the left panel or click to add it. Reorder by dragging within the canvas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-full rounded-2xl border-2 border-dashed p-4 transition-colors',
        isOver ? 'border-primary bg-primary/5' : 'border-transparent'
      )}
    >
      <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {fields.map((field) => (
              <SortableFieldCard key={field.id} field={field} />
            ))}
          </div>
        </AnimatePresence>
      </SortableContext>

      {isOver && fields.length > 0 && (
        <div className="mt-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center text-xs font-medium text-primary">
          Drop here to add field
        </div>
      )}
    </div>
  );
}
