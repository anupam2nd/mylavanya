
import { supabase } from "@/integrations/supabase/client";
import { isSyntheticEmail, extractPhoneFromSyntheticEmail } from "./syntheticEmail";

/**
 * Handle member profile creation after Supabase auth user creation
 */
export const handleMemberProfileCreation = async (authUser: any) => {
  try {
    const userMetadata = authUser.raw_user_meta_data || {};
    const isPhoneRegistration = userMetadata.isPhoneRegistration || false;
    
    // Determine email and phone values
    let email = authUser.email;
    let phoneNumber = userMetadata.phoneNumber || '';
    let originalPhone = userMetadata.originalPhone || '';
    let syntheticEmail = null;
    
    if (isPhoneRegistration && isSyntheticEmail(authUser.email)) {
      // This is a phone-based registration with synthetic email
      syntheticEmail = authUser.email;
      email = null; // Don't store synthetic email as real email
      
      if (!phoneNumber) {
        phoneNumber = extractPhoneFromSyntheticEmail(authUser.email);
      }
      if (!originalPhone) {
        originalPhone = phoneNumber;
      }
    }
    
    // Insert or update member profile
    const { error } = await supabase
      .from('member_profiles')
      .upsert({
        id: authUser.id,
        first_name: userMetadata.firstName || '',
        last_name: userMetadata.lastName || '',
        phone_number: phoneNumber,
        original_phone: originalPhone,
        synthetic_email: syntheticEmail,
        email: email,
        sex: userMetadata.sex || 'Male',
        date_of_birth: userMetadata.dob || null,
        address: userMetadata.address || '',
        pincode: userMetadata.pincode || '',
        member_status: true,
        marital_status: false,
        has_children: false,
        number_of_children: 0,
        children_details: []
      }, {
        onConflict: 'id'
      });
      
    if (error) {
      console.error('Error creating member profile:', error);
      throw error;
    }
    
    console.log('Member profile created successfully');
  } catch (error) {
    console.error('Error in handleMemberProfileCreation:', error);
    throw error;
  }
};
