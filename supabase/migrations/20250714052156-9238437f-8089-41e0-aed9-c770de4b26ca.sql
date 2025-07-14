-- Modify UserMST table structure: rename uuid column to id and make it primary key

-- Step 1: Drop the existing primary key constraint on the id column
ALTER TABLE "UserMST" DROP CONSTRAINT "UserMST_pkey";

-- Step 2: Drop the old id column (int8 type)
ALTER TABLE "UserMST" DROP COLUMN id;

-- Step 3: Rename uuid column to id
ALTER TABLE "UserMST" RENAME COLUMN uuid TO id;

-- Step 4: Add primary key constraint to the new id column (which was uuid)
ALTER TABLE "UserMST" ADD CONSTRAINT "UserMST_pkey" PRIMARY KEY (id);