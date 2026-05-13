export interface FileInfo {
    id: number;
    filename: string;
    fileSize: number;
    createdAt: string;
    expirationDate: string; 
    hasPassword: boolean;
    isExpired?: boolean;
    expireMessage?: string;
    fileIconUrl?: string;
}