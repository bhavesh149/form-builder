import { useEffect, useCallback, useRef } from 'react';

const DRAFT_PREFIX = 'humanity_forms_draft_';

/**
 * Hook for autosaving form draft to localStorage.
 */
export function useDraftSave(
    formId: string | undefined,
    data: Record<string, unknown>,
    enabled: boolean = true,
    debounceMs: number = 2000,
) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const draftKey = formId ? `${DRAFT_PREFIX}${formId}` : `${DRAFT_PREFIX}new`;

    // Autosave on data change
    useEffect(() => {
        if (!enabled || Object.keys(data).length === 0) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            localStorage.setItem(draftKey, JSON.stringify(data));
        }, debounceMs);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [data, draftKey, enabled, debounceMs]);

    const loadDraft = useCallback((): Record<string, unknown> | null => {
        const saved = localStorage.getItem(draftKey);
        if (!saved) return null;
        try {
            return JSON.parse(saved);
        } catch {
            return null;
        }
    }, [draftKey]);

    const clearDraft = useCallback(() => {
        localStorage.removeItem(draftKey);
    }, [draftKey]);

    const hasDraft = useCallback((): boolean => {
        return localStorage.getItem(draftKey) !== null;
    }, [draftKey]);

    return { loadDraft, clearDraft, hasDraft };
}
