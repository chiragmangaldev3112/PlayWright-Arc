/**
 * File System Helper Utilities
 * 
 * Provides comprehensive file system utilities for file operations,
 * path manipulation, and file-related test automation tasks.
 */

import { promises as fs, watch as fsWatch, FSWatcher } from 'fs';
import * as path from 'path';
import { logger } from '@utils/core/logger';

/**
 * File information interface
 */
export interface FileInfo {
  name: string;
  path: string;
  size: number;
  extension: string;
  mimeType?: string;
  createdAt: Date;
  modifiedAt: Date;
  isDirectory: boolean;
}

/**
 * Directory listing options
 */
export interface DirectoryOptions {
  recursive?: boolean;
  includeHidden?: boolean;
  extensions?: string[];
  maxDepth?: number;
}

/**
 * File Helper Class
 * Provides comprehensive file system utilities
 */
export class FileHelpers {
  private static instance: FileHelpers;

  private constructor() {}

  public static getInstance(): FileHelpers {
    if (!FileHelpers.instance) {
      FileHelpers.instance = new FileHelpers();
    }
    return FileHelpers.instance;
  }

  // =============================================================================
  // FILE OPERATIONS METHODS
  // =============================================================================

  /**
   * Check if file or directory exists
   * @param filePath - Path to check
   * @returns True if exists
   */
  public async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file information
   * @param filePath - Path to file
   * @returns File information
   */
  public async getFileInfo(filePath: string): Promise<FileInfo> {
    try {
      const stats = await fs.stat(filePath);
      const parsedPath = path.parse(filePath);
      
      return {
        name: parsedPath.base,
        path: filePath,
        size: stats.size,
        extension: parsedPath.ext,
        mimeType: this.getMimeType(parsedPath.ext),
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      logger.error('Failed to get file info', { filePath, error });
      throw error;
    }
  }

  /**
   * Read file content
   * @param filePath - Path to file
   * @param encoding - File encoding
   * @returns File content
   */
  public async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
    try {
      const content = await fs.readFile(filePath, encoding);
      logger.debug('File read successfully', { filePath, size: content.length });
      return content;
    } catch (error) {
      logger.error('Failed to read file', { filePath, error });
      throw error;
    }
  }

  /**
   * Write content to file
   * @param filePath - Path to file
   * @param content - Content to write
   * @param encoding - File encoding
   * @returns Promise<void>
   */
  public async writeFile(
    filePath: string, 
    content: string, 
    encoding: BufferEncoding = 'utf8'
  ): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await this.ensureDirectory(dir);
      
