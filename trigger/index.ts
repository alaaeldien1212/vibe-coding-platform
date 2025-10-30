/**
 * Trigger.dev Tasks
 * 
 * These tasks replace the Vercel Sandbox functionality with Trigger.dev workflows
 */

import { task } from "@trigger.dev/sdk/v3";
import { createSandbox, writeFilesToSandbox, readFilesFromSandbox, getSandbox } from './sandbox-manager';
import { executeCommand, waitForCommand, getCommandLogs, streamCommandLogs, getCommand } from './command-executor';

/**
 * Task: Create a new sandbox
 */
export const createSandboxTask = task({
  id: "create-sandbox",
  run: async (payload: { timeout?: number; ports?: number[] }) => {
    const sandbox = await createSandbox({
      timeout: payload.timeout,
      ports: payload.ports,
    });

    return {
      sandboxId: sandbox.sandboxId,
      workDir: sandbox.workDir,
      createdAt: sandbox.createdAt,
      timeout: sandbox.timeout,
      ports: sandbox.ports,
    };
  },
});

/**
 * Task: Write files to a sandbox
 */
export const writeFilesTask = task({
  id: "write-files",
  run: async (payload: {
    sandboxId: string;
    files: Array<{ path: string; content: string }>;
  }) => {
    await writeFilesToSandbox(payload.sandboxId, payload.files);
    return { success: true, filesWritten: payload.files.length };
  },
});

/**
 * Task: Read files from a sandbox
 */
export const readFilesTask = task({
  id: "read-files",
  run: async (payload: { sandboxId: string; paths: string[] }) => {
    const files = await readFilesFromSandbox(payload.sandboxId, payload.paths);
    return { files };
  },
});

/**
 * Task: Execute a command in a sandbox
 */
export const executeCommandTask = task({
  id: "execute-command",
  run: async (payload: {
    sandboxId: string;
    command: string;
    args?: string[];
    sudo?: boolean;
    wait?: boolean;
  }) => {
    const { cmdId, command } = await executeCommand({
      sandboxId: payload.sandboxId,
      command: payload.command,
      args: payload.args,
      sudo: payload.sudo,
    });

    if (payload.wait) {
      const result = await waitForCommand(cmdId);
      return {
        cmdId,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
        finished: true,
      };
    }

    return {
      cmdId,
      started: true,
      finished: false,
    };
  },
});

/**
 * Task: Get command status
 */
export const getCommandStatusTask = task({
  id: "get-command-status",
  run: async (payload: { cmdId: string }) => {
    const command = getCommand(payload.cmdId);
    if (!command) {
      throw new Error(`Command ${payload.cmdId} not found`);
    }

    return {
      cmdId: command.cmdId,
      finished: command.finished,
      exitCode: command.exitCode,
    };
  },
});

/**
 * Task: Get command logs
 */
export const getCommandLogsTask = task({
  id: "get-command-logs",
  run: async (payload: { cmdId: string }) => {
    const logs = getCommandLogs(payload.cmdId);
    return { logs };
  },
});

/**
 * Task: Wait for command to finish
 */
export const waitForCommandTask = task({
  id: "wait-for-command",
  run: async (payload: { cmdId: string }) => {
    const result = await waitForCommand(payload.cmdId);
    return result;
  },
});

