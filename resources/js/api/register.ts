import { User } from '@/types/user';
import { instance } from './api';

export interface RegisterRequest {
    email: string;
    password: string;
    password_confirmation: string;
}

export interface RegisterResponse {
    user: User;
    token: string;
}

export async function register(
    json: RegisterRequest,
): Promise<RegisterResponse> {
    return instance.post('register', { json }).json<RegisterResponse>();
}
