
import { WishlistInsight } from "@/pages/admin/AdminWishlistInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Rupee } from "@/components/icons/Rupee";
import { useState } from "react";

interface WishlistTableProps {
  wishlistData: WishlistInsight[];
}

const WishlistTable = ({ wishlistData }: WishlistTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = wishlistData.filter(item => 
    item.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.service_category?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wishlist Data</CardTitle>
        <div className="mt-2">
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Wishlist Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.service_id}>
                  <TableCell className="font-medium">{item.service_name}</TableCell>
                  <TableCell>{item.service_category || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <Rupee className="h-3 w-3 mr-1" />
                      {item.service_price.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.count}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No matching results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default WishlistTable;
