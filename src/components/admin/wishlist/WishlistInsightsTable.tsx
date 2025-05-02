
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WishlistInsight {
  id: number;
  service_id: number;
  user_id: string;
  created_at: string;
  product_name: string;
  product_price: number;
  product_created_at: string;
  customer_name: string;
}

export function WishlistInsightsTable({ data }: { data: WishlistInsight[] }) {
  // Format date string to a more readable format
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Product Created</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Added to Wishlist</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.product_name}</TableCell>
              <TableCell>₹{item.product_price.toFixed(2)}</TableCell>
              <TableCell>{formatDate(item.product_created_at)}</TableCell>
              <TableCell>{item.customer_name}</TableCell>
              <TableCell>{formatDate(item.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
