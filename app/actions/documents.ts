'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function uploadDocument(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No autenticado' }
    }

    // Get user's organization
    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!userData?.organization_id) {
        return { error: 'Usuario no asociado a una organización' }
    }

    const file = formData.get('file') as File
    if (!file) {
        return { error: 'No se seleccionó ningún archivo' }
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        return { error: 'El archivo no puede superar 10MB' }
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userData.organization_id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

    if (uploadError) {
        return { error: `Error al subir archivo: ${uploadError.message}` }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

    // Save document metadata to database
    const { error: dbError } = await supabase
        .from('documents')
        .insert({
            organization_id: userData.organization_id,
            title: formData.get('title') as string,
            description: formData.get('description') as string || null,
            file_url: publicUrl,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: user.id,
        })

    if (dbError) {
        // If database insert fails, delete the uploaded file
        await supabase.storage.from('documents').remove([fileName])
        return { error: `Error al guardar documento: ${dbError.message}` }
    }

    revalidatePath('/dashboard/expediente')
    return { success: true }
}

export async function deleteDocument(id: string, fileUrl: string) {
    const supabase = await createClient()

    // Extract filename from URL
    const fileName = fileUrl.split('/').slice(-2).join('/')

    // Delete from storage
    const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([fileName])

    if (storageError) {
        console.error('Error deleting from storage:', storageError)
    }

    // Delete from database
    const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

    if (dbError) {
        return { error: dbError.message }
    }

    revalidatePath('/dashboard/expediente')
    return { success: true }
}
