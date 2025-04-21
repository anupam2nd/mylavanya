
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Artist, artistGroupOptions } from "@/types/artist";
import { artistSchema, ArtistFormValues, fullArtistSchema } from "./ArtistFormSchema";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ArtistFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isNewArtist: boolean;
  currentArtist: Artist | null;
  onSuccess: (artist: Artist) => void;
}

const ArtistDetailDialog = ({
  open,
  onOpenChange,
  isNewArtist,
  currentArtist,
  onSuccess
}: ArtistFormDialogProps) => {
  const { toast } = useToast();
  const form = useForm<ArtistFormValues>({
    resolver: zodResolver(isNewArtist ? fullArtistSchema : artistSchema),
    defaultValues: {
      ArtistFirstName: currentArtist?.ArtistFirstName || "",
      ArtistLastName: currentArtist?.ArtistLastName || "",
      ArtistEmpCode: currentArtist?.ArtistEmpCode || "",
      emailid: currentArtist?.emailid || "",
      ArtistPhno: currentArtist?.ArtistPhno ? String(currentArtist.ArtistPhno) : "",
      Artistgrp: currentArtist?.Artistgrp || "",
      Source: currentArtist?.Source || "",
      ArtistRating: currentArtist?.ArtistRating ? String(currentArtist.ArtistRating) : "0",
      password: "",
      Active: currentArtist?.Active !== null ? currentArtist?.Active : true
    }
  });

  const onSubmit = async (values: ArtistFormValues) => {
    try {
      const artistData = {
        ArtistFirstName: values.ArtistFirstName,
        ArtistLastName: values.ArtistLastName,
        ArtistEmpCode: values.ArtistEmpCode || null,
        emailid: values.emailid,
        ArtistPhno: Number(values.ArtistPhno),
        Artistgrp: values.Artistgrp || null,
        Source: values.Source || null,
        ArtistRating: values.ArtistRating ? Number(values.ArtistRating) : null,
        Active: values.Active
      };

      if (isNewArtist) {
        // If password is provided, add it to the artist data
        const insertData = values.password ? 
          { ...artistData, password: values.password } : 
          artistData;
          
        const { data, error } = await supabase
          .from('ArtistMST')
          .insert([insertData])
          .select();

        if (error) throw error;
        
        if (data && data.length > 0) {
          onSuccess(data[0]);
          toast({
            title: "Artist added",
            description: "New artist has been successfully added",
          });
        }
      } else if (currentArtist) {
        // If password is provided and not empty, update it along with other data
        const updateData = values.password ? 
          { ...artistData, password: values.password } : 
          artistData;
          
        const { error } = await supabase
          .from('ArtistMST')
          .update(updateData)
          .eq('ArtistId', currentArtist.ArtistId);

        if (error) throw error;

        onSuccess({ 
          ...currentArtist, 
          ...artistData,
          password: values.password || currentArtist.password
        });
        
        toast({
          title: "Artist updated",
          description: "Artist details have been successfully updated",
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving artist:', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "There was a problem saving the artist",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{isNewArtist ? "Add New Artist" : "Artist Details"}</DialogTitle>
          <DialogDescription>
            {isNewArtist 
              ? "Add a new artist to the system." 
              : "View or edit artist information."}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Artist Details</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ArtistFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="First name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ArtistLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Last name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emailid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="Email address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ArtistPhno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Phone number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ArtistEmpCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Employee ID" />
                        </FormControl>
                        <FormDescription>
                          Unique identification code for the artist
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="Artistgrp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Artist Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {artistGroupOptions.map((group) => (
                              <SelectItem key={group} value={group}>{group}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="Source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="How did they join?" />
                        </FormControl>
                        <FormDescription>
                          Where the artist was recruited from
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ArtistRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating (0-5)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0" 
                            max="5" 
                            step="0.1" 
                            placeholder="Artist rating"
                          />
                        </FormControl>
                        <FormDescription>
                          Performance rating out of 5
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="account" className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isNewArtist ? "Password" : "Change Password"} {isNewArtist && <span className="text-red-500">*</span>}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password" 
                          placeholder={isNewArtist ? "Enter password" : "Leave blank to keep current password"} 
                        />
                      </FormControl>
                      <FormDescription>
                        {isNewArtist 
                          ? "Password for account login" 
                          : "Enter a new password only if you want to change it"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="Active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Account Status</FormLabel>
                        <FormDescription>
                          {field.value 
                            ? "Artist is currently active and can be assigned bookings" 
                            : "Artist is currently inactive and cannot be assigned bookings"}
                        </FormDescription>
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
              </TabsContent>
              
              <DialogFooter>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isNewArtist ? "Add Artist" : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ArtistDetailDialog;
