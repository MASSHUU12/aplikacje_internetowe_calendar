import { instance } from './api';

export interface UpdatePasswordRequest {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export interface UpdatePasswordResponse {
    message: string;
}

export async function updatePassword(
    json: UpdatePasswordRequest,
): Promise<UpdatePasswordResponse> {
    return instance
        .patch('user/password', { json })
        .json<UpdatePasswordResponse>();
}
