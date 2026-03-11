import { useMemo } from 'react';
import type { LogicRule, FormField } from '@/types';

interface LogicResult {
    visibleFields: Set<string>;
    requiredFields: Set<string>;
    highlightedFields: Set<string>;
}

/**
 * Evaluates logic rules against current form data.
 * Supports: conditional visibility, dynamic required, field highlighting,
 * and compound conditions with AND/OR logic.
 */
export function useLogicEngine(
    rules: LogicRule[],
    fields: FormField[],
    formData: Record<string, unknown>
): LogicResult {
    return useMemo(() => {
        const allFieldIds = new Set(fields.map((f) => f.id));

        const showTargets = new Set<string>();
        for (const rule of rules) {
            if (rule.action.show) showTargets.add(rule.action.show);
        }

        const visibleFields = new Set(allFieldIds);
        for (const id of showTargets) {
            visibleFields.delete(id);
        }

        const requiredFields = new Set(
            fields.filter((f) => f.required).map((f) => f.id)
        );
        const highlightedFields = new Set<string>();

        for (const rule of rules) {
            const { action } = rule;
            const conditionMet = evaluateRule(rule, formData);

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

function evaluateRule(rule: LogicRule, formData: Record<string, unknown>): boolean {
    // Compound conditions: use `conditions` array with `logic` (and/or)
    if (rule.conditions && rule.conditions.length > 0) {
        const results = rule.conditions.map((c) =>
            evaluateCondition(formData[c.field], c.operator, c.value)
        );
        return rule.logic === 'or'
            ? results.some(Boolean)
            : results.every(Boolean);
    }

    // Single condition (backward compatible)
    const { condition } = rule;
    return evaluateCondition(formData[condition.field], condition.operator, condition.value);
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
