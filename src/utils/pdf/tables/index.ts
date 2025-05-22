
// Re-export all table-related functions from a central location
import { generateTable } from './generators/tableGenerator';
import { drawManualTable } from './generators/manualTableGenerator';
import { 
  createApartmentRows, 
  createExtrasRows, 
  createIncludedServicesRows 
} from './priceTableData';

// Export table generators
export {
  generateTable,
  drawManualTable
};

// Export table data creators
export {
  createApartmentRows,
  createExtrasRows,
  createIncludedServicesRows
};
