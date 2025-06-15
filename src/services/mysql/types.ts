
import { DataType } from "../externalStorage";

export interface MySQLConnectionOptions {
  host: string;
  username: string;
  database: string;
  port?: number;
}

export interface MySQLStorageConfig {
  baseUrl: string;
  connectionOptions: MySQLConnectionOptions;
  connected: boolean;
  isInitializing: boolean;
  initPromise: Promise<boolean> | null;
  storagePrefix: string;
  retryAttempts: number;
  maxRetries: number;
  lastConnectionAttempt: number;
  connectionTimeout: number;
}

export interface ValidationResult {
  isValid: boolean;
  data?: any;
}
