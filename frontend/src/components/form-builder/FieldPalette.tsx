import { Type, Hash, ChevronDown, Circle, CheckSquare, Image as ImageIcon, GripVertical, UserCircle } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { useFormBuilderStore } from '@/store/formBuilderStore';
import { cn } from '@/lib/utils';
import type { FormField } from '@/types';

export const FIELD_TYPES: Array<{
  type: FormField['type'];
  label: string;
  icon: typeof Type;
  color: string;
  iconBg: string;
}> = [
  { type: 'text', label: 'Text Input', icon: Type, color: 'text-blue-600', iconBg: 'bg-blue-50 ring-blue-100' },
  { type: 'number', label: 'Number', icon: Hash, color: 'text-emerald-600', iconBg: 'bg-emerald-50 ring-emerald-100' },
  { type: 'select', label: 'Dropdown', icon: ChevronDown, color: 'text-purple-600', iconBg: 'bg-purple-50 ring-purple-100' },
  { type: 'radio', label: 'Radio Group', icon: Circle, color: 'text-amber-600', iconBg: 'bg-amber-50 ring-amber-100' },
  { type: 'checkbox_group', label: 'Checkboxes', icon: CheckSquare, color: 'text-orange-600', iconBg: 'bg-orange-50 ring-orange-100' },
  { type: 'file_upload', label: 'Media Upload', icon: ImageIcon, color: 'text-rose-600', iconBg: 'bg-rose-50 ring-rose-100' },
];

function DraggablePaletteItem({ fieldType }: { fieldType: typeof FIELD_TYPES[number] }) {
  const addField = useFormBuilderStore((s) => s.addField);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${fieldType.type}`,
    data: { type: 'palette-item', fieldType: fieldType.type },
  });

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => addField(fieldType.type)}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-left text-sm font-medium transition-all',
        'border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300',
        'hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm',
        'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-40 shadow-none'
      )}
    >
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1', fieldType.iconBg)}>
        <fieldType.icon className={cn('h-4 w-4', fieldType.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-slate-800 text-[13px] font-semibold">{fieldType.label}</span>
      </div>
      <GripVertical className="h-3.5 w-3.5 text-slate-300 shrink-0" />
    </button>
  );
}

export default function FieldPalette() {
  const collectRespondentInfo = useFormBuilderStore((s) => s.collectRespondentInfo);
  const setCollectRespondentInfo = useFormBuilderStore((s) => s.setCollectRespondentInfo);

  return (
    <div className="space-y-5">
      <div>
        <div className="px-1 mb-2">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Drag or click to add
          </h3>
        </div>
        <div className="space-y-1.5">
          {FIELD_TYPES.map((ft) => (
            <DraggablePaletteItem key={ft.type} fieldType={ft} />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 mb-3">
          Form Settings
        </h3>
        <button
          onClick={() => setCollectRespondentInfo(!collectRespondentInfo)}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all border',
            collectRespondentInfo
              ? 'bg-primary/5 border-primary/30 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          )}
        >
          <div className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
            collectRespondentInfo ? 'bg-primary/10 ring-primary/20' : 'bg-slate-50 ring-slate-100'
          )}>
            <UserCircle className={cn('h-4 w-4', collectRespondentInfo ? 'text-primary' : 'text-slate-400')} />
          </div>
          <div className="flex-1 min-w-0">
            <span className={cn('text-[13px] font-semibold', collectRespondentInfo ? 'text-primary' : 'text-slate-700')}>
              Collect Identity
            </span>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
              Name &amp; email from respondent
            </p>
          </div>
          <div className={cn(
            'h-5 w-9 rounded-full transition-colors shrink-0 relative',
            collectRespondentInfo ? 'bg-primary' : 'bg-slate-200'
          )}>
            <div className={cn(
              'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
              collectRespondentInfo ? 'translate-x-4' : 'translate-x-0.5'
            )} />
          </div>
        </button>
      </div>
    </div>
  );
}
