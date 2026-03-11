import { useState } from 'react';
import { useFormBuilderStore } from '@/store/formBuilderStore';
import { X, Plus, Trash2, Settings2, Zap, Database, List, Pencil, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LogicRule, FormField } from '@/types';

const ACTION_TYPES = [
  { value: 'show', label: 'Show' },
  { value: 'hide', label: 'Hide' },
  { value: 'require', label: 'Require' },
  { value: 'unrequire', label: 'Optional' },
  { value: 'highlight', label: 'Highlight' },
] as const;

const ALL_OPERATORS = [
  { value: '==', label: '=', types: ['text', 'number', 'select', 'radio'] },
  { value: '!=', label: '!=', types: ['text', 'number', 'select', 'radio'] },
  { value: '>', label: '>', types: ['number'] },
  { value: '<', label: '<', types: ['number'] },
  { value: '>=', label: '>=', types: ['number'] },
  { value: '<=', label: '<=', types: ['number'] },
  { value: 'contains', label: 'contains', types: ['text'] },
  { value: 'includes', label: 'includes', types: ['checkbox_group'] },
  { value: 'not_includes', label: 'excludes', types: ['checkbox_group'] },
  { value: 'is_empty', label: 'is empty', types: ['text', 'number', 'select', 'radio', 'checkbox_group'] },
  { value: 'is_not_empty', label: 'has value', types: ['text', 'number', 'select', 'radio', 'checkbox_group'] },
] as const;

function getOperatorsForField(field: FormField | undefined) {
  if (!field) return ALL_OPERATORS;
  return ALL_OPERATORS.filter((op) => (op.types as readonly string[]).includes(field.type));
}

function fieldHasOptions(field: FormField | undefined) {
  return field && ['select', 'radio', 'checkbox_group'].includes(field.type);
}

type Tab = 'settings' | 'logic' | 'rules';

