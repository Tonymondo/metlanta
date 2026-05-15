import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToStorage } from '@/lib/storage'

const ALLOWED_BUCKETS = ['event-flyers', 'avatars', 'banners'] as const
type AllowedBucket = (typeof ALLOWED_BUCKETS)[number]

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const bucket = formData.get('bucket') as string | null
    const refId = formData.get('ref_id') as string | null

    if (!file || !bucket || !refId) {
      return NextResponse.json({ error: 'Missing required fields: file, bucket, ref_id' }, { status: 400 })
    }

    if (!(ALLOWED_BUCKETS as readonly string[]).includes(bucket)) {
      return NextResponse.json(
        { error: `Invalid bucket. Must be one of: ${ALLOWED_BUCKETS.join(', ')}` },
        { status: 400 }
      )
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File exceeds 5MB limit' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Build a deterministic path: bucket/userId/refId/filename
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${session.user.id}/${refId}/${Date.now()}.${ext}`

    const url = await uploadToStorage(bucket as AllowedBucket, path, buffer, file.type)

    return NextResponse.json({ url })
  } catch (err: unknown) {
    console.error('Upload error:', err)
    const message = err instanceof Error ? err.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
