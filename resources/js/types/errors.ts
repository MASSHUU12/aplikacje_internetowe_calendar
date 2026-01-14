export interface Error401 {
    message: string;
}

export interface Error422 {
    message: string;
    errors: Record<string, string[]>;
}

export interface InternalServerError {
    message: string;
}
