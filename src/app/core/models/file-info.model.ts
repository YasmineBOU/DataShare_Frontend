export interface FileInfo {
    // Properties returned by the backend API
    id: number;
    filename: string;
    fileSize: string;
    fileToken: string;
    createdAt: string;
    expirationDate: string; 
    hasPassword: boolean;
    // Optional properties for UI display
    isExpired?: boolean;
    expirationMsg?: string;
    fileIconUrl?: string;
}