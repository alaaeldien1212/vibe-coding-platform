import { NextResponse, type NextRequest } from 'next/server'
import { Sandbox } from '@/lib/trigger-client'
import z from 'zod/v3'

const FileParamsSchema = z.object({
  sandboxId: z.string(),
  path: z.string(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sandboxId: string }> }
) {
  const { sandboxId } = await params
  const fileParams = FileParamsSchema.safeParse({
    path: request.nextUrl.searchParams.get('path'),
    sandboxId,
  })

  if (fileParams.success === false) {
    return NextResponse.json(
      { error: 'Invalid parameters. You must pass a `path` as query' },
      { status: 400 }
    )
  }

  try {
    const sandbox = await Sandbox.get(fileParams.data)
    const files = await sandbox.readFiles([fileParams.data.path])
    
    if (!files || files.length === 0 || !files[0].content) {
      return NextResponse.json(
        { error: 'File not found in the Sandbox' },
        { status: 404 }
      )
    }

    // Return file content as a stream
    const encoder = new TextEncoder()
    return new NextResponse(
      new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(files[0].content))
          controller.close()
        },
      })
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read file from sandbox' },
      { status: 500 }
    )
  }
}
