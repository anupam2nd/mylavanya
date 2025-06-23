
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileFormData, ChildDetail, JsonCompatible } from "@/types/profile";
import { User } from "@/types/auth";

export const useProfileData = (user: User | null) => {
  const [profileData, setProfileData] = useState<ProfileFormData>({
    email: user?.email || "",
    firstName: "",
    lastName: "",
    phone: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching profile data for user:", user);
        
        if (user.role === 'artist') {
          const artistId = parseInt(user.id, 10);
          if (!isNaN(artistId)) {
            const { data, error } = await supabase
              .from('ArtistMST')
              .select('ArtistFirstName, ArtistLastName, ArtistPhno')
              .eq('ArtistId', artistId)
              .single();
              
            if (error) {
              throw new Error(`Error fetching artist profile: ${error.message}`);
            }
            
            if (data) {
              setProfileData({
                email: user?.email || "", 
                firstName: data.ArtistFirstName || "",
                lastName: data.ArtistLastName || "",
                phone: data.ArtistPhno?.toString() || ""
              });
              console.log("Artist profile data loaded:", data);
            }
          }
        } 
        else if (user.role === 'member') {
          // Fetch member data from MemberMST table with new fields
          const { data, error } = await supabase
            .from('MemberMST')
            .select('MemberFirstName, MemberLastName, MemberPhNo, MemberEmailId, MaritalStatus, SpouseName, HasChildren, NumberOfChildren, ChildrenDetails')
            .eq('MemberEmailId', user.email)
            .single();
            
          if (error) {
            throw new Error(`Error fetching member profile: ${error.message}`);
          }
          
          if (data) {
            // Parse ChildrenDetails JSON to ensure correct typing
            let childrenDetails: ChildDetail[] = [];
            if (data.ChildrenDetails) {
              try {
                if (typeof data.ChildrenDetails === 'string') {
                  childrenDetails = JSON.parse(data.ChildrenDetails);
                } else if (Array.isArray(data.ChildrenDetails)) {
                  // Safely convert Json array to ChildDetail array
                  childrenDetails = (data.ChildrenDetails as any[]).map(child => ({
                    name: child.name || '',
                    age: child.age || ''
                  }));
                }
              } catch (e) {
                console.error("Error parsing ChildrenDetails:", e);
                childrenDetails = [];
              }
            }
            
            setProfileData({
              email: user?.email || "",
              firstName: data.MemberFirstName || "",
              lastName: data.MemberLastName || "",
              phone: data.MemberPhNo || "",
              maritalStatus: data.MaritalStatus || false,
              spouseName: data.SpouseName || "",
              hasChildren: data.HasChildren || false,
              numberOfChildren: data.NumberOfChildren || 0,
              childrenDetails: childrenDetails
            });
            console.log("Member profile data loaded:", data);
          }
        }
        else {
          const { data, error } = await supabase
            .from('UserMST')
            .select('FirstName, LastName, email_id, PhoneNo')
            .eq('email_id', user.email)
            .single();
            
          if (error) {
            console.error("Error fetching user profile by email_id:", error);
            
            // Fallback to searching by ID if email_id search fails
            const { data: idData, error: idError } = await supabase
              .from('UserMST')
              .select('FirstName, LastName, email_id, PhoneNo')
              .eq('id', Number(user.id))
              .single();
              
            if (idError) {
              throw new Error(`Error fetching user profile: ${idError.message}`);
            }
            
            if (idData) {
              setProfileData({
                email: user?.email || "",
                firstName: idData.FirstName || "",
                lastName: idData.LastName || "",
                phone: idData.PhoneNo?.toString() || ""
              });
              console.log("User profile data loaded via ID:", idData);
            }
            return;
          }
          
          if (data) {
            setProfileData({
              email: user?.email || "",
              firstName: data.FirstName || "",
              lastName: data.LastName || "",
              phone: data.PhoneNo?.toString() || ""
            });
            console.log("User profile data loaded via email_id:", data);
          }
        }
      } catch (err) {
        console.error("Error in profile fetch:", err);
        setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user?.id, user?.email, user?.role]);

  return { profileData, isLoading, error };
};

export default useProfileData;
