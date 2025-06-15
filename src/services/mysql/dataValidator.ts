
import { DataType } from "../externalStorage";

export class DataValidator {
  public isValidData(data: any, type: DataType): boolean {
    if (data === null || data === undefined) return false;
    
    switch(type) {
      case DataType.RESERVATIONS:
        return Array.isArray(data);
      case DataType.CLEANING_TASKS:
        return Array.isArray(data);
      case DataType.APARTMENTS:
        return Array.isArray(data);
      case DataType.PRICES:
        return data !== null;
      default:
        return true;
    }
  }
  
  public getDataTypeLabel(type: DataType): string {
    switch(type) {
      case DataType.RESERVATIONS:
        return "prenotazioni";
      case DataType.CLEANING_TASKS:
        return "attività di pulizia";
      case DataType.APARTMENTS:
        return "appartamenti";
      case DataType.PRICES:
        return "prezzi";
      default:
        return type;
    }
  }
}
