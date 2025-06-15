
import { DataType } from "../externalStorage";

export class LocalStorageHandler {
  private storagePrefix: string = "mysql_data_";
  
  public saveToLocalStorage<T>(type: DataType, data: T): void {
    try {
      localStorage.setItem(`${this.storagePrefix}${type}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Errore nel salvataggio in localStorage per ${type}:`, error);
    }
  }

  public loadFromLocalStorage<T>(type: DataType): T | null {
    try {
      const data = localStorage.getItem(`${this.storagePrefix}${type}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Errore nel caricamento da localStorage per ${type}:`, error);
      return null;
    }
  }
}
