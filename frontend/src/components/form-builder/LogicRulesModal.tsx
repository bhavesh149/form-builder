import { useState, useEffect } from 'react';
import { useFormBuilderStore } from '@/store/formBuilderStore';
import { Plus, Trash2, Zap, X, ArrowRight, Pencil, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { LogicRule, LogicCondition, FormField } from '@/types';

const ACTION_TYPES = [
  { value: 'show', label: 'Show Field', color: 'text-emerald-600 bg-emerald-50' },
  { value: 'hide', label: 'Hide Field', color: 'text-slate-600 bg-slate-100' },
  { value: 'require', label: 'Make Required', color: 'text-red-600 bg-red-50' },
  { value: 'unrequire', label: 'Make Optional', color: 'text-blue-600 bg-blue-50' },
  { value: 'highlight', label: 'Highlight', color: 'text-amber-600 bg-amber-50' },
] as const;

const ALL_OPERATORS = [
  { value: '==', label: 'equals', types: ['text', 'number', 'select', 'radio'] },
  { value: '!=', label: 'does not equal', types: ['text', 'number', 'select', 'radio'] },
  { value: '>', label: 'is greater than', types: ['number'] },
  { value: '<', label: 'is less than', types: ['number'] },
  { value: '>=', label: 'is at least', types: ['number'] },
  { value: '<=', label: 'is at most', types: ['number'] },
  { value: 'contains', label: 'contains', types: ['text'] },
  { value: 'includes', label: 'includes', types: ['checkbox_group'] },
  { value: 'not_includes', label: 'excludes', types: ['checkbox_group'] },
  { value: 'is_empty', label: 'is empty', types: ['text', 'number', 'select', 'radio', 'checkbox_group'] },
  { value: 'is_not_empty', label: 'has a value', types: ['text', 'number', 'select', 'radio', 'checkbox_group'] },
] as const;

function getOperatorsForField(field: FormField | undefined) {
  if (!field) return ALL_OPERATORS;
  return ALL_OPERATORS.filter((op) => (op.types as readonly string[]).includes(field.type));
}

function fieldHasOptions(field: FormField | undefined) {
  return field && ['select', 'radio', 'checkbox_group'].includes(field.type);
}

function getRuleConditions(rule: LogicRule): LogicCondition[] {
  return rule.conditions && rule.conditions.length > 0 ? rule.conditions : [rule.condition];
}

function buildRule(
  conditions: { field: string; operator: string; value: string }[],
  logic: 'and' | 'or',
  action: Record<string, string>
): LogicRule {
  const mapped: LogicCondition[] = conditions.map((c) => ({ field: c.field, operator: c.operator, value: c.value }));
  const rule: LogicRule = { condition: mapped[0], action };
  if (mapped.length > 1) { rule.conditions = mapped; rule.logic = logic; }
  return rule;
}

function ConditionValueInput({
  condField, fields, op, val, setVal, className,
}: {
  condField: string; fields: FormField[]; op: string;
  val: string; setVal: (v: string) => void; className: string;
}) {
  if (['is_empty', 'is_not_empty'].includes(op)) return null;

  const sourceField = fields.find((f) => f.id === condField);
  if (sourceField && fieldHasOptions(sourceField) && sourceField.options?.length) {
    return (
      <select value={val} onChange={(e) => setVal(e.target.value)} className={cn(className, 'flex-1 min-w-[100px]')}>
        <option value="" disabled>Pick value...</option>
        {sourceField.options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={sourceField?.type === 'number' ? 'number' : 'text'}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      placeholder="Enter value..."
      className={cn(className, 'flex-1 min-w-[100px]')}
    />
  );
}

export default function LogicRulesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { fields, logicRules, addLogicRule, updateLogicRule, removeLogicRule } = useFormBuilderStore();

  const [conditions, setConditions] = useState<{ field: string; operator: string; value: string }[]>([
    { field: '', operator: '==', value: '' },
  ]);
  const [logic, setLogic] = useState<'and' | 'or'>('and');
  const [actionType, setActionType] = useState('show');
  const [targetField, setTargetField] = useState('');

  const updateCondition = (idx: number, updates: Partial<{ field: string; operator: string; value: string }>) => {
    setConditions((prev) => prev.map((c, i) => {
      if (i !== idx) return c;
      const updated = { ...c, ...updates };
      if (updates.field && updates.field !== c.field) {
        updated.value = '';
        const newFieldObj = fields.find((f) => f.id === updates.field);
        const newOps = getOperatorsForField(newFieldObj);
        if (!newOps.find((o) => o.value === updated.operator)) {
          updated.operator = newOps[0]?.value || '==';
        }
      }
      return updated;
    }));
  };

  const addConditionRow = () => setConditions((prev) => [...prev, { field: '', operator: '==', value: '' }]);
  const removeConditionRow = (idx: number) => { if (conditions.length > 1) setConditions((prev) => prev.filter((_, i) => i !== idx)); };

  const handleCreateRule = () => {
    const valid = conditions.filter((c) => c.field && (['is_empty', 'is_not_empty'].includes(c.operator) || c.value));
    if (valid.length === 0 || !targetField) return;
    addLogicRule(buildRule(valid, logic, { [actionType]: targetField }));
    setConditions([{ field: '', operator: '==', value: '' }]);
    setTargetField('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectCls = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="relative w-full max-w-2xl rounded-2xl bg-white text-slate-900 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold">Logic Rules</h2>
              <p className="text-xs text-slate-400">{logicRules.length} rule{logicRules.length !== 1 ? 's' : ''} active</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {/* Builder */}
          <div className="border-b border-slate-100 bg-linear-to-b from-slate-50/80 to-white p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Create Rule</p>

            <div className="space-y-3">
              {conditions.map((cond, idx) => {
                const condFieldObj = fields.find((f) => f.id === cond.field);
                const operators = getOperatorsForField(condFieldObj);
                return (
                  <div key={idx} className="space-y-2">
                    {idx > 0 && (
                      <div className="flex items-center gap-2 pl-1">
                        <button
                          onClick={() => setLogic(logic === 'and' ? 'or' : 'and')}
                          className="rounded-lg bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 hover:bg-violet-200 transition-colors cursor-pointer"
                        >
                          {logic.toUpperCase()}
                        </button>
                        <button onClick={() => removeConditionRow(idx)} className="rounded-lg p-1 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      {idx === 0 && <span className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">IF</span>}
                      <select value={cond.field} onChange={(e) => updateCondition(idx, { field: e.target.value })} className={cn(selectCls, 'flex-1 min-w-[140px]')}>
                        <option value="" disabled>Select field...</option>
                        {fields.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}{f.name ? ` (${f.name})` : ''}
                            {' '}— {f.type.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                      <select value={cond.operator} onChange={(e) => updateCondition(idx, { operator: e.target.value })} className={cn(selectCls, 'min-w-[140px]')}>
                        {operators.map((op) => (
                          <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                      </select>
                      <ConditionValueInput condField={cond.field} fields={fields} op={cond.operator} val={cond.value} setVal={(v) => updateCondition(idx, { value: v })} className={selectCls} />
                    </div>
                  </div>
                );
              })}

              <button
                onClick={addConditionRow}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-violet-200 bg-violet-50/50 px-3 py-2 text-xs font-semibold text-violet-600 transition-colors hover:border-violet-300 hover:bg-violet-50"
              >
                <Plus className="h-3 w-3" />
                Add {logic.toUpperCase()} condition
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <span className="shrink-0 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600">THEN</span>
                <select value={actionType} onChange={(e) => setActionType(e.target.value)} className={cn(selectCls, 'min-w-[140px]')}>
                  {ACTION_TYPES.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
                <select value={targetField} onChange={(e) => setTargetField(e.target.value)} className={cn(selectCls, 'flex-1 min-w-[140px]')}>
                  <option value="" disabled>Select target...</option>
                  {fields.filter((f) => !conditions.some((c) => c.field === f.id) || true).map((f) => (
                    <option key={f.id} value={f.id}>{f.label}{f.name ? ` (${f.name})` : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleCreateRule}
              disabled={!conditions.some((c) => c.field && (['is_empty', 'is_not_empty'].includes(c.operator) || c.value)) || !targetField}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Add Rule
            </button>
          </div>

          {/* Rules list */}
          <div className="p-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Active Rules</p>

            {logicRules.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
                <Zap className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-500">No rules defined</p>
                <p className="mt-1 text-xs text-slate-400">Create your first rule above</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {logicRules.map((rule, idx) => (
                    <ModalRuleCard
                      key={idx}
                      rule={rule}
                      index={idx}
                      fields={fields}
                      onUpdate={updateLogicRule}
                      onRemove={() => removeLogicRule(idx)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ModalRuleCard({
  rule, index, fields, onUpdate, onRemove,
}: {
  rule: LogicRule; index: number; fields: FormField[];
  onUpdate: (index: number, rule: LogicRule) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const actionKey = Object.keys(rule.action)[0];
  const ruleConditions = getRuleConditions(rule);

  const [eConditions, setEConditions] = useState<{ field: string; operator: string; value: string }[]>(
    ruleConditions.map((c) => ({ field: c.field, operator: c.operator, value: String(c.value ?? '') }))
  );
  const [eLogic, setELogic] = useState<'and' | 'or'>(rule.logic || 'and');
  const [eAction, setEAction] = useState(actionKey);
  const [eTarget, setETarget] = useState(rule.action[actionKey]);

  const startEdit = () => {
    const conds = getRuleConditions(rule);
    setEConditions(conds.map((c) => ({ field: c.field, operator: c.operator, value: String(c.value ?? '') })));
    setELogic(rule.logic || 'and');
    const ak = Object.keys(rule.action)[0];
    setEAction(ak);
    setETarget(rule.action[ak]);
    setEditing(true);
  };

  const updateECondition = (idx: number, updates: Partial<{ field: string; operator: string; value: string }>) => {
    setEConditions((prev) => prev.map((c, i) => {
      if (i !== idx) return c;
      const updated = { ...c, ...updates };
      if (updates.field && updates.field !== c.field) {
        updated.value = '';
        const newFieldObj = fields.find((f) => f.id === updates.field);
        const newOps = getOperatorsForField(newFieldObj);
        if (!newOps.find((o) => o.value === updated.operator)) {
          updated.operator = newOps[0]?.value || '==';
        }
      }
      return updated;
    }));
  };

  const addECondition = () => setEConditions((prev) => [...prev, { field: '', operator: '==', value: '' }]);
  const removeECondition = (idx: number) => { if (eConditions.length > 1) setEConditions((prev) => prev.filter((_, i) => i !== idx)); };

  const handleSave = () => {
    const valid = eConditions.filter((c) => c.field && (['is_empty', 'is_not_empty'].includes(c.operator) || c.value));
    if (valid.length === 0 || !eTarget) return;
    onUpdate(index, buildRule(valid, eLogic, { [eAction]: eTarget }));
    setEditing(false);
  };

  const selectCls = 'rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors';

  if (editing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3"
      >
        {eConditions.map((cond, idx) => {
          const condFieldObj = fields.find((f) => f.id === cond.field);
          const operators = getOperatorsForField(condFieldObj);
          return (
            <div key={idx} className="space-y-2">
              {idx > 0 && (
                <div className="flex items-center gap-2 pl-1">
                  <button
                    onClick={() => setELogic(eLogic === 'and' ? 'or' : 'and')}
                    className="rounded-lg bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 hover:bg-violet-200 transition-colors cursor-pointer"
                  >
                    {eLogic.toUpperCase()}
                  </button>
                  <button onClick={() => removeECondition(idx)} className="rounded-lg p-1 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {idx === 0 && <span className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">IF</span>}
                <select value={cond.field} onChange={(e) => updateECondition(idx, { field: e.target.value })} className={cn(selectCls, 'flex-1 min-w-[140px]')}>
                  <option value="" disabled>Select field...</option>
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
                <select value={cond.operator} onChange={(e) => updateECondition(idx, { operator: e.target.value })} className={cn(selectCls, 'min-w-[130px]')}>
                  {operators.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ConditionValueInput condField={cond.field} fields={fields} op={cond.operator} val={cond.value} setVal={(v) => updateECondition(idx, { value: v })} className={selectCls} />
              </div>
            </div>
          );
        })}

        <button
          onClick={addECondition}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-violet-200 bg-violet-50/50 px-3 py-1.5 text-xs font-semibold text-violet-600 transition-colors hover:border-violet-300 hover:bg-violet-50"
        >
          <Plus className="h-3 w-3" />
          Add {eLogic.toUpperCase()} condition
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600">THEN</span>
          <select value={eAction} onChange={(e) => setEAction(e.target.value)} className={cn(selectCls, 'min-w-[130px]')}>
            {ACTION_TYPES.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
          <select value={eTarget} onChange={(e) => setETarget(e.target.value)} className={cn(selectCls, 'flex-1 min-w-[140px]')}>
            <option value="" disabled>Target...</option>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={!eConditions.some((c) => c.field && (['is_empty', 'is_not_empty'].includes(c.operator) || c.value)) || !eTarget}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-hover disabled:opacity-40"
          >
            <Check className="h-3.5 w-3.5" />
            Save Changes
          </button>
          <button
            onClick={() => setEditing(false)}
            className="flex flex-1 items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    );
  }

  const targetObj = fields.find((f) => f.id === rule.action[actionKey]);
  const actionMeta = ACTION_TYPES.find((a) => a.value === actionKey);

  const resolveConditionLabel = (cond: LogicCondition) => {
    const condObj = fields.find((f) => f.id === cond.field);
    const opLabel = ALL_OPERATORS.find((o) => o.value === cond.operator)?.label || cond.operator;
    let valLabel: string | null = null;
    if (!['is_empty', 'is_not_empty'].includes(cond.operator)) {
      if (condObj && fieldHasOptions(condObj) && condObj.options?.length) {
        const match = condObj.options.find((o) => o.value === String(cond.value));
        if (match) valLabel = match.label;
      }
      if (!valLabel) valLabel = String(cond.value);
    }
    return { fieldLabel: condObj?.label || '?', opLabel, valLabel };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5 text-sm">
        {ruleConditions.map((cond, idx) => {
          const { fieldLabel, opLabel, valLabel } = resolveConditionLabel(cond);
          return (
            <span key={idx} className="contents">
              {idx === 0 && <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold text-primary">IF</span>}
              {idx > 0 && (
                <span className="shrink-0 rounded bg-violet-100 px-1.5 py-0.5 text-[11px] font-bold text-violet-700">
                  {(rule.logic || 'and').toUpperCase()}
                </span>
              )}
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 truncate max-w-[120px]">
                {fieldLabel}
              </span>
              <span className="text-xs text-slate-400">{opLabel}</span>
              {valLabel && (
                <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-mono font-semibold text-amber-700">
                  {valLabel}
                </span>
              )}
            </span>
          );
        })}
        <ArrowRight className="h-3 w-3 text-slate-300 shrink-0 mx-0.5" />
        <span className={cn('rounded px-2 py-0.5 text-[11px] font-bold', actionMeta?.color || 'text-slate-600 bg-slate-100')}>
          {actionMeta?.label || actionKey}
        </span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 truncate max-w-[120px]">
          {targetObj?.label || '?'}
        </span>
      </div>

      <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={startEdit}
          className="rounded-lg p-1.5 text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors"
          title="Edit rule"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onRemove}
          className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
          title="Delete rule"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
