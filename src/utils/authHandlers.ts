import { Session } from '@supabase/supabase-js';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { isSyntheticEmail } from '@/utils/syntheticEmail';

export const handleUserSession = async (
  session: Session, 
  setUser: (user: User | null) => void
) => {
  try {
    const authUser = session.user;
    const userEmail = authUser.email;
    const userMetadata = authUser.user_metadata;
    
    // Check if user is a member (from Supabase auth with userType metadata or synthetic email)
    const isMemberAuth = userMetadata?.userType === 'member' || (userEmail && isSyntheticEmail(userEmail));
    
    // Check if user is an artist (from Supabase auth with userType metadata)
    const isArtistAuth = userMetadata?.userType === 'artist';

    if (isMemberAuth) {
      await handleMemberSession(authUser, setUser);
      return;
    }

    if (isArtistAuth) {
      await handleArtistSession(authUser, setUser);
      return;
    }

    // Check if user is an admin/superadmin/controller by UUID or email
    await handleAdminSession(authUser, setUser);
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
};

const handleMemberSession = async (authUser: any, setUser: (user: User | null) => void) => {
  const userEmail = authUser.email;
  const userMetadata = authUser.user_metadata;

  // Fetch member data from MemberMST table using ID field (synced with auth.uid())
  const { data: memberData, error: memberError } = await supabase
    .from('MemberMST')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (memberError && memberError.code !== 'PGRST116') {
    console.error('Error fetching member data:', memberError);
  }

  if (memberData) {
    setUser({
      id: authUser.id,
      email: memberData.MemberEmailId || memberData.synthetic_email || userEmail || '',
      role: 'member',
      firstName: memberData.MemberFirstName,
      lastName: memberData.MemberLastName
    });
    return;
  }

  // If no member data found, create a basic user profile from auth data
  console.log('No member profile found, creating basic user profile');
  setUser({
    id: authUser.id,
    email: userEmail || '',
    role: 'member',
    firstName: userMetadata?.firstName || '',
    lastName: userMetadata?.lastName || ''
  });
};

const handleArtistSession = async (authUser: any, setUser: (user: User | null) => void) => {
  const userEmail = authUser.email;
  const userMetadata = authUser.user_metadata;

  // Fetch artist data from ArtistMST table using UUID
  const { data: artistData, error: artistError } = await supabase
    .from('ArtistMST')
    .select('*')
    .eq('uuid', authUser.id)
    .single();

  if (artistError && artistError.code !== 'PGRST116') {
    console.error('Error fetching artist data:', artistError);
  }

  if (artistData) {
    setUser({
      id: authUser.id,
      email: artistData.emailid || userEmail || '',
      role: 'artist',
      firstName: artistData.ArtistFirstName,
      lastName: artistData.ArtistLastName
    });
    return;
  }

  // If no artist data found, create a basic user profile from auth data
  console.log('No artist profile found, creating basic user profile');
  setUser({
    id: authUser.id,
    email: userEmail || '',
    role: 'artist',
    firstName: userMetadata?.firstName || '',
    lastName: userMetadata?.lastName || ''
  });
};

const handleAdminSession = async (authUser: any, setUser: (user: User | null) => void) => {
  const userEmail = authUser.email;

  // Check if user is an admin/superadmin/controller by ID or email
  const { data: adminUser } = await supabase
    .from('UserMST')
    .select('*')
    .or(`id.eq.${authUser.id},email_id.ilike.${userEmail}`)
    .eq('active', true)
    .single();

  if (adminUser) {
    setUser({
      id: authUser.id,
      email: userEmail || '',
      role: adminUser.role || 'admin',
      firstName: adminUser.FirstName,
      lastName: adminUser.LastName
    });
    return;
  }

  // Fallback: Check if user is an artist (legacy without Supabase Auth)
  const { data: artistUser } = await supabase
    .from('ArtistMST')
    .select('*')
    .eq('emailid', userEmail)
    .eq('Active', true)
    .single();

  if (artistUser) {
    setUser({
      id: artistUser.uuid,
      email: userEmail || '',
      role: 'artist',
      firstName: artistUser.ArtistFirstName,
      lastName: artistUser.ArtistLastName
    });
    return;
  }

  console.log('No user profile found for:', userEmail);
};