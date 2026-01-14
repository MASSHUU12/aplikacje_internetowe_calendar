import ky from 'ky';

export interface Payload {
    token?: string;
}

let authToken: string | undefined;

export const setToken = (newToken: string) => {
    authToken = newToken;
};

export const clearToken = () => {
    authToken = undefined;
};

export const instance = ky.extend({
    prefixUrl: '/api',
    timeout: 10000,
    headers: {
        Accept: 'application/json',
    },
    hooks: {
        beforeRequest: [
            (request) => {
                if (authToken) {
                    request.headers.set('Authorization', `Bearer ${authToken}`);
                }
            },
        ],
    },
});
