import apiClient from './client';
import type {
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    User,
    FormDefinition,
    FormCreateRequest,
    FormUpdateRequest,
    FormListItem,
    Submission,
    SubmissionCreateRequest,
    SubmissionListItem,
    Branch,
    UploadResponse,
    PaginatedResponse,
} from '@/types';

// ==================== Auth ====================

export const authApi = {
    register: (data: RegisterRequest) =>
        apiClient.post<User>('/api/auth/register', data).then((r) => r.data),

    login: (data: LoginRequest) =>
        apiClient.post<TokenResponse>('/api/auth/login', data).then((r) => r.data),

    getMe: () =>
        apiClient.get<User>('/api/auth/me').then((r) => r.data),
};

// ==================== Metadata ====================

export const metadataApi = {
    getBranches: () =>
        apiClient.get<Branch[]>('/api/metadata/branches').then((r) => r.data),

    createBranch: (data: { name: string; location: string }) =>
        apiClient.post<Branch>('/api/metadata/branches', data).then((r) => r.data),
};

// ==================== Forms ====================

export const formsApi = {
    list: (params?: { search?: string; status?: string; skip?: number; limit?: number }) =>
        apiClient.get<PaginatedResponse<FormListItem>>('/api/forms', { params }).then((r) => r.data),

    get: (id: string) =>
        apiClient.get<FormDefinition>(`/api/forms/${id}`).then((r) => r.data),

    create: (data: FormCreateRequest) =>
        apiClient.post<FormDefinition>('/api/forms', data).then((r) => r.data),

    update: (id: string, data: FormUpdateRequest) =>
        apiClient.put<FormDefinition>(`/api/forms/${id}`, data).then((r) => r.data),

    delete: (id: string) =>
        apiClient.delete(`/api/forms/${id}`),
};

// ==================== Submissions ====================

export const submissionsApi = {
    create: (formId: string, data: SubmissionCreateRequest) =>
        apiClient.post<Submission>(`/api/forms/${formId}/submissions`, data).then((r) => r.data),

    list: (formId: string, params?: { skip?: number; limit?: number }) =>
        apiClient.get<PaginatedResponse<SubmissionListItem>>(`/api/forms/${formId}/submissions`, { params }).then((r) => r.data),

    get: (id: string) =>
        apiClient.get<Submission>(`/api/forms/submissions/${id}`).then((r) => r.data),
};

// ==================== Uploads ====================

export const uploadsApi = {
    upload: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient
            .post<UploadResponse>('/api/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((r) => r.data);
    },
};
