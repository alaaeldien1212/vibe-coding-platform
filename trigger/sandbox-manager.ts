/**
 * Sandbox Manager for Trigger.dev Integration
 * 
 * This module manages virtual "sandboxes" which are isolated working directories
 * for code execution. Each sandbox has its own filesystem space and can run commands.
 */

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';

export interface SandboxInfo {
  sandboxId: string;
  workDir: string;
  createdAt: number;
  timeout: number;
  ports: number[];
}

// In-memory storage for sandbox metadata
const sandboxes = new Map<string, SandboxInfo>();

// Base directory for all sandboxes
const SANDBOX_BASE_DIR = path.join(os.tmpdir(), 'vibe-sandboxes');

/**
 * Initialize the sandbox system
 */
export async function initializeSandboxSystem() {
  try {
    await fs.mkdir(SANDBOX_BASE_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to initialize sandbox system:', error);
  }
}

/**
 * Create a new sandbox
 */
export async function createSandbox(options: {
  timeout?: number;
  ports?: number[];
}): Promise<SandboxInfo> {
  const sandboxId = randomUUID();
  const workDir = path.join(SANDBOX_BASE_DIR, sandboxId);

  try {
    await fs.mkdir(workDir, { recursive: true });

    const sandbox: SandboxInfo = {
      sandboxId,
      workDir,
      createdAt: Date.now(),
      timeout: options.timeout || 600000, // 10 minutes default
      ports: options.ports || [],
    };

    sandboxes.set(sandboxId, sandbox);

    // Schedule cleanup after timeout
    setTimeout(() => {
      cleanupSandbox(sandboxId).catch(console.error);
    }, sandbox.timeout);

    return sandbox;
  } catch (error) {
    throw new Error(`Failed to create sandbox: ${error}`);
  }
}

/**
 * Get sandbox information
 */
export function getSandbox(sandboxId: string): SandboxInfo | undefined {
  return sandboxes.get(sandboxId);
}

/**
 * Write files to a sandbox
 */
export async function writeFilesToSandbox(
  sandboxId: string,
  files: Array<{ path: string; content: string }>
): Promise<void> {
  const sandbox = getSandbox(sandboxId);
  if (!sandbox) {
    throw new Error(`Sandbox ${sandboxId} not found`);
  }

  for (const file of files) {
    const fullPath = path.join(sandbox.workDir, file.path);
    const dir = path.dirname(fullPath);
    
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, file.content, 'utf-8');
  }
}

/**
 * Read files from a sandbox
 */
export async function readFilesFromSandbox(
  sandboxId: string,
  filePaths: string[]
): Promise<Array<{ path: string; content: string }>> {
  const sandbox = getSandbox(sandboxId);
  if (!sandbox) {
    throw new Error(`Sandbox ${sandboxId} not found`);
  }

  const results: Array<{ path: string; content: string }> = [];

  for (const filePath of filePaths) {
    const fullPath = path.join(sandbox.workDir, filePath);
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      results.push({ path: filePath, content });
    } catch (error) {
      console.error(`Failed to read file ${filePath}:`, error);
      results.push({ path: filePath, content: '' });
    }
  }

  return results;
}

/**
 * List files in a sandbox directory
 */
export async function listSandboxFiles(
  sandboxId: string,
  dirPath: string = ''
): Promise<string[]> {
  const sandbox = getSandbox(sandboxId);
  if (!sandbox) {
    throw new Error(`Sandbox ${sandboxId} not found`);
  }

  const fullPath = path.join(sandbox.workDir, dirPath);
  
  try {
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    return entries.map(entry => {
      const relativePath = path.join(dirPath, entry.name);
      return entry.isDirectory() ? `${relativePath}/` : relativePath;
    });
  } catch (error) {
    console.error(`Failed to list files in ${dirPath}:`, error);
    return [];
  }
}

/**
 * Clean up a sandbox and remove its files
 */
export async function cleanupSandbox(sandboxId: string): Promise<void> {
  const sandbox = getSandbox(sandboxId);
  if (!sandbox) {
    return;
  }

  try {
    await fs.rm(sandbox.workDir, { recursive: true, force: true });
    sandboxes.delete(sandboxId);
  } catch (error) {
    console.error(`Failed to cleanup sandbox ${sandboxId}:`, error);
  }
}

/**
 * Get all active sandboxes
 */
export function getActiveSandboxes(): SandboxInfo[] {
  return Array.from(sandboxes.values());
}

// Initialize on module load
initializeSandboxSystem().catch(console.error);

