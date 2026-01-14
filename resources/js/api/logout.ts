import { instance } from './api';

export interface LogoutResponse {
    message: string;
}

export async function logout(): Promise<LogoutResponse> {
    return instance.post('logout').json<LogoutResponse>();
}
