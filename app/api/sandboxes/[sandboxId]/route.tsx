import { NextRequest, NextResponse } from 'next/server'
import { Sandbox } from '@/lib/trigger-client'

/**
 * Check if a sandbox is running by attempting to execute a command
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sandboxId: string }> }
) {
  const { sandboxId } = await params
  try {
    const sandbox = await Sandbox.get({ sandboxId })
    await sandbox.runCommand({
      cmd: 'echo',
      args: ['Sandbox status check'],
    })
    return NextResponse.json({ status: 'running' })
  } catch (error) {
    // If sandbox not found or command fails, consider it stopped
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ status: 'stopped' })
    } else {
      throw error
    }
  }
}
