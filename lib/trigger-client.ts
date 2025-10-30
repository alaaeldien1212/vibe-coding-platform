/**
 * Trigger.dev Client Wrapper
 * 
 * This module provides a simplified interface to interact with Trigger.dev tasks
 * while maintaining API compatibility with the original Vercel sandbox interface
 */

import { 
  createSandbox as createSandboxLocal,
  writeFilesToSandbox,
  readFilesFromSandbox,
  getSandbox,
  type SandboxInfo,
} from '../trigger/sandbox-manager';

import {
  executeCommand as executeCommandLocal,
  waitForCommand,
  getCommandLogs,
  streamCommandLogs,
  getCommand,
  type CommandInfo,
  type LogLine,
} from '../trigger/command-executor';

/**
 * Sandbox class to maintain API compatibility with Vercel Sandbox
 */
export class TriggerSandbox {
  sandboxId: string;
  private sandboxInfo: SandboxInfo;

  constructor(sandboxInfo: SandboxInfo) {
    this.sandboxId = sandboxInfo.sandboxId;
    this.sandboxInfo = sandboxInfo;
  }

  /**
   * Create a new sandbox
   */
  static async create(options: {
    timeout?: number;
    ports?: number[];
  }): Promise<TriggerSandbox> {
    const sandboxInfo = await createSandboxLocal(options);
    return new TriggerSandbox(sandboxInfo);
  }

  /**
   * Get an existing sandbox by ID
   */
  static async get(params: { sandboxId: string }): Promise<TriggerSandbox> {
    const sandboxInfo = getSandbox(params.sandboxId);
    if (!sandboxInfo) {
      throw new Error(`Sandbox ${params.sandboxId} not found`);
    }
    return new TriggerSandbox(sandboxInfo);
  }

  /**
   * Write files to the sandbox
   */
  async writeFiles(files: Array<{ path: string; content: string }>): Promise<void> {
    await writeFilesToSandbox(this.sandboxId, files);
  }

  /**
   * Read files from the sandbox
   */
  async readFiles(paths: string[]): Promise<Array<{ path: string; content: string }>> {
    return await readFilesFromSandbox(this.sandboxId, paths);
  }

  /**
   * Run a command in the sandbox
   */
  async runCommand(options: {
    cmd: string;
    args?: string[];
    sudo?: boolean;
    detached?: boolean;
  }): Promise<TriggerCommand> {
    const { cmdId, command } = await executeCommandLocal({
      sandboxId: this.sandboxId,
      command: options.cmd,
      args: options.args,
      sudo: options.sudo,
    });

    return new TriggerCommand(cmdId, command);
  }

  /**
   * Get a command by ID
   */
  async getCommand(cmdId: string): Promise<TriggerCommand> {
    const command = getCommand(cmdId);
    if (!command) {
      throw new Error(`Command ${cmdId} not found`);
    }
    return new TriggerCommand(cmdId, command);
  }

  /**
   * Get the URL for a specific port (simulated for local execution)
   */
  domain(port: number): string {
    // For local development, return localhost URL
    // In production, this would be replaced with actual deployed URLs
    return `http://localhost:${port}`;
  }
}

/**
 * Command class to maintain API compatibility with Vercel Sandbox Command
 */
export class TriggerCommand {
  cmdId: string;
  startedAt: number;
  private commandInfo: CommandInfo;

  constructor(cmdId: string, commandInfo: CommandInfo) {
    this.cmdId = cmdId;
    this.startedAt = commandInfo.startedAt;
    this.commandInfo = commandInfo;
  }

  /**
   * Wait for the command to finish
   */
  async wait(): Promise<{
    exitCode: number;
    stdout: () => Promise<string>;
    stderr: () => Promise<string>;
  }> {
    const result = await waitForCommand(this.cmdId);
    return {
      exitCode: result.exitCode,
      stdout: async () => result.stdout,
      stderr: async () => result.stderr,
    };
  }

  /**
   * Get command logs as an async iterator
   */
  async *logs(): AsyncGenerator<LogLine> {
    yield* streamCommandLogs(this.cmdId);
  }

  /**
   * Get all logs at once
   */
  getLogs(): LogLine[] {
    return getCommandLogs(this.cmdId);
  }

  /**
   * Check if command is finished
   */
  isFinished(): boolean {
    const cmd = getCommand(this.cmdId);
    return cmd ? cmd.finished : true;
  }

  /**
   * Get exit code (if finished)
   */
  getExitCode(): number | undefined {
    const cmd = getCommand(this.cmdId);
    return cmd?.exitCode;
  }
}

// Export for compatibility
export const Sandbox = TriggerSandbox;
export const Command = TriggerCommand;

// Export types
export type Sandbox = TriggerSandbox;
export type Command = TriggerCommand;

