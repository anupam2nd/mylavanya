
import { TableName } from "@/components/admin/editors/tableDataService";

// Helper function to validate table names
export const isValidTableName = (name: string): name is TableName => {
  return ["BookMST", "PriceMST", "statusmst", "UserMST"].includes(name);
};
