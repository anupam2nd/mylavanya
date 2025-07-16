
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, SortAsc, SortDesc, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import ServiceDetailsDialog from '@/components/services/ServiceDetailsDialog';

const bookingSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  phonenumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  is_phone_whatsapp: z.boolean().default(false),
  whatsapp_number: z.string().optional(),
  selected_service_id: z.number().optional(),
  selected_service_name: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface Service {
  prod_id: number;
  ProductName: string;
  Description: string;
  Price: number;
  NetPayable?: number;
  Category: string;
  SubCategory: string;
  imageUrl?: string;
  Discount?: number;
  Scheme?: string;
}

interface Category {
  category_id: number;
  category_name: string;
}

interface SubCategory {
  sub_category_id: number;
  sub_category_name: string;
  category_id: number;
}

export default function BookNow() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedServiceForDialog, setSelectedServiceForDialog] = useState<Service | null>(null);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      phonenumber: '',
      is_phone_whatsapp: false,
      whatsapp_number: '',
    },
  });

  const watchIsPhoneWhatsapp = form.watch('is_phone_whatsapp');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('PriceMST')
          .select('prod_id, ProductName, Description, Price, NetPayable, Category, SubCategory, imageUrl, Discount, Scheme')
          .eq('active', true)
          .order('ProductName');

        if (servicesError) throw servicesError;
        setServices(servicesData || []);
        setFilteredServices(servicesData || []);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('category_name');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch subcategories
        const { data: subCategoriesData, error: subCategoriesError } = await supabase
          .from('sub_categories')
          .select('*')
          .order('sub_category_name');

        if (subCategoriesError) throw subCategoriesError;
        setSubCategories(subCategoriesData || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive',
        });
      }
    };

    fetchData();
  }, [toast]);

  // Filter and sort services
  useEffect(() => {
    let filtered = services.filter(service => {
      const matchesSearch = service.ProductName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.Description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || selectedCategory === 'all' || service.Category === selectedCategory;
      const matchesSubCategory = !selectedSubCategory || selectedSubCategory === 'all' || service.SubCategory === selectedSubCategory;
      
      return matchesSearch && matchesCategory && matchesSubCategory;
    });

    // Sort by price
    filtered = filtered.sort((a, b) => {
      const priceA = a.NetPayable || a.Price || 0;
      const priceB = b.NetPayable || b.Price || 0;
      return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    });

    setFilteredServices(filtered);
  }, [services, searchTerm, selectedCategory, selectedSubCategory, sortOrder]);

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedService) {
      toast({
        title: 'Error',
        description: 'Please select a service before booking',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('ExternalLeadMST')
        .insert({
          firstname: data.firstname,
          lastname: data.lastname,
          phonenumber: data.phonenumber,
          is_phone_whatsapp: data.is_phone_whatsapp,
          whatsapp_number: data.is_phone_whatsapp ? data.phonenumber : data.whatsapp_number,
          selected_service_id: selectedService.prod_id,
          selected_service_name: selectedService.ProductName,
        });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your booking request has been submitted successfully. We will contact you soon.',
      });

      // Reset form and navigate to home
      form.reset();
      setSelectedService(null);
      navigate('/');
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit booking request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter subcategories based on selected category
  const filteredSubCategories = selectedCategory && selectedCategory !== 'all'
    ? subCategories.filter(sub => {
        const category = categories.find(cat => cat.category_name === selectedCategory);
        return category && sub.category_id === category.category_id;
      })
    : subCategories;

  const handleServiceClick = (service: Service) => {
    setSelectedServiceForDialog(service);
    setShowServiceDialog(true);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setShowServiceDialog(false);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4">Book Your Service</h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">Choose your service and book an appointment with us</p>
          </div>

          <div className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Select Service</CardTitle>
                <CardDescription className="text-sm">Browse and select the service you need</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Filters - Side by side for mobile */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <Select value={selectedCategory} onValueChange={(value) => {
                      setSelectedCategory(value);
                      setSelectedSubCategory('all');
                    }}>
                      <SelectTrigger className="text-xs sm:text-sm">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.category_id} value={category.category_name}>
                            {category.category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory}>
                      <SelectTrigger className="text-xs sm:text-sm">
                        <SelectValue placeholder="Sub Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sub Categories</SelectItem>
                        {filteredSubCategories.map(subCategory => (
                          <SelectItem key={subCategory.sub_category_id} value={subCategory.sub_category_name}>
                            {subCategory.sub_category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-3 w-3 sm:h-4 sm:w-4" /> : <SortDesc className="h-3 w-3 sm:h-4 sm:w-4" />}
                    Price {sortOrder === 'asc' ? 'Low to High' : 'High to Low'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredServices.map(service => {
                const displayPrice = service.NetPayable || service.Price || 0;
                const hasDiscount = service.NetPayable && service.NetPayable < service.Price;
                
                return (
                  <Card
                    key={service.prod_id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedService?.prod_id === service.prod_id 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'hover:bg-muted/30'
                    }`}
                    onClick={() => setSelectedService(service)}
                  >
                    {/* Service Image */}
                    <div className="relative aspect-video bg-gray-100 overflow-hidden">
                      {service.imageUrl ? (
                        <img
                          src={service.imageUrl}
                          alt={service.ProductName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                      
                      {/* View Details Button */}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServiceClick(service);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>

                    <CardContent className="p-3 sm:p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2">
                          {service.ProductName}
                        </h3>
                        
                        {/* Categories */}
                        <div className="flex flex-wrap gap-1">
                          {service.Category && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              {service.Category}
                            </Badge>
                          )}
                          {service.SubCategory && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              {service.SubCategory}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-base sm:text-lg text-primary">
                            ₹{displayPrice}
                          </span>
                          {hasDiscount && (
                            <>
                              <span className="text-xs text-gray-500 line-through">
                                ₹{service.Price}
                              </span>
                              {service.Discount && (
                                <Badge variant="destructive" className="text-xs">
                                  {service.Discount}% OFF
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No services found. Try adjusting your search or filters.</p>
              </div>
            )}

            {/* Booking Form - Fixed position on larger screens */}
            {selectedService && (
              <div className="lg:fixed lg:top-4 lg:right-4 lg:w-80 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:z-10">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Details</CardTitle>
                    <CardDescription className="text-sm">Please provide your contact information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="firstname"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">First Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter first name" {...field} className="text-sm" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="lastname"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Last Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter last name" {...field} className="text-sm" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="phonenumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Phone Number *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter phone number" {...field} className="text-sm" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="is_phone_whatsapp"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">WhatsApp Number</FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  Is the phone number above your WhatsApp number?
                                </p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {!watchIsPhoneWhatsapp && (
                          <FormField
                            control={form.control}
                            name="whatsapp_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">WhatsApp Number (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter WhatsApp number" {...field} className="text-sm" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {/* Selected Service Display */}
                        <div className="bg-muted p-3 rounded-lg">
                          <h3 className="font-semibold text-sm text-foreground mb-2">Selected Service:</h3>
                          <p className="text-sm text-foreground">{selectedService.ProductName}</p>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="font-bold text-base text-primary">
                              ₹{selectedService.NetPayable || selectedService.Price || 0}
                            </span>
                            {selectedService.NetPayable && selectedService.NetPayable < selectedService.Price && (
                              <span className="text-xs text-gray-500 line-through">
                                ₹{selectedService.Price}
                              </span>
                            )}
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full text-sm" 
                          disabled={loading}
                        >
                          {loading ? 'Submitting...' : 'Book Now'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      <ServiceDetailsDialog
        service={selectedServiceForDialog}
        isOpen={showServiceDialog}
        onClose={() => setShowServiceDialog(false)}
        onSelect={handleServiceSelect}
      />
    </MainLayout>
  );
}
