
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, SortAsc, SortDesc } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';

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
  Category: string;
  SubCategory: string;
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
          .select('prod_id, ProductName, Description, Price, Category, SubCategory')
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
      return sortOrder === 'asc' ? (a.Price || 0) - (b.Price || 0) : (b.Price || 0) - (a.Price || 0);
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

  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Book Your Service</h1>
            <p className="text-muted-foreground text-lg">Choose your service and book an appointment with us</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Service Selection */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Service</CardTitle>
                  <CardDescription>Browse and select the service you need</CardDescription>
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

                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select value={selectedCategory} onValueChange={(value) => {
                      setSelectedCategory(value);
                      setSelectedSubCategory('all'); // Reset subcategory
                    }}>
                      <SelectTrigger>
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
                      <SelectTrigger>
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
                      className="flex items-center gap-2"
                    >
                      {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      Price {sortOrder === 'asc' ? 'Low to High' : 'High to Low'}
                    </Button>
                  </div>

                  {/* Services List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredServices.map(service => (
                      <Card
                        key={service.prod_id}
                        className={`cursor-pointer transition-colors ${
                          selectedService?.prod_id === service.prod_id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedService(service)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{service.ProductName}</h3>
                              <p className="text-sm text-muted-foreground">{service.Description}</p>
                              <div className="flex gap-2 mt-1">
                                {service.Category && (
                                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                                    {service.Category}
                                  </span>
                                )}
                                {service.SubCategory && (
                                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                                    {service.SubCategory}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-foreground">₹{service.Price || 0}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Your Details</CardTitle>
                  <CardDescription>Please provide your contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter first name" {...field} />
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
                              <FormLabel>Last Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter last name" {...field} />
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
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="is_phone_whatsapp"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">WhatsApp Number</FormLabel>
                              <p className="text-sm text-muted-foreground">
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
                              <FormLabel>WhatsApp Number (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter WhatsApp number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Selected Service Display */}
                      {selectedService && (
                        <div className="bg-muted p-4 rounded-lg">
                          <h3 className="font-semibold text-foreground mb-2">Selected Service:</h3>
                          <p className="text-foreground">{selectedService.ProductName}</p>
                          <p className="text-muted-foreground text-sm">{selectedService.Description}</p>
                          <p className="font-bold text-lg text-foreground mt-2">₹{selectedService.Price || 0}</p>
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading || !selectedService}
                      >
                        {loading ? 'Submitting...' : 'Book Now'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
