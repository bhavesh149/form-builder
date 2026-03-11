import { create } from 'zustand';
import type { FormField, LogicRule } from '@/types';

// Generate simple IDs without uuid dependency
function generateId(): string {
    return `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

interface FormBuilderState {
    title: string;
    description: string;
    collectRespondentInfo: boolean;
    fields: FormField[];
    logicRules: LogicRule[];
    selectedFieldId: string | null;
    isDirty: boolean;

    // Actions
    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
    setCollectRespondentInfo: (value: boolean) => void;
    addField: (type: FormField['type']) => void;
    updateField: (id: string, updates: Partial<FormField>) => void;
    removeField: (id: string) => void;
    reorderFields: (fromIndex: number, toIndex: number) => void;
    duplicateField: (id: string) => void;
    selectField: (id: string | null) => void;
    addLogicRule: (rule: LogicRule) => void;
    updateLogicRule: (index: number, rule: LogicRule) => void;
    removeLogicRule: (index: number) => void;
    loadForm: (title: string, description: string, fields: FormField[], logicRules: LogicRule[], collectRespondentInfo?: boolean) => void;
    reset: () => void;
}

const DEFAULT_FIELDS: Record<FormField['type'], Partial<FormField>> = {
    text: { label: 'Text Field', placeholder: 'Enter text...' },
    number: { label: 'Number Field', placeholder: 'Enter number...' },
    select: { label: 'Select Field', options: [{ label: 'Option 1', value: 'option_1' }] },
    radio: { label: 'Radio Group', options: [{ label: 'Option 1', value: 'option_1' }] },
    checkbox_group: { label: 'Checkboxes', options: [{ label: 'Option 1', value: 'option_1' }] },
    video_upload: { label: 'Video Upload' },
    file_upload: { label: 'File Upload' },
};

export const useFormBuilderStore = create<FormBuilderState>((set) => ({
    title: '',
    description: '',
    collectRespondentInfo: false,
    fields: [],
    logicRules: [],
    selectedFieldId: null,
    isDirty: false,

    setTitle: (title) => set({ title, isDirty: true }),
    setDescription: (description) => set({ description, isDirty: true }),
    setCollectRespondentInfo: (value) => set({ collectRespondentInfo: value, isDirty: true }),

    addField: (type) => {
        const defaults = DEFAULT_FIELDS[type];
        const newField: FormField = {
            id: generateId(),
            type,
            label: defaults.label || 'New Field',
            name: '',
            required: false,
            placeholder: defaults.placeholder,
            options: defaults.options,
            ...defaults,
        };
        set((state) => ({
            fields: [...state.fields, newField],
            selectedFieldId: newField.id,
            isDirty: true,
        }));
    },

    updateField: (id, updates) =>
        set((state) => ({
            fields: state.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
            isDirty: true,
        })),

    removeField: (id) =>
        set((state) => ({
            fields: state.fields.filter((f) => f.id !== id),
            selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
            isDirty: true,
        })),

    reorderFields: (fromIndex, toIndex) =>
        set((state) => {
            const fields = [...state.fields];
            const [moved] = fields.splice(fromIndex, 1);
            fields.splice(toIndex, 0, moved);
            return { fields, isDirty: true };
        }),

    duplicateField: (id) =>
        set((state) => {
            const field = state.fields.find((f) => f.id === id);
            if (!field) return state;
            const newField = { ...field, id: generateId(), label: `${field.label} (Copy)` };
            const index = state.fields.findIndex((f) => f.id === id);
            const fields = [...state.fields];
            fields.splice(index + 1, 0, newField);
            return { fields, selectedFieldId: newField.id, isDirty: true };
        }),

    selectField: (id) => set({ selectedFieldId: id }),

    addLogicRule: (rule) =>
        set((state) => ({ logicRules: [...state.logicRules, rule], isDirty: true })),

    updateLogicRule: (index, rule) =>
        set((state) => ({
            logicRules: state.logicRules.map((r, i) => (i === index ? rule : r)),
            isDirty: true,
        })),

    removeLogicRule: (index) =>
        set((state) => ({
            logicRules: state.logicRules.filter((_, i) => i !== index),
            isDirty: true,
        })),

    loadForm: (title, description, fields, logicRules, collectRespondentInfo = false) =>
        set({ title, description, fields, logicRules, collectRespondentInfo, selectedFieldId: null, isDirty: false }),

    reset: () =>
        set({
            title: '',
            description: '',
            collectRespondentInfo: false,
            fields: [],
            logicRules: [],
            selectedFieldId: null,
            isDirty: false,
        }),
}));
