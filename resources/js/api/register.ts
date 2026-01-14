import { User } from '@/types/user';

export interface RegisterRequest {
    email: string;
    password: string;
    password_confirmation: string;
}

export interface RegisterResponse {
    user: User;
    token: string;
}
