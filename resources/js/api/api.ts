import ky from 'ky';

export interface Payload {
    token?: string;
}

export const setToken = (newToken: string) => {
    localStorage.setItem("token", newToken);
};

export const clearToken = () => {
    localStorage.removeItem("token")
};

export const getToken = () => {
    return localStorage.getItem("token")
}

export const instance = ky.extend({
    prefixUrl: '/api',
    timeout: 10000,
    headers: {
        Accept: 'application/json',
    },
    hooks: {
        beforeRequest: [
            (request) => {
                const authToken = getToken()

                if (authToken) {
                    request.headers.set('Authorization', `Bearer ${authToken}`);
                }
            },
        ],
    },
});
