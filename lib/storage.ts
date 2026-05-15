import { getServiceClient } from '@/lib/supabase'

/**
 * Upload a file buffer to Supabase Storage and return the public URL.
 */
export async function uploadToStorage(
  bucket: string,
  path: string,
  file: Buffer,
  mimeType: string
): Promise<string> {
  const supabase = getServiceClient()

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: mimeType,
      upsert: true,
    })

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  if (!data?.publicUrl) {
    throw new Error('Failed to retrieve public URL after upload')
  }

  return data.publicUrl
}
