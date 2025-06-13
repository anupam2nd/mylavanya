
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Service } from "./ServiceForm";
import { formatDistanceToNow } from "date-fns";

interface ServiceDetailsModalProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ServiceDetailsModal = ({ service, open, onOpenChange }: ServiceDetailsModalProps) => {
  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Service Details - ID #{service.prod_id}
            <Badge variant={service.active ? "default" : "secondary"}>
              {service.active ? "Active" : "Inactive"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Service Name</label>
                <p className="text-sm font-medium">{service.Services}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Product Name</label>
                <p className="text-sm">{service.ProductName || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Sub-service</label>
                <p className="text-sm">{service.Subservice || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Scheme</label>
                <p className="text-sm">{service.Scheme || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Category Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <p className="text-sm">{service.Category || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Sub Category</label>
                <p className="text-sm">{service.SubCategory || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Original Price</label>
                  <p className="text-lg font-semibold text-green-600">₹{service.Price}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Discount</label>
                  <p className="text-lg font-semibold text-red-600">{service.Discount}%</p>
                </div>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Net Payable</label>
                <p className="text-xl font-bold text-primary">₹{service.NetPayable}</p>
              </div>
            </CardContent>
          </Card>

          {/* Image and Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Media & Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {service.imageUrl && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Service Image</label>
                  <div className="mt-2">
                    <img 
                      src={service.imageUrl} 
                      alt={service.Services}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                  {service.Description || "No description available"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Service ID</label>
                  <p className="text-sm font-mono">#{service.prod_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant={service.active ? "default" : "secondary"}>
                      {service.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                {service.created_at && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="text-sm">
                      {formatDistanceToNow(new Date(service.created_at), { addSuffix: true })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetailsModal;