export default function FieldConfigPanel() {
  const {
    fields, selectedFieldId, updateField, selectField,
    logicRules, addLogicRule, updateLogicRule, removeLogicRule,
  } = useFormBuilderStore();
  const field = fields.find((f) => f.id === selectedFieldId);
  const [activeTab, setActiveTab] = useState<Tab>('settings');

  if (!field) {
    return (
      <div className="flex h-full flex-col">
        <AllRulesView
          fields={fields}
          logicRules={logicRules}
          removeLogicRule={removeLogicRule}
          updateLogicRule={updateLogicRule}
          addLogicRule={addLogicRule}
        />
      </div>
    );
  }

  const hasOptions = field.type === 'select' || field.type === 'radio' || field.type === 'checkbox_group';

  const addOption = () => {
    const options = field.options || [];
    const newOption = { label: `Option ${options.length + 1}`, value: `option_${options.length + 1}` };
    updateField(field.id, { options: [...options, newOption] });
  };

  const updateOption = (index: number, key: 'label' | 'value', value: string) => {
    const options = [...(field.options || [])];
    options[index] = { ...options[index], [key]: value };
    updateField(field.id, { options });
  };

  const removeOption = (index: number) => {
    const options = (field.options || []).filter((_, i) => i !== index);
    updateField(field.id, { options });
  };

  const fieldRules = logicRules.filter(
    (r) => r.condition.field === field.id || Object.values(r.action).includes(field.id)
  );

  const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors';

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-bold text-slate-900 truncate">{field.label}</p>
        <button
          onClick={() => selectField(null)}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        {([
          { id: 'settings' as Tab, label: 'Settings', icon: Settings2 },
          { id: 'logic' as Tab, label: 'Logic', icon: Zap, count: fieldRules.length },
          { id: 'rules' as Tab, label: 'All Rules', icon: List, count: logicRules.length },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors border-b-2',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
            {tab.count ? (
              <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'settings' ? (
          <SettingsTab
            field={field}
            updateField={updateField}
            hasOptions={hasOptions}
            addOption={addOption}
            updateOption={updateOption}
            removeOption={removeOption}
            inputCls={inputCls}
          />
        ) : activeTab === 'logic' ? (
          <LogicTab
            field={field}
            fields={fields}
            logicRules={logicRules}
            fieldRules={fieldRules}
            addLogicRule={addLogicRule}
            updateLogicRule={updateLogicRule}
            removeLogicRule={removeLogicRule}
          />
        ) : (
          <AllRulesTab
            fields={fields}
            logicRules={logicRules}
            updateLogicRule={updateLogicRule}
            removeLogicRule={removeLogicRule}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Settings Tab ─── */

function SettingsTab({
  field, updateField, hasOptions, addOption, updateOption, removeOption, inputCls,
}: {
  field: any; updateField: any; hasOptions: boolean;
  addOption: () => void; updateOption: any; removeOption: any; inputCls: string;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 capitalize">
          {field.type.replace(/_/g, ' ')}
        </span>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Label</label>
        <input type="text" value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
          Field Key
          <span className="ml-1 font-normal text-slate-400">(for submissions)</span>
        </label>
        <input type="text" value={field.name || ''} onChange={(e) => updateField(field.id, { name: e.target.value })} placeholder="e.g. helmet_used" className={cn(inputCls, 'font-mono text-xs')} />
      </div>
      {(field.type === 'text' || field.type === 'number') && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Placeholder</label>
          <input type="text" value={field.placeholder || ''} onChange={(e) => updateField(field.id, { placeholder: e.target.value })} className={inputCls} />
        </div>
      )}
      <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
        <div>
          <p className="text-xs font-semibold text-slate-700">Required</p>
          <p className="text-[10px] text-slate-400">Must be filled before submitting</p>
        </div>
        <button
          onClick={() => updateField(field.id, { required: !field.required })}
          className={cn('relative h-6 w-11 rounded-full transition-colors', field.required ? 'bg-primary' : 'bg-slate-200')}
        >
          <span className={cn('absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm', field.required && 'translate-x-5')} />
        </button>
      </div>
      {field.type === 'select' && (
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Database className="h-3 w-3" />
            Data Source
          </label>
          <input type="text" value={field.data_source || ''} onChange={(e) => updateField(field.id, { data_source: e.target.value })} placeholder="/metadata/branches" className={cn(inputCls, 'font-mono text-xs')} />
          <p className="mt-1 text-[10px] text-slate-400">Dynamic API endpoint. Leave empty for static options.</p>
        </div>
      )}
      {hasOptions && !field.data_source && (
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">Options</label>
          <div className="space-y-1.5">
            {(field.options || []).map((option: any, index: number) => (
              <div key={index} className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white p-1.5">
                <input
                  type="text" value={option.label} onChange={(e) => updateOption(index, 'label', e.target.value)}
                  placeholder="Label"
                  className="flex-1 rounded-md border-0 bg-transparent px-2 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <div className="h-4 w-px bg-slate-200" />
                <input
                  type="text" value={option.value} onChange={(e) => updateOption(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="w-20 rounded-md border-0 bg-transparent px-2 py-1 text-xs font-mono text-slate-500 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <button onClick={() => removeOption(index)} className="rounded p-1 text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addOption}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:border-primary/30 hover:text-primary hover:bg-primary/5"
          >
            <Plus className="h-3 w-3" />
            Add Option
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Shared: Condition value input (dropdown for option fields, text/number otherwise) ─── */

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
      <select value={val} onChange={(e) => setVal(e.target.value)} className={cn(className, 'flex-1 min-w-0')}>
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
      placeholder="value..."
      className={cn(className, 'flex-1 min-w-0')}
    />
  );
}

/* ─── Logic Tab (per-field) ─── */

function LogicTab({
  field, fields, logicRules, fieldRules, addLogicRule, updateLogicRule, removeLogicRule,
}: {
  field: FormField; fields: FormField[]; logicRules: LogicRule[]; fieldRules: LogicRule[];
  addLogicRule: (rule: LogicRule) => void;
  updateLogicRule: (index: number, rule: LogicRule) => void;
  removeLogicRule: (index: number) => void;
}) {
  const [condField, setCondField] = useState(field.id);
  const [op, setOp] = useState('==');
  const [val, setVal] = useState('');
  const [action, setAction] = useState('show');
  const [target, setTarget] = useState('');

  const condFieldObj = fields.find((f) => f.id === condField);
  const operators = getOperatorsForField(condFieldObj);

  const handleCondFieldChange = (newFieldId: string) => {
    setCondField(newFieldId);
    setVal('');
    const newFieldObj = fields.find((f) => f.id === newFieldId);
    const newOps = getOperatorsForField(newFieldObj);
    if (!newOps.find((o) => o.value === op)) {
      setOp(newOps[0]?.value || '==');
    }
  };

  const handleAdd = () => {
    if (!condField || !target) return;
    if (!['is_empty', 'is_not_empty'].includes(op) && !val) return;
    addLogicRule({
      condition: { field: condField, operator: op, value: val },
      action: { [action]: target },
    });
    setVal('');
    setTarget('');
  };

  const otherFields = fields.filter((f) => f.id !== field.id);
  const selectCls = 'rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors';

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-100 bg-linear-to-b from-slate-50 to-white p-4 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">New Rule</p>

        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 font-bold text-primary">IF</span>
            <select value={condField} onChange={(e) => handleCondFieldChange(e.target.value)} className={cn(selectCls, 'flex-1 min-w-0')}>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs pl-4">
            <select value={op} onChange={(e) => setOp(e.target.value)} className={selectCls}>
              {operators.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ConditionValueInput condField={condField} fields={fields} op={op} val={val} setVal={setVal} className={selectCls} />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="shrink-0 rounded-md bg-emerald-500/10 px-2 py-1 font-bold text-emerald-600">THEN</span>
            <select value={action} onChange={(e) => setAction(e.target.value)} className={selectCls}>
              {ACTION_TYPES.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
            <select value={target} onChange={(e) => setTarget(e.target.value)} className={cn(selectCls, 'flex-1 min-w-0')}>
              <option value="" disabled>Select field...</option>
              {otherFields.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={!condField || !target || (!['is_empty', 'is_not_empty'].includes(op) && !val)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Rule
        </button>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Rules involving this field ({fieldRules.length})
        </p>

        {fieldRules.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-6 text-center">
            <Zap className="mx-auto h-5 w-5 text-slate-300 mb-1.5" />
            <p className="text-xs text-slate-400">No rules yet</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {fieldRules.map((rule) => {
              const globalIdx = logicRules.indexOf(rule);
              return (
                <RuleCard
                  key={globalIdx}
                  rule={rule}
                  index={globalIdx}
                  fields={fields}
                  onUpdate={updateLogicRule}
                  onRemove={() => removeLogicRule(globalIdx)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── All Rules Tab (shown in tabbed config panel) ─── */

function AllRulesTab({
  fields, logicRules, updateLogicRule, removeLogicRule,
}: {
  fields: FormField[]; logicRules: LogicRule[];
  updateLogicRule: (index: number, rule: LogicRule) => void;
  removeLogicRule: (index: number) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        All Logic Rules ({logicRules.length})
      </p>
      {logicRules.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-8 text-center">
          <Zap className="mx-auto h-6 w-6 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-500">No rules defined</p>
          <p className="mt-1 text-xs text-slate-400">Select a field and add rules from the Logic tab</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {logicRules.map((rule, idx) => (
            <RuleCard
              key={idx}
              rule={rule}
              index={idx}
              fields={fields}
              onUpdate={updateLogicRule}
              onRemove={() => removeLogicRule(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── All Rules View (shown when no field selected) ─── */

function AllRulesView({
  fields, logicRules, removeLogicRule, updateLogicRule, addLogicRule,
}: {
  fields: FormField[]; logicRules: LogicRule[];
  removeLogicRule: (index: number) => void;
  updateLogicRule: (index: number, rule: LogicRule) => void;
  addLogicRule: (rule: LogicRule) => void;
}) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [condField, setCondField] = useState('');
  const [op, setOp] = useState('==');
  const [val, setVal] = useState('');
  const [action, setAction] = useState('show');
  const [target, setTarget] = useState('');

  const condFieldObj = fields.find((f) => f.id === condField);
  const operators = getOperatorsForField(condFieldObj);

  const handleCondFieldChange = (newFieldId: string) => {
    setCondField(newFieldId);
    setVal('');
    const newFieldObj = fields.find((f) => f.id === newFieldId);
    const newOps = getOperatorsForField(newFieldObj);
    if (!newOps.find((o) => o.value === op)) {
      setOp(newOps[0]?.value || '==');
    }
  };

  const handleAdd = () => {
    if (!condField || !target) return;
    if (!['is_empty', 'is_not_empty'].includes(op) && !val) return;
    addLogicRule({
      condition: { field: condField, operator: op, value: val },
      action: { [action]: target },
    });
    setVal('');
    setTarget('');
    setShowBuilder(false);
  };

  const selectCls = 'rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors';

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Logic Rules</p>
            <p className="text-[10px] text-slate-400">{logicRules.length} rule{logicRules.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {fields.length >= 2 && (
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className={cn(
              'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
              showBuilder ? 'bg-slate-100 text-slate-600' : 'bg-primary text-white hover:bg-primary-hover'
            )}
          >
            {showBuilder ? 'Cancel' : '+ Add'}
          </button>
        )}
      </div>

      {showBuilder && fields.length >= 2 && (
        <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2.5">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 font-bold text-primary">IF</span>
            <select value={condField} onChange={(e) => handleCondFieldChange(e.target.value)} className={cn(selectCls, 'flex-1 min-w-0')}>
              <option value="" disabled>Select field...</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs pl-4">
            <select value={op} onChange={(e) => setOp(e.target.value)} className={selectCls}>
              {operators.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ConditionValueInput condField={condField} fields={fields} op={op} val={val} setVal={setVal} className={selectCls} />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="shrink-0 rounded-md bg-emerald-500/10 px-2 py-1 font-bold text-emerald-600">THEN</span>
            <select value={action} onChange={(e) => setAction(e.target.value)} className={selectCls}>
              {ACTION_TYPES.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
            <select value={target} onChange={(e) => setTarget(e.target.value)} className={cn(selectCls, 'flex-1 min-w-0')}>
              <option value="" disabled>Target field...</option>
              {fields.filter((f) => f.id !== condField).map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={!condField || !target || (!['is_empty', 'is_not_empty'].includes(op) && !val)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Rule
          </button>
        </div>
      )}

      {logicRules.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <Zap className="mx-auto h-6 w-6 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-500">No rules defined</p>
          <p className="mt-1 text-xs text-slate-400">
            {fields.length < 2
              ? 'Add at least 2 fields to create logic rules'
              : 'Click "+ Add" above or select a field to create rules'}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {logicRules.map((rule, idx) => (
            <RuleCard
              key={idx}
              rule={rule}
              index={idx}
              fields={fields}
              onUpdate={updateLogicRule}
              onRemove={() => removeLogicRule(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Rule Card with inline edit ─── */

function RuleCard({
  rule, index, fields, onUpdate, onRemove,
}: {
  rule: LogicRule; index: number; fields: FormField[];
  onUpdate: (index: number, rule: LogicRule) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);

  const actionKey = Object.keys(rule.action)[0];

  const [eCondField, setECondField] = useState(rule.condition.field);
  const [eOp, setEOp] = useState(rule.condition.operator);
  const [eVal, setEVal] = useState(String(rule.condition.value ?? ''));
  const [eAction, setEAction] = useState(actionKey);
  const [eTarget, setETarget] = useState(rule.action[actionKey]);

  const condFieldObj = fields.find((f) => f.id === eCondField);
  const operators = getOperatorsForField(condFieldObj);

  const startEdit = () => {
    setECondField(rule.condition.field);
    setEOp(rule.condition.operator);
    setEVal(String(rule.condition.value ?? ''));
    const ak = Object.keys(rule.action)[0];
    setEAction(ak);
    setETarget(rule.action[ak]);
    setEditing(true);
  };

  const handleCondFieldChange = (newFieldId: string) => {
    setECondField(newFieldId);
    setEVal('');
    const newFieldObj = fields.find((f) => f.id === newFieldId);
    const newOps = getOperatorsForField(newFieldObj);
    if (!newOps.find((o) => o.value === eOp)) {
      setEOp(newOps[0]?.value || '==');
    }
  };

  const handleSave = () => {
    if (!eCondField || !eTarget) return;
    if (!['is_empty', 'is_not_empty'].includes(eOp) && !eVal) return;
    onUpdate(index, {
      condition: { field: eCondField, operator: eOp, value: eVal },
      action: { [eAction]: eTarget },
    });
    setEditing(false);
  };

  const selectCls = 'rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors';

  if (editing) {
    return (
      <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">IF</span>
          <select value={eCondField} onChange={(e) => handleCondFieldChange(e.target.value)} className={cn(selectCls, 'flex-1 min-w-0')}>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs pl-4">
          <select value={eOp} onChange={(e) => setEOp(e.target.value)} className={selectCls}>
            {operators.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ConditionValueInput condField={eCondField} fields={fields} op={eOp} val={eVal} setVal={setEVal} className={selectCls} />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="shrink-0 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">THEN</span>
          <select value={eAction} onChange={(e) => setEAction(e.target.value)} className={selectCls}>
            {ACTION_TYPES.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
          <select value={eTarget} onChange={(e) => setETarget(e.target.value)} className={cn(selectCls, 'flex-1 min-w-0')}>
            <option value="" disabled>Target...</option>
            {fields.filter((f) => f.id !== eCondField).map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={handleSave}
            disabled={!eCondField || !eTarget || (!['is_empty', 'is_not_empty'].includes(eOp) && !eVal)}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-2 py-1.5 text-[11px] font-semibold text-white transition-all hover:bg-primary-hover disabled:opacity-40"
          >
            <Check className="h-3 w-3" />
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="flex flex-1 items-center justify-center rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const condObj = fields.find((f) => f.id === rule.condition.field);
  const targetObj = fields.find((f) => f.id === rule.action[actionKey]);
  const opLabel = ALL_OPERATORS.find((o) => o.value === rule.condition.operator)?.label || rule.condition.operator;
  const actionLabel = ACTION_TYPES.find((a) => a.value === actionKey)?.label || actionKey;

  const resolveValueLabel = () => {
    if (['is_empty', 'is_not_empty'].includes(rule.condition.operator)) return null;
    if (condObj && fieldHasOptions(condObj) && condObj.options?.length) {
      const match = condObj.options.find((o) => o.value === String(rule.condition.value));
      if (match) return match.label;
    }
    return String(rule.condition.value);
  };

  const valLabel = resolveValueLabel();

  return (
    <div className="flex items-start gap-1.5 rounded-lg border border-slate-100 bg-white p-2.5 group">
      <div className="flex-1 min-w-0 text-xs leading-relaxed">
        <span className="font-bold text-primary">IF </span>
        <span className="font-semibold text-slate-700">{condObj?.label || '?'}</span>
        <span className="text-slate-400"> {opLabel} </span>
        {valLabel && (
          <span className="font-mono text-amber-600">"{valLabel}"</span>
        )}
        <br />
        <span className="font-bold text-emerald-600">THEN </span>
        <span className="text-slate-500">{actionLabel} </span>
        <span className="font-semibold text-slate-700">{targetObj?.label || '?'}</span>
      </div>
      <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={startEdit}
          className="rounded p-1 text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors"
          title="Edit rule"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onRemove}
          className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
          title="Delete rule"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
