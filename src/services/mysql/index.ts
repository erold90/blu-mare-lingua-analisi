
import { DataType } from "../externalStorage";
import { MySQLConnectionOptions } from "./types";
import { MySQLConnectionManager } from "./connectionManager";
import { LocalStorageHandler } from "./localStorageHandler";
import { DataValidator } from "./dataValidator";
import { DataLoader } from "./dataLoader";
import { DataSaver } from "./dataSaver";
import { DataSynchronizer } from "./synchronizer";

class MySQLStorage {
  private connectionManager: MySQLConnectionManager;
  private localStorage: LocalStorageHandler;
  private validator: DataValidator;
  private dataLoader: DataLoader;
  private dataSaver: DataSaver;
  private synchronizer: DataSynchronizer;
  
  constructor(options: MySQLConnectionOptions) {
    this.connectionManager = new MySQLConnectionManager(options);
    this.localStorage = new LocalStorageHandler();
    this.validator = new DataValidator();
    this.dataLoader = new DataLoader(this.localStorage, this.validator, this.connectionManager);
    this.dataSaver = new DataSaver(this.localStorage, this.connectionManager);
    this.synchronizer = new DataSynchronizer(this.localStorage, this.connectionManager, this.dataLoader);
  }
  
  public async initialize(): Promise<boolean> {
    return this.connectionManager.initialize();
  }
  
  public async loadData<T>(type: DataType): Promise<T | null> {
    return this.dataLoader.loadData<T>(type);
  }
  
  public async saveData<T>(type: DataType, data: T): Promise<boolean> {
    return this.dataSaver.saveData<T>(type, data);
  }
  
  public async synchronize(type: DataType): Promise<void> {
    return this.synchronizer.synchronize(type);
  }
  
  public async forceSyncAllData(): Promise<boolean> {
    return this.connectionManager.forceSyncAllData();
  }
  
  public isConnected(): boolean {
    return this.connectionManager.isConnected();
  }
}

// Export singleton instance
export const mysqlStorage = new MySQLStorage({
  host: "31.11.39.219",
  username: "Sql1864200",
  database: "Sql1864200_1",
});

export { MySQLStorage };
export type { MySQLConnectionOptions };
