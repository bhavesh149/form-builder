// ==================== Auth ====================

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    full_name: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'user';
    created_at: string;
}

// ==================== Branch ====================

export interface Branch {
    id: string;
    name: string;
    location: string;
    created_at: string;
}

// ==================== Form Schema ====================

export interface FormField {
    id: string;
    type: 'text' | 'number' | 'select' | 'radio' | 'checkbox_group' | 'video_upload' | 'file_upload';
    label: string;
    name?: string;
    required: boolean;
    placeholder?: string;
    default_value?: unknown;
    validation_rules?: Record<string, unknown>;
    data_source?: string;
    options?: Array<{ label: string; value: string }>;
}

export interface LogicCondition {
    field: string;
    operator: string;
    value: unknown;
}

export interface LogicRule {
    condition: LogicCondition;
    conditions?: LogicCondition[];
    logic?: 'and' | 'or';
    action: Record<string, string>;
}

// ==================== Form ====================

export interface FormVersion {
    id: string;
    version: number;
    fields_schema: FormField[];
    logic_rules: LogicRule[];
    created_at: string;
}

export interface FormDefinition {
    id: string;
    title: string;
    description?: string;
    status: 'draft' | 'published' | 'archived';
    current_version: number;
    collect_respondent_info: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
    latest_version?: FormVersion;
}

export interface FormListItem {
    id: string;
    title: string;
    description?: string;
    status: string;
    current_version: number;
    fields_count: number;
    created_at: string;
}

export interface FormCreateRequest {
    title: string;
    description?: string;
    fields_schema: FormField[];
    logic_rules?: LogicRule[];
    collect_respondent_info?: boolean;
}

export interface FormUpdateRequest {
    title?: string;
    description?: string;
    fields_schema?: FormField[];
    logic_rules?: LogicRule[];
    status?: string;
    collect_respondent_info?: boolean;
}

// ==================== Submission ====================

export interface Submission {
    id: string;
    form_id: string;
    form_version: number;
    branch_id: string;
    submitted_by: string;
    respondent_name?: string;
    respondent_email?: string;
    submission_data: Record<string, unknown>;
    status: string;
    created_at: string;
}

export interface SubmissionListItem {
    id: string;
    form_id: string;
    form_version: number;
    branch_id: string;
    submitted_by: string;
    respondent_name?: string;
    respondent_email?: string;
    status: string;
    created_at: string;
}

export interface SubmissionCreateRequest {
    branch_id: string;
    submission_data: Record<string, unknown>;
    respondent_name?: string;
    respondent_email?: string;
}

// ==================== Paginated ====================

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    skip: number;
    limit: number;
}

// ==================== Upload ====================

export interface UploadResponse {
    url: string;
    public_id: string;
    resource_type: string;
    format: string;
    bytes: number;
}
