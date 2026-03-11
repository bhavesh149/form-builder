import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Save, Eye, ArrowLeft, Code, Zap, Upload, PanelLeft, PanelRight, X,
} from 'lucide-react';
import FieldPalette from '@/components/form-builder/FieldPalette';
import FormCanvas from '@/components/form-builder/FormCanvas';
import FieldConfigPanel from '@/components/form-builder/FieldConfigPanel';
import LogicRulesModal from '@/components/form-builder/LogicRulesModal';
import { useFormBuilderStore } from '@/store/formBuilderStore';
import { formsApi } from '@/api';
import { cn } from '@/lib/utils';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { FIELD_TYPES } from '@/components/form-builder/FieldPalette';
import type { FormField } from '@/types';

export default function FormBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  const [saving, setSaving] = useState(false);
  const [showJSON, setShowJSON] = useState(false);
  const [isLogicModalOpen, setIsLogicModalOpen] = useState(false);
  const [activeDragType, setActiveDragType] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const {
    title, setTitle,
    description, setDescription,
    collectRespondentInfo,
    fields, logicRules,
    addField, reorderFields,
    selectedFieldId,
    loadForm, reset,
  } = useFormBuilderStore();

  const { data: existingForm } = useQuery({
    queryKey: ['form', id],
    queryFn: () => formsApi.get(id!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (existingForm) {
      loadForm(
        existingForm.title,
        existingForm.description || '',
        existingForm.latest_version?.fields_schema || [],
        existingForm.latest_version?.logic_rules || [],
        existingForm.collect_respondent_info,
      );
    }
    return () => { if (!isEditMode) reset(); };
  }, [existingForm]);

  useEffect(() => {
    if (selectedFieldId) {
      setShowConfig(true);
    }
  }, [selectedFieldId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;
    if (data?.type === 'palette-item') {
      setActiveDragType(data.fieldType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragType(null);
    const { active, over } = event;
    const activeData = active.data.current;

    if (activeData?.type === 'palette-item' && over) {
      addField(activeData.fieldType as FormField['type']);
      setShowPalette(false);
      return;
    }

    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderFields(oldIndex, newIndex);
    }
  };

  const handleSave = async (publish = false) => {
    if (!title.trim()) { toast.warning('Please enter a form title'); return; }
    if (fields.length === 0) { toast.warning('Please add at least one field'); return; }

    setSaving(true);
    try {
      if (isEditMode) {
        await formsApi.update(id!, {
          title,
          description: description || undefined,
          fields_schema: fields,
          logic_rules: logicRules,
          status: publish ? 'published' : undefined,
          collect_respondent_info: collectRespondentInfo,
        });
        if (publish) {
          navigator.clipboard.writeText(`${window.location.origin}/forms/${id}/submit`);
          toast.success('Form published! Public link copied to clipboard.');
        } else {
          toast.success('Form updated successfully');
        }
        queryClient.invalidateQueries({ queryKey: ['form', id] });
        queryClient.invalidateQueries({ queryKey: ['forms'] });
      } else {
        const created = await formsApi.create({
          title,
          description: description || undefined,
          fields_schema: fields,
          logic_rules: logicRules,
          collect_respondent_info: collectRespondentInfo,
        });
        queryClient.invalidateQueries({ queryKey: ['forms'] });
        if (publish) {
          await formsApi.update(created.id, { status: 'published' });
          navigator.clipboard.writeText(`${window.location.origin}/forms/${created.id}/submit`);
          toast.success('Form created and published! Link copied to clipboard.');
        } else {
          toast.success('Form created successfully');
        }
        navigate(`/forms/${created.id}/edit`);
      }
    } catch {
      toast.error('Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const dragFieldMeta = activeDragType
    ? FIELD_TYPES.find((ft) => ft.type === activeDragType)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen flex-col bg-slate-50">
        {/* Top bar */}
        <header className="z-20 flex items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-5 py-2.5 shadow-sm gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="border-l border-slate-200 pl-2 sm:pl-3 min-w-0">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Form"
                className="bg-transparent text-sm sm:text-base font-bold text-slate-900 placeholder-slate-300 focus:outline-none w-full max-w-[160px] sm:max-w-64"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                className="hidden sm:block bg-transparent text-[11px] text-slate-400 placeholder-slate-300 focus:outline-none w-72"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Mobile panel toggles */}
            <button
              onClick={() => { setShowPalette(!showPalette); setShowConfig(false); }}
              className={cn(
                'lg:hidden flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors',
                showPalette ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100'
              )}
              title="Fields Palette"
            >
              <PanelLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Fields</span>
            </button>
            <button
              onClick={() => { setShowConfig(!showConfig); setShowPalette(false); }}
              className={cn(
                'lg:hidden flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors',
                showConfig ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100'
              )}
              title="Config Panel"
            >
              <PanelRight className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </button>

            <button
              onClick={() => setShowJSON(!showJSON)}
              className={cn(
                'hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                showJSON ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <Code className="h-3.5 w-3.5" />
              JSON
            </button>
            <button
              onClick={() => setIsLogicModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <Zap className="h-3.5 w-3.5" />
              Logic
              {logicRules.length > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1 text-[10px] font-bold text-primary">
                  {logicRules.length}
                </span>
              )}
            </button>
            {isEditMode && (
              <button
                onClick={() => navigate(`/forms/${id}/preview`)}
                className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
            )}
            <div className="hidden sm:block mx-1 h-5 w-px bg-slate-200" />
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-slate-200 px-2.5 sm:px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-primary px-3 sm:px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary-hover disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Publish</span>
            </button>
          </div>
        </header>

        {/* Builder area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Mobile overlay backdrop */}
          {(showPalette || showConfig) && (
            <div
              className="absolute inset-0 z-10 bg-black/20 lg:hidden"
              onClick={() => { setShowPalette(false); setShowConfig(false); }}
            />
          )}

          {/* Left: Field Palette */}
          <div
            className={cn(
              'absolute lg:relative z-20 h-full w-64 sm:w-56 shrink-0 border-r border-slate-200 bg-white overflow-y-auto transition-transform duration-300 ease-in-out',
              'lg:translate-x-0',
              showPalette ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            )}
          >
            <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-700">Field Types</span>
              <button onClick={() => setShowPalette(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <FieldPalette />
            </div>
          </div>

          {/* Center: Canvas */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {showJSON ? (
              <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Code className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Form Schema</span>
                </div>
                <pre className="text-xs text-slate-700 overflow-auto max-h-[70vh] leading-relaxed font-mono">
                  {JSON.stringify({ title, description, collect_respondent_info: collectRespondentInfo, fields, logic_rules: logicRules }, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl">
                <FormCanvas />
              </div>
            )}
          </div>

          {/* Right: Config Panel */}
          <div
            className={cn(
              'absolute lg:relative right-0 z-20 h-full w-[320px] sm:w-80 shrink-0 border-l border-slate-200 bg-white overflow-y-auto transition-transform duration-300 ease-in-out',
              'lg:translate-x-0',
              showConfig ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
            )}
          >
            <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-700">Configuration</span>
              <button onClick={() => setShowConfig(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <FieldConfigPanel />
          </div>
        </div>
      </div>

      {/* Drag overlay for palette items */}
      <DragOverlay>
        {dragFieldMeta && (
          <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-white px-4 py-3 shadow-xl">
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg ring-1', dragFieldMeta.iconBg)}>
              <dragFieldMeta.icon className={cn('h-4 w-4', dragFieldMeta.color)} />
            </div>
            <span className="text-sm font-semibold text-slate-800">{dragFieldMeta.label}</span>
          </div>
        )}
      </DragOverlay>

      <LogicRulesModal
        isOpen={isLogicModalOpen}
        onClose={() => setIsLogicModalOpen(false)}
      />
    </DndContext>
  );
}
