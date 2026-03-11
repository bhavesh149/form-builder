import { useMemo } from 'react';
import type { LogicRule, FormField } from '@/types';

interface LogicResult {
    visibleFields: Set<string>;
    requiredFields: Set<string>;
    highlightedFields: Set<string>;
}

/**
 * Evaluates logic rules against current form data.
 * Supports: conditional visibility, dynamic required, field highlighting.
 */
export function useLogicEngine(
    rules: LogicRule[],
    fields: FormField[],
    formData: Record<string, unknown>
): LogicResult {
    return useMemo(() => {
        const allFieldIds = new Set(fields.map((f) => f.id));
        const visibleFields = new Set(allFieldIds);
        const requiredFields = new Set(
            fields.filter((f) => f.required).map((f) => f.id)
        );
        const highlightedFields = new Set<string>();

        for (const rule of rules) {
            const { condition, action } = rule;
            const fieldValue = formData[condition.field];
            const conditionMet = evaluateCondition(fieldValue, condition.operator, condition.value);

            if (conditionMet) {
                if (action.show) visibleFields.add(action.show);
                if (action.hide) visibleFields.delete(action.hide);
                if (action.require) requiredFields.add(action.require);
                if (action.unrequire) requiredFields.delete(action.unrequire);
                if (action.highlight) highlightedFields.add(action.highlight);
            }
        }

        return { visibleFields, requiredFields, highlightedFields };
    }, [rules, fields, formData]);
}

function evaluateCondition(
    fieldValue: unknown,
    operator: string,
    compareValue: unknown
): boolean {
    switch (operator) {
        case '==':
        case 'equals':
            if (Array.isArray(fieldValue)) {
                return fieldValue.length === 1 && fieldValue[0] == compareValue;
            }
            return fieldValue == compareValue;
        case '!=':
        case 'not_equals':
            if (Array.isArray(fieldValue)) {
                return !fieldValue.includes(compareValue as string);
            }
            return fieldValue != compareValue;
        case '>':
        case 'greater_than':
            return Number(fieldValue) > Number(compareValue);
        case '<':
        case 'less_than':
            return Number(fieldValue) < Number(compareValue);
        case '>=':
        case 'greater_equal':
            return Number(fieldValue) >= Number(compareValue);
        case '<=':
        case 'less_equal':
            return Number(fieldValue) <= Number(compareValue);
        case 'contains':
            return String(fieldValue).includes(String(compareValue));
        case 'includes':
            if (Array.isArray(fieldValue)) {
                return fieldValue.includes(compareValue as string);
            }
            return String(fieldValue).includes(String(compareValue));
        case 'not_includes':
            if (Array.isArray(fieldValue)) {
                return !fieldValue.includes(compareValue as string);
            }
            return !String(fieldValue).includes(String(compareValue));
        case 'is_empty':
            if (Array.isArray(fieldValue)) return fieldValue.length === 0;
            return !fieldValue || fieldValue === '';
        case 'is_not_empty':
            if (Array.isArray(fieldValue)) return fieldValue.length > 0;
            return !!fieldValue && fieldValue !== '';
        default:
            return false;
    }
}
