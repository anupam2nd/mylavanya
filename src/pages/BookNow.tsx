
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, SortAsc, SortDesc, Eye, X, Check } from 'lucide-react';
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
  address: z.string().min(1, 'Address is required'),
  selected_services: z.array(z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
  })).min(1, 'Please select at least one service'),
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
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedServiceForDialog, setSelectedServiceForDialog] = useState<Service | null>(null);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
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
      address: '',
      selected_services: [],
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
    if (selectedServices.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one service before booking',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Submit multiple bookings
      const bookingPromises = selectedServices.map(service => 
        supabase.from('ExternalLeadMST').insert({
          firstname: data.firstname,
          lastname: data.lastname,
          phonenumber: data.phonenumber,
          is_phone_whatsapp: data.is_phone_whatsapp,
          whatsapp_number: data.is_phone_whatsapp ? data.phonenumber : data.whatsapp_number,
          selected_service_id: service.prod_id,
          selected_service_name: service.ProductName,
        })
      );

      const results = await Promise.all(bookingPromises);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        throw new Error('Some bookings failed to submit');
      }

      toast({
        title: 'Success!',
        description: `Your booking request${selectedServices.length > 1 ? 's have' : ' has'} been submitted successfully. We will contact you soon.`,
      });

      // Reset form and navigate to home
      form.reset();
      setSelectedServices([]);
      setShowDetailsForm(false);
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
    setSelectedServices([service]);
    setShowServiceDialog(false);
    setShowDetailsForm(true);
  };

  const toggleServiceSelection = (service: Service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.prod_id === service.prod_id);
      if (isSelected) {
        const updated = prev.filter(s => s.prod_id !== service.prod_id);
        if (updated.length === 0) {
          setShowDetailsForm(false);
        }
        // Update form with selected services
        form.setValue('selected_services', updated.map(s => ({
          id: s.prod_id,
          name: s.ProductName,
          price: s.NetPayable || s.Price || 0
        })));
        return updated;
      } else {
        const updated = [...prev, service];
        setShowDetailsForm(true);
        // Update form with selected services
        form.setValue('selected_services', updated.map(s => ({
          id: s.prod_id,
          name: s.ProductName,
          price: s.NetPayable || s.Price || 0
        })));
        return updated;
      }
    });
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => {
      return total + (service.NetPayable || service.Price || 0);
    }, 0);
  };

  const isServiceSelected = (service: Service) => {
    return selectedServices.some(s => s.prod_id === service.prod_id);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">Book Your Service</h1>
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">Choose your services and book an appointment with us</p>
          </div>

          {/* Sticky Search and Filters */}
          <div className="sticky top-0 z-20 bg-background border-b pb-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base">Select Services</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Browse and select multiple services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 text-xs h-8"
                  />
                </div>

                {/* Filters - Side by side */}
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={(value) => {
                    setSelectedCategory(value);
                    setSelectedSubCategory('all');
                  }}>
                    <SelectTrigger className="text-xs h-8 flex-1">
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
                    <SelectTrigger className="text-xs h-8 flex-1">
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

                  <Button
                    variant="outline"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="text-xs h-8 px-3"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
                  </Button>
                </div>

                {/* Selected Services Counter */}
                {selectedServices.length > 0 && (
                  <div className="flex items-center justify-between bg-primary/10 p-2 rounded-lg">
                    <span className="text-xs font-medium">
                      {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
                    </span>
                    <span className="text-xs font-bold">
                      Total: ₹{getTotalPrice()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Services Grid - 3 columns on mobile */}
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
            {filteredServices.map(service => {
              const displayPrice = service.NetPayable || service.Price || 0;
              const hasDiscount = service.NetPayable && service.NetPayable < service.Price;
              const isSelected = isServiceSelected(service);
              
              return (
                <Card
                  key={service.prod_id}
                  className={`cursor-pointer transition-all hover:shadow-md relative ${
                    isSelected 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'hover:bg-muted/30'
                  }`}
                  onClick={() => toggleServiceSelection(service)}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-1 left-1 z-10 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-2 w-2" />
                    </div>
                  )}

                  {/* Service Image */}
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
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
                      className="absolute top-1 right-1 h-5 w-5 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceClick(service);
                      }}
                    >
                      <Eye className="h-2 w-2" />
                    </Button>
                  </div>

                  <CardContent className="p-2">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-xs text-foreground line-clamp-2 leading-tight">
                        {service.ProductName}
                      </h3>
                      
                      {/* Categories - Hidden on mobile for space */}
                      <div className="hidden sm:flex flex-wrap gap-1">
                        {service.Category && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {service.Category}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-xs text-primary">
                          ₹{displayPrice}
                        </span>
                        {hasDiscount && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 line-through">
                              ₹{service.Price}
                            </span>
                            {service.Discount && (
                              <Badge variant="destructive" className="text-xs px-1 py-0">
                                {service.Discount}% OFF
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No services found. Try adjusting your search or filters.</p>
            </div>
          )}

          {/* Details Form - Shows when services are selected */}
          {showDetailsForm && selectedServices.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-30 max-h-[80vh] overflow-y-auto">
              <div className="container mx-auto px-4 py-4">
                <Card className="shadow-none border-0">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Your Details</CardTitle>
                        <CardDescription className="text-xs">
                          {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowDetailsForm(false);
                          setSelectedServices([]);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="firstname"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">First Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="First name" {...field} className="text-xs h-8" />
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
                                <FormLabel className="text-xs">Last Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Last name" {...field} className="text-xs h-8" />
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
                              <FormLabel className="text-xs">Phone Number *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter phone number" {...field} className="text-xs h-8" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Address *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your address" {...field} className="text-xs h-8" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="is_phone_whatsapp"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2">
                              <div className="space-y-0.5">
                                <FormLabel className="text-xs">WhatsApp Number</FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  Is phone number your WhatsApp?
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
                                <FormLabel className="text-xs">WhatsApp Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter WhatsApp number" {...field} className="text-xs h-8" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {/* Selected Services Display */}
                        <div className="bg-muted p-3 rounded-lg">
                          <h3 className="font-semibold text-xs text-foreground mb-2">Selected Services:</h3>
                          <div className="space-y-2">
                            {selectedServices.map(service => (
                              <div key={service.prod_id} className="flex justify-between items-center">
                                <div className="flex-1">
                                  <p className="text-xs text-foreground line-clamp-1">{service.ProductName}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-primary">
                                    ₹{service.NetPayable || service.Price || 0}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0"
                                    onClick={() => toggleServiceSelection(service)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold">Total:</span>
                                <span className="text-sm font-bold text-primary">₹{getTotalPrice()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full text-xs h-8" 
                          disabled={loading}
                        >
                          {loading ? 'Submitting...' : `Book ${selectedServices.length} Service${selectedServices.length > 1 ? 's' : ''}`}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
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
