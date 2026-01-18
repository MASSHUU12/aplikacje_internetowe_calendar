import { User } from '@/types/user';
import { instance } from './api';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export async function login(json: LoginRequest): Promise<LoginResponse> {
    return instance.post('login', { json }).json<LoginResponse>();
}
