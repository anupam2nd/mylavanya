-- Update RLS policies to use id instead of uuid for MemberMST

-- Drop existing policies that reference uuid
DROP POLICY IF EXISTS "Members can read own bookings via MemberMST" ON "BookMST";
DROP POLICY IF EXISTS "Members can create bookings via MemberMST" ON "BookMST";

-- Create new policies using id instead of uuid
CREATE POLICY "Members can read own bookings via MemberMST" 
ON "BookMST"
FOR SELECT 
USING (EXISTS ( 
  SELECT 1
  FROM "MemberMST"
  WHERE (("MemberMST".id = auth.uid()) AND (("MemberMST"."MemberEmailId" = "BookMST".email) OR ("MemberMST"."MemberPhNo" = ("BookMST"."Phone_no")::text)))
));

CREATE POLICY "Members can create bookings via MemberMST" 
ON "BookMST"
FOR INSERT 
WITH CHECK (EXISTS ( 
  SELECT 1
  FROM "MemberMST"
  WHERE ("MemberMST".id = auth.uid())
));