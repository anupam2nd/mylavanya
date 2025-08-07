import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';

const bookingSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  phonenumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  interested_category: z.string().min(1, 'Please select a category'),
  has_whatsapp: z.boolean().optional(),
  consent: z.boolean().refine(val => val === true, 'You must agree to the Terms & Conditions and Privacy Policy'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface Category {
  category_id: number;
  category_name: string;
}

export default function BookNow() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullname: '',
      phonenumber: '',
      interested_category: '',
      has_whatsapp: false,
      consent: false,
    },
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('category_name');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to load categories',
          variant: 'destructive',
        });
      }
    };

    fetchCategories();
  }, [toast]);

  const onSubmit = async (data: BookingFormData) => {
    if (!data.consent) {
      toast({
        title: 'Consent Required',
        description: 'Please agree to the Terms & Conditions and Privacy Policy to proceed.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Extract first and last name from full name
      const nameParts = data.fullname.trim().split(' ');
      const firstname = nameParts[0] || '';
      const lastname = nameParts.slice(1).join(' ') || '';

      const { error } = await supabase.from('ExternalLeadMST').insert({
        firstname,
        lastname,
        phonenumber: data.phonenumber,
        is_phone_whatsapp: data.has_whatsapp || false,
        selected_service_name: data.interested_category,
      });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your booking request has been submitted successfully. We will contact you soon.',
      });

      // Reset form and navigate to home
      form.reset();
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

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center py-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">Book Your Service</h1>
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">Fill in your details and we will contact you soon</p>
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="text-primary hover:text-primary-foreground"
              >
                Visit Our Home Page
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Booking Request</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="fullname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone Number */}
                  <FormField
                    control={form.control}
                    name="phonenumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your phone number" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* WhatsApp Toggle */}
                  <FormField
                    control={form.control}
                    name="has_whatsapp"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            WhatsApp Account
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Does this phone number have a WhatsApp account?
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

                  {/* Interested Service Category */}
                  <FormField
                    control={form.control}
                    name="interested_category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interested in *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Please choose a service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.category_id} value={category.category_name}>
                                {category.category_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                   />

                   {/* Terms & Conditions and Privacy Policy Checkbox */}
                   <FormField
                     control={form.control}
                     name="consent"
                     render={({ field }) => (
                       <FormItem>
                         <div className="flex items-start space-x-3 pt-2">
                           <FormControl>
                             <Checkbox
                               checked={field.value}
                               onCheckedChange={field.onChange}
                               className="mt-1"
                             />
                           </FormControl>
                           <FormLabel className="text-sm text-muted-foreground leading-relaxed">
                             I have read and agree to the{" "}
                             <Link 
                               to="/terms" 
                               className="text-primary hover:underline font-medium"
                               target="_blank"
                             >
                               Terms & Conditions
                             </Link>
                             {" "}and{" "}
                             <Link 
                               to="/privacy" 
                               className="text-primary hover:underline font-medium"
                               target="_blank"
                             >
                               Privacy Policy
                             </Link>
                             .
                           </FormLabel>
                         </div>
                         <FormMessage />
                       </FormItem>
                     )}
                   />

                   {/* Submit Button */}
                   <Button 
                     type="submit" 
                     className="w-full" 
                     disabled={loading || !form.watch('consent')}
                   >
                     {loading ? 'Submitting...' : 'Book Now'}
                   </Button>
                 </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}