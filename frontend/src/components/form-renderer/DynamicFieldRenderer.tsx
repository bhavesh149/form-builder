import type { FormField } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  field: FormField;
  value?: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  error?: string;
}

export default function DynamicFieldRenderer({ field, value, onChange, disabled, error }: Props) {
  const inputClasses = cn(
    'w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none',
    error
      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
      : 'border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary',
    disabled && 'opacity-60 cursor-not-allowed'
  );

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={inputClasses}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) => onChange?.(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder={field.placeholder}
            disabled={disabled}
            className={inputClasses}
          />
        );

      case 'select':
        return (
          <select
            value={(value as string) || ''}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className={cn(inputClasses, 'appearance-none')}
          >
            <option value="" className="bg-white">Select...</option>
            {(field.options || []).map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white">
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {(field.options || []).map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors cursor-pointer',
                  value === opt.value
                    ? 'border-primary/50 bg-primary/10 text-primary-hover'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300',
                  disabled && 'opacity-60 cursor-not-allowed'
                )}
              >
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => onChange?.(e.target.value)}
                  disabled={disabled}
                  className="accent-primary"
                />
                {opt.label}
              </label>
            ))}
          </div>
        );

      case 'checkbox_group':
        return (
          <div className="space-y-2">
            {(field.options || []).map((opt) => {
              const isChecked = Array.isArray(value) && value.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors cursor-pointer',
                    isChecked
                      ? 'border-primary/50 bg-primary/10 text-primary-hover'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300',
                    disabled && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  <input
                    type="checkbox"
                    name={field.id}
                    value={opt.value}
                    checked={isChecked}
                    onChange={(e) => {
                      if (!onChange) return;
                      const currentValues = Array.isArray(value) ? [...value] : [];
                      if (e.target.checked) {
                        onChange([...currentValues, opt.value]);
                      } else {
                        onChange(currentValues.filter((v) => v !== opt.value));
                      }
                    }}
                    disabled={disabled}
                    className="accent-primary h-4 w-4 rounded border-slate-300"
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        );

      case 'video_upload':
      case 'file_upload':
        return (
          <div
            className={cn(
              'rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors',
              disabled
                ? 'border-slate-200 bg-slate-50'
                : 'border-slate-300 hover:border-primary/30 cursor-pointer'
            )}
          >
            <p className="text-sm text-slate-500">
              {value ? '📹 File uploaded' : 'Click or drag to upload video'}
            </p>
            <p className="mt-1 text-xs text-slate-400">MP4, WebM up to 100MB</p>
          </div>
        );

      default:
        return <p className="text-sm text-slate-500">Unknown field type: {field.type}</p>;
    }
  };

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </label>
      {renderField()}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
