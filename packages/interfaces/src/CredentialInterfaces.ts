export const CredentialDef = {
    identifier: "ICredentialLoader"
}

export interface CredentialData {
    id: string;
    name: string;
    provider: string;
    kind: string;
    createAt: Date;
    updatedAt: Date;
    config?: any;
}

export interface CredentialListOptions {
    type?: string;
}

export interface ICredentialLoader {
    get(id: string): Promise<CredentialData | null | undefined>;
    list(opts?: CredentialListOptions) : Promise<CredentialData[] | null | undefined>;
}