'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { File as FileIcon, Upload, Trash2, Download, Search, FileText, ImageIcon, Music, Video, MoreVertical, Loader2, Filter, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { formatDate } from '@/lib/date-utils';

interface FileUpload {
  id: string;
  fileName: string;
  fileUrl: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

type FileFilter = 'all' | 'image' | 'video' | 'audio' | 'document' | 'other';

export default function FilesPage() {
  const { activeWorkspace } = useWorkspace();
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FileFilter>('all');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: FileUpload[] }>(`/uploads/workspace/${activeWorkspace.id}`);
      if (response.success) {
        setFiles(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [activeWorkspace]);

  // Filtering Logic
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesFilter = true;
      if (activeFilter === 'image') matchesFilter = file.mimeType.startsWith('image/');
      else if (activeFilter === 'video') matchesFilter = file.mimeType.startsWith('video/');
      else if (activeFilter === 'audio') matchesFilter = file.mimeType.startsWith('audio/');
      else if (activeFilter === 'document') matchesFilter = file.mimeType.includes('pdf') || file.mimeType.includes('word') || file.mimeType.includes('text') || file.mimeType.includes('spreadsheet');
      else if (activeFilter === 'other') matchesFilter = !file.mimeType.startsWith('image/') && !file.mimeType.startsWith('video/') && !file.mimeType.startsWith('audio/') && !matchesFilter;

      return matchesSearch && matchesFilter;
    });
  }, [files, searchQuery, activeFilter]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeWorkspace) return;

    setIsUploading(true);
    setUploadProgress(10);
    try {
      const presignRes = await api.post<{ success: boolean; data: { uploadUrl: string; fileUrl: string; key: string } }>('/uploads/presign', {
        fileName: file.name,
        mimeType: file.type
      });

      if (!presignRes.success) throw new Error('Failed to get upload URL');
      setUploadProgress(30);

      const uploadRes = await fetch(presignRes.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadRes.ok) throw new Error('S3 Upload failed');
      setUploadProgress(70);

      const completeRes = await api.post<{ success: boolean; data: FileUpload }>('/uploads/complete', {
        workspaceId: activeWorkspace.id,
        fileName: file.name,
        fileUrl: presignRes.data.fileUrl,
        size: file.size,
        mimeType: file.type
      });

      if (completeRes.success) {
        setFiles([completeRes.data, ...files]);
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Check console for details.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Permanently delete this asset?')) return;
    
    setIsDeleting(fileId);
    try {
      const response = await api.delete<{ success: boolean }>(`/uploads/${fileId}`);
      if (response.success) {
        setFiles(files.filter(f => f.id !== fileId));
      }
    } catch (err) {
      console.error('Failed to delete file:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith('image/')) return <ImageIcon size={20} className="text-blue-500" />;
    if (mime.startsWith('video/')) return <Video size={20} className="text-purple-500" />;
    if (mime.startsWith('audio/')) return <Music size={20} className="text-pink-500" />;
    if (mime.includes('pdf') || mime.includes('word') || mime.includes('text')) return <FileText size={20} className="text-orange-500" />;
    return <FileIcon size={20} className="text-foreground/50" />;
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight m-0">Asset Library</h1>
          <p className="text-foreground/70 m-0">Store and organize your workspace files</p>
        </div>
        <div className="flex items-center gap-3">
          <Input 
            className="hidden" 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload}
          />
          <Button 
            leftIcon={isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !activeWorkspace}
          >
            {isUploading ? 'Uploading...' : 'Upload New Asset'}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-full md:w-96">
          <Input
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={18} />}
            rightIcon={searchQuery ? (
              <button onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            ) : undefined}
            fullWidth
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          {(['all', 'image', 'document', 'video', 'audio', 'other'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-[0.1em] transition-all border-2 ${
                activeFilter === filter 
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30' 
                  : 'bg-surface/50 text-foreground/50 border-border/40 hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {isUploading && (
        <Card className="border-primary bg-primary-light/10 overflow-hidden relative">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-primary" />
                Uploading to S3...
              </span>
              <span className="text-primary font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden border-none shadow-2xl bg-surface/40 backdrop-blur-md">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <Loader2 size={40} className="animate-spin text-primary/30" />
              <p className="text-foreground/40 font-bold tracking-widest uppercase text-xs">Synchronizing Assets</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="p-24 text-center flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-surface-hover flex items-center justify-center text-foreground/5">
                {searchQuery || activeFilter !== 'all' ? <Filter size={40} /> : <FileIcon size={40} />}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold m-0 text-foreground/80">
                  {searchQuery || activeFilter !== 'all' ? 'No matches found' : 'Empty Library'}
                </h3>
                <p className="text-foreground/50 m-0 max-w-sm">
                  {searchQuery || activeFilter !== 'all' 
                    ? `We couldn't find any assets matching your current search or filters.` 
                    : 'Start uploading assets to see them organized in your workspace library.'}
                </p>
              </div>
              {(searchQuery || activeFilter !== 'all') && (
                <Button variant="outline" onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}>
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-hover/30">
                  <th className="p-4 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 border-b border-border">Filename</th>
                  <th className="p-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 border-b border-border">Size</th>
                  <th className="p-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 border-b border-border text-center">Type</th>
                  <th className="p-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 border-b border-border">Uploaded</th>
                  <th className="p-4 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 border-b border-border text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map(file => (
                  <tr key={file.id} className="border-b border-border/40 last:border-0 hover:bg-primary-light/5 transition-all group">
                    <td className="p-4 px-8 align-middle">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-surface-hover group-hover:bg-surface shadow-sm transition-colors">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <span className="font-bold text-foreground truncate max-w-[280px] group-hover:text-primary transition-colors" title={file.fileName}>
                          {file.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 px-6 align-middle">
                      <span className="text-xs font-bold text-foreground/50">
                        {formatSize(file.size)}
                      </span>
                    </td>
                    <td className="p-4 px-6 align-middle text-center">
                      <span className="inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-surface-hover text-foreground/40 border border-border/40">
                        {file.mimeType.split('/')[1] || 'FILE'}
                      </span>
                    </td>
                    <td className="p-4 px-6 align-middle">
                      <span className="text-xs font-medium text-foreground/30 font-mono">
                        {formatDate(file.createdAt)}
                      </span>
                    </td>
                    <td className="p-4 px-8 align-middle">
                      <div className="flex items-center justify-end gap-3 md:opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <a 
                          href={file.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-foreground/40 hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-primary/30"
                          title="Download"
                        >
                          <Download size={18} />
                        </a>
                        <button 
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                            isDeleting === file.id 
                              ? 'bg-error/10 text-error animate-pulse' 
                              : 'text-foreground/40 hover:bg-error hover:text-white hover:shadow-error/30'
                          }`}
                          onClick={() => deleteFile(file.id)}
                          disabled={isDeleting === file.id}
                          title="Delete"
                        >
                          {isDeleting === file.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
