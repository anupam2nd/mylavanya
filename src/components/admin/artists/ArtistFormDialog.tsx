
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Artist, artistGroupOptions } from "@/types/artist";
import { artistSchema, ArtistFormValues } from "./ArtistFormSchema";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
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

export const ArtistFormDialog = ({
  open,
  onOpenChange,
  isNewArtist,
  currentArtist,
  onSuccess
}: ArtistFormDialogProps) => {
  const { toast } = useToast();
  const form = useForm<ArtistFormValues>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      ArtistFirstName: currentArtist?.ArtistFirstName || "",
      ArtistLastName: currentArtist?.ArtistLastName || "",
      ArtistEmpCode: currentArtist?.ArtistEmpCode || "",
      ArtistPhno: currentArtist?.ArtistPhno ? String(currentArtist.ArtistPhno) : "",
      Artistgrp: currentArtist?.Artistgrp || "",
      Source: currentArtist?.Source || "",
      ArtistRating: currentArtist?.ArtistRating ? String(currentArtist.ArtistRating) : "0",
      // Fix for the Active property - set a default value when currentArtist is null or Active is null
      Active: currentArtist?.Active !== null ? currentArtist?.Active : true
    }
  });

  const onSubmit = async (values: ArtistFormValues) => {
    try {
      const artistData = {
        ArtistFirstName: values.ArtistFirstName,
        ArtistLastName: values.ArtistLastName,
        ArtistEmpCode: values.ArtistEmpCode || null,
        ArtistPhno: Number(values.ArtistPhno),
        Artistgrp: values.Artistgrp || null,
        Source: values.Source || null,
        ArtistRating: values.ArtistRating ? Number(values.ArtistRating) : null,
        Active: values.Active
      };

      if (isNewArtist) {
        const { data, error } = await supabase
          .from('ArtistMST')
          .insert([artistData])
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
        const { error } = await supabase
          .from('ArtistMST')
          .update(artistData)
          .eq('ArtistId', currentArtist.ArtistId);

        if (error) throw error;

        onSuccess({ ...currentArtist, ...artistData });
        toast({
          title: "Artist updated",
          description: "Artist has been successfully updated",
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isNewArtist ? "Add New Artist" : "Edit Artist"}</DialogTitle>
          <DialogDescription>
            {isNewArtist 
              ? "Add a new artist to the system." 
              : "Make changes to the existing artist."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ArtistFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                    <FormLabel>Employee Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="Artistgrp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist Group</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select group" />
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
              
              <FormField
                control={form.control}
                name="Source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="Active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-end space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active Status</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
      </DialogContent>
    </Dialog>
  );
};
