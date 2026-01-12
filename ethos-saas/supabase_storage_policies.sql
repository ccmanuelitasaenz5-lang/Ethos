-- supabase_storage_policies.sql
-- Configuration for the 'documents' bucket in Supabase Storage
-- ------------------------------------------------------------

-- 1. Ensure the bucket exists (This part usually requires the Dashboard, 
-- but here are the policies for when it's created)

-- NOTE: You MUST create the bucket named 'documents' and set it to PUBLIC 
-- in the Supabase Dashboard before these policies will work.

-- 2. Clear existing policies for the 'documents' bucket to avoid conflicts
DO $$
BEGIN
    DELETE FROM storage.policies WHERE bucket_id = 'documents';
END $$;

-- 3. Create Storage Policies
-- ------------------------------------------------------------

-- A. Allow authenticated users to UPLOAD files (INSERT)
-- Each organization's files are stored in a folder named after their organization_id
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] IN (
        SELECT organization_id::text
        FROM public.users
        WHERE id = auth.uid()
    )
);

-- B. Allow users to VIEW their organization's files (SELECT)
CREATE POLICY "Allow users to view their organization files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] IN (
        SELECT organization_id::text
        FROM public.users
        WHERE id = auth.uid()
    )
);

-- C. Allow admins to DELETE files (DELETE)
CREATE POLICY "Allow admins to delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] IN (
        SELECT organization_id::text
        FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Fin del script
