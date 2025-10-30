/**
 * Command Executor for Trigger.dev Integration
 * 
 * This module handles command execution within sandboxes with real-time output streaming
 */

import { spawn, execSync, type ChildProcess } from 'child_process';
import { randomUUID } from 'crypto';
import { getSandbox } from './sandbox-manager';
import type { Readable } from 'stream';

/**
 * Check if a command exists in the system
 */
function commandExists(command: string): boolean {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export interface CommandInfo {
  cmdId: string;
  sandboxId: string;
  command: string;
  args: string[];
  startTime: number;
  startedAt: number;
  exitCode?: number;
  finished: boolean;
}

export interface LogLine {
  data: string;
  stream: 'stdout' | 'stderr';
  timestamp: number;
}

// Store active commands and their outputs
const commands = new Map<string, CommandInfo>();
const commandProcesses = new Map<string, ChildProcess>();
const commandLogs = new Map<string, LogLine[]>();

/**
 * Execute a command in a sandbox
 */
export async function executeCommand(options: {
  sandboxId: string;
  command: string;
  args?: string[];
  sudo?: boolean;
}): Promise<{ cmdId: string; command: CommandInfo }> {
  const sandbox = getSandbox(options.sandboxId);
  if (!sandbox) {
    throw new Error(`Sandbox ${options.sandboxId} not found`);
  }

  const cmdId = randomUUID();
  const now = Date.now();
  const commandInfo: CommandInfo = {
    cmdId,
    sandboxId: options.sandboxId,
    command: options.command,
    args: options.args || [],
    startTime: now,
    startedAt: now,
    finished: false,
  };

  commands.set(cmdId, commandInfo);
  commandLogs.set(cmdId, []);

  // Map pnpm to npm if pnpm is not available (for local sandboxes)
  let actualCommand = options.command;
  let actualArgs = [...commandInfo.args];
  
  // Check if command is pnpm and it's not available, fall back to npm
  if (options.command === 'pnpm' && !commandExists('pnpm')) {
    actualCommand = 'npm';
    console.log('[Sandbox] pnpm not found, using npm instead');
  }
  
  const finalCommand = options.sudo ? 'sudo' : actualCommand;
  const finalArgs = options.sudo 
    ? [actualCommand, ...actualArgs]
    : actualArgs;

  const childProcess = spawn(finalCommand, finalArgs, {
    cwd: sandbox.workDir,
    env: {
      ...process.env,
      HOME: sandbox.workDir,
      PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
    },
    shell: true,
  });

  commandProcesses.set(cmdId, childProcess);

  // Capture stdout
  childProcess.stdout?.on('data', (data: Buffer) => {
    const logs = commandLogs.get(cmdId) || [];
    logs.push({
      data: data.toString(),
      stream: 'stdout',
      timestamp: Date.now(),
    });
    commandLogs.set(cmdId, logs);
  });

  // Capture stderr
  childProcess.stderr?.on('data', (data: Buffer) => {
    const logs = commandLogs.get(cmdId) || [];
    logs.push({
      data: data.toString(),
      stream: 'stderr',
      timestamp: Date.now(),
    });
    commandLogs.set(cmdId, logs);
  });

  // Handle process completion
  childProcess.on('close', (code) => {
    commandInfo.exitCode = code || 0;
    commandInfo.finished = true;
    commands.set(cmdId, commandInfo);
    
    // Cleanup after 5 minutes
    setTimeout(() => {
      commandProcesses.delete(cmdId);
      commandLogs.delete(cmdId);
      commands.delete(cmdId);
    }, 300000);
  });

  childProcess.on('error', (error) => {
    const logs = commandLogs.get(cmdId) || [];
    logs.push({
      data: `Error: ${error.message}\n`,
      stream: 'stderr',
      timestamp: Date.now(),
    });
    commandLogs.set(cmdId, logs);
    
    commandInfo.exitCode = 1;
    commandInfo.finished = true;
    commands.set(cmdId, commandInfo);
  });

  return { cmdId, command: commandInfo };
}

/**
 * Get command information
 */
export function getCommand(cmdId: string): CommandInfo | undefined {
  return commands.get(cmdId);
}

/**
 * Get command logs
 */
export function getCommandLogs(cmdId: string): LogLine[] {
  return commandLogs.get(cmdId) || [];
}

/**
 * Get command logs as a readable stream (for async iteration)
 */
export async function* streamCommandLogs(cmdId: string): AsyncGenerator<LogLine> {
  const command = getCommand(cmdId);
  if (!command) {
    throw new Error(`Command ${cmdId} not found`);
  }

  const logs = commandLogs.get(cmdId) || [];
  let lastIndex = 0;

  // First, yield all existing logs
  for (const log of logs) {
    yield log;
    lastIndex++;
  }

  // Then, poll for new logs until command is finished
  while (!command.finished) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const currentLogs = commandLogs.get(cmdId) || [];
    for (let i = lastIndex; i < currentLogs.length; i++) {
      yield currentLogs[i];
    }
    lastIndex = currentLogs.length;

    // Re-check command status
    const updatedCommand = getCommand(cmdId);
    if (updatedCommand && updatedCommand.finished) {
      break;
    }
  }

  // Yield any final logs
  const finalLogs = commandLogs.get(cmdId) || [];
  for (let i = lastIndex; i < finalLogs.length; i++) {
    yield finalLogs[i];
  }
}

/**
 * Wait for a command to finish
 */
export async function waitForCommand(
  cmdId: string
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const command = getCommand(cmdId);
  if (!command) {
    throw new Error(`Command ${cmdId} not found`);
  }

  // Poll until command is finished
  while (!command.finished) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const updatedCommand = getCommand(cmdId);
    if (updatedCommand && updatedCommand.finished) {
      break;
    }
  }

  const logs = commandLogs.get(cmdId) || [];
  const stdout = logs
    .filter(log => log.stream === 'stdout')
    .map(log => log.data)
    .join('');
  const stderr = logs
    .filter(log => log.stream === 'stderr')
    .map(log => log.data)
    .join('');

  return {
    exitCode: command.exitCode || 0,
    stdout,
    stderr,
  };
}

/**
 * Kill a running command
 */
export function killCommand(cmdId: string): boolean {
  const process = commandProcesses.get(cmdId);
  if (process && !process.killed) {
    process.kill();
    return true;
  }
  return false;
}

