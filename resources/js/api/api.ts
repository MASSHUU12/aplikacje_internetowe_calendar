import ky from 'ky';

export interface Payload {
    token?: string;
}

export const instance = ky.extend({
    prefixUrl: '/api',
    timeout: 10000,
    headers: {
        Accept: 'application/json',
    },
});