      await fs.writeFile(filePath, content, encoding);
      logger.info('File written successfully', { filePath, size: content.length });
    } catch (error) {
      logger.error('Failed to write file', { filePath, error });
      throw error;
    }
  }

  /**
   * Append content to file
   * @param filePath - Path to file
   * @param content - Content to append
   * @param encoding - File encoding
   * @returns Promise<void>
   */
  public async appendFile(
    filePath: string, 
    content: string, 
    encoding: BufferEncoding = 'utf8'
  ): Promise<void> {
    try {
      await fs.appendFile(filePath, content, encoding);
      logger.debug('Content appended to file', { filePath, size: content.length });
    } catch (error) {
      logger.error('Failed to append to file', { filePath, error });
      throw error;
    }
  }

  /**
   * Copy file
   * @param sourcePath - Source file path
   * @param destinationPath - Destination file path
   * @param overwrite - Whether to overwrite existing file
   * @returns Promise<void>
   */
  public async copyFile(
    sourcePath: string, 
    destinationPath: string, 
    overwrite: boolean = false
  ): Promise<void> {
    try {
      if (!overwrite && await this.exists(destinationPath)) {
        throw new Error(`Destination file already exists: ${destinationPath}`);
      }

      // Ensure destination directory exists
      const destDir = path.dirname(destinationPath);
      await this.ensureDirectory(destDir);

      await fs.copyFile(sourcePath, destinationPath);
      logger.info('File copied successfully', { sourcePath, destinationPath });
    } catch (error) {
      logger.error('Failed to copy file', { sourcePath, destinationPath, error });
      throw error;
    }
  }

  /**
   * Move/rename file
   * @param sourcePath - Source file path
   * @param destinationPath - Destination file path
   * @returns Promise<void>
   */
  public async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      // Ensure destination directory exists
      const destDir = path.dirname(destinationPath);
      await this.ensureDirectory(destDir);

      await fs.rename(sourcePath, destinationPath);
      logger.info('File moved successfully', { sourcePath, destinationPath });
    } catch (error) {
      logger.error('Failed to move file', { sourcePath, destinationPath, error });
      throw error;
    }
  }

  /**
   * Delete file
   * @param filePath - Path to file
   * @returns Promise<void>
   */
  public async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      logger.info('File deleted successfully', { filePath });
    } catch (error) {
      logger.error('Failed to delete file', { filePath, error });
      throw error;
    }
  }

  // =============================================================================
  // DIRECTORY OPERATIONS METHODS
  // =============================================================================

  /**
   * Create directory (recursive)
   * @param dirPath - Directory path
   * @returns Promise<void>
   */
  public async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      logger.debug('Directory ensured', { dirPath });
    } catch (error) {
      logger.error('Failed to create directory', { dirPath, error });
      throw error;
    }
  }

  /**
   * List directory contents
   * @param dirPath - Directory path
   * @param options - Directory listing options
   * @returns Array of file information
   */
  public async listDirectory(
    dirPath: string, 
    options: DirectoryOptions = {}
  ): Promise<FileInfo[]> {
    const {
      recursive = false,
      includeHidden = false,
      extensions = [],
      maxDepth = 10
    } = options;

    try {
      return await this.listDirectoryRecursive(
        dirPath, 
        recursive, 
        includeHidden, 
        extensions, 
        0, 
        maxDepth
      );
    } catch (error) {
      logger.error('Failed to list directory', { dirPath, error });
      throw error;
    }
  }

  /**
   * Recursive directory listing helper
   */
  private async listDirectoryRecursive(
    dirPath: string,
    recursive: boolean,
    includeHidden: boolean,
    extensions: string[],
    currentDepth: number,
    maxDepth: number
  ): Promise<FileInfo[]> {
    if (currentDepth >= maxDepth) {
      return [];
    }

    const items: FileInfo[] = [];
    const entries = await fs.readdir(dirPath);

    for (const entry of entries) {
      // Skip hidden files if not included
      if (!includeHidden && entry.startsWith('.')) {
        continue;
      }

      const fullPath = path.join(dirPath, entry);
      const fileInfo = await this.getFileInfo(fullPath);

      // Filter by extensions if specified
      if (extensions.length > 0 && !fileInfo.isDirectory) {
        const ext = fileInfo.extension.toLowerCase();
        if (!extensions.includes(ext)) {
          continue;
        }
      }

      items.push(fileInfo);

      // Recurse into subdirectories if requested
      if (recursive && fileInfo.isDirectory) {
        const subItems = await this.listDirectoryRecursive(
          fullPath,
          recursive,
          includeHidden,
          extensions,
          currentDepth + 1,
          maxDepth
        );
        items.push(...subItems);
      }
    }

    return items;
  }

  /**
   * Delete directory and all contents
   * @param dirPath - Directory path
   * @returns Promise<void>
   */
  public async deleteDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
      logger.info('Directory deleted successfully', { dirPath });
    } catch (error) {
      logger.error('Failed to delete directory', { dirPath, error });
      throw error;
    }
  }

  /**
   * Copy directory recursively
   * @param sourcePath - Source directory path
   * @param destinationPath - Destination directory path
   * @returns Promise<void>
   */
  public async copyDirectory(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      await this.ensureDirectory(destinationPath);
      
      const items = await this.listDirectory(sourcePath, { recursive: true });
      
      for (const item of items) {
        const relativePath = path.relative(sourcePath, item.path);
        const destPath = path.join(destinationPath, relativePath);
        
        if (item.isDirectory) {
          await this.ensureDirectory(destPath);
        } else {
          await this.copyFile(item.path, destPath, true);
        }
      }
      
      logger.info('Directory copied successfully', { sourcePath, destinationPath });
    } catch (error) {
      logger.error('Failed to copy directory', { sourcePath, destinationPath, error });
      throw error;
    }
  }

  // =============================================================================
  // PATH MANIPULATION METHODS
  // =============================================================================

  /**
   * Join path segments
   * @param segments - Path segments
   * @returns Joined path
   */
  public joinPath(...segments: string[]): string {
    return path.join(...segments);
  }

  /**
   * Resolve absolute path
   * @param pathSegments - Path segments
   * @returns Absolute path
   */
  public resolvePath(...pathSegments: string[]): string {
    return path.resolve(...pathSegments);
  }

  /**
   * Get relative path between two paths
   * @param from - From path
   * @param to - To path
   * @returns Relative path
   */
  public getRelativePath(from: string, to: string): string {
    return path.relative(from, to);
  }

  /**
   * Parse path into components
   * @param filePath - File path
   * @returns Path components
   */
  public parsePath(filePath: string): path.ParsedPath {
    return path.parse(filePath);
  }

  /**
   * Get file extension
   * @param filePath - File path
   * @returns File extension (with dot)
   */
  public getExtension(filePath: string): string {
    return path.extname(filePath);
  }

  /**
   * Get filename without extension
   * @param filePath - File path
   * @returns Filename without extension
   */
  public getBasename(filePath: string): string {
    return path.basename(filePath, path.extname(filePath));
  }

  /**
   * Get directory name
   * @param filePath - File path
   * @returns Directory name
   */
  public getDirname(filePath: string): string {
    return path.dirname(filePath);
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get MIME type from file extension
   * @param extension - File extension
   * @returns MIME type
   */
  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Generate unique filename
   * @param baseName - Base filename
   * @param extension - File extension
   * @param directory - Target directory
   * @returns Unique filename
   */
  public async generateUniqueFilename(
    baseName: string, 
    extension: string, 
    directory: string
  ): Promise<string> {
    let counter = 0;
    let filename = `${baseName}${extension}`;
    let fullPath = path.join(directory, filename);

    while (await this.exists(fullPath)) {
      counter++;
      filename = `${baseName}_${counter}${extension}`;
      fullPath = path.join(directory, filename);
    }

    return filename;
  }

  /**
   * Get file size in human readable format
   * @param filePath - File path
   * @returns Human readable file size
   */
  public async getHumanReadableSize(filePath: string): Promise<string> {
    const fileInfo = await this.getFileInfo(filePath);
    return this.formatFileSize(fileInfo.size);
  }

  /**
   * Format file size in human readable format
   * @param bytes - Size in bytes
   * @returns Formatted size string
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Clean filename (remove invalid characters)
   * @param filename - Original filename
   * @returns Clean filename
   */
  public cleanFilename(filename: string): string {
    // Remove or replace invalid characters
    return filename
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Watch file for changes
   * @param filePath - File to watch
   * @param callback - Callback function
   * @returns Watcher object with close method
   */
  public watchFile(
    filePath: string, 
    callback: (eventType: string, filename: string | null) => void
  ): { close: () => void } {
    try {
      const watcher: FSWatcher = fsWatch(filePath, (eventType: string, filename: string | null) => {
        callback(eventType, filename);
      });
      
      watcher.on('error', (error: Error) => {
        logger.error('File watcher error', { filePath, error });
      });
      
      logger.info('File watcher started', { filePath });
      
      return {
        close: () => {
          watcher.close();
          logger.info('File watcher stopped', { filePath });
        }
      };
    } catch (error) {
      logger.error('Failed to watch file', { filePath, error });
      throw error;
    }
  }
}

// Export singleton instance
export const fileHelpers = FileHelpers.getInstance();
