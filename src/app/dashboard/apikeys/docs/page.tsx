'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Shield, Database, Zap, Webhook } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  alert('Copied to clipboard!');
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative group">
      <pre className="p-4 bg-surface-hover rounded-lg font-mono text-xs leading-relaxed overflow-x-auto border border-primary/10 whitespace-pre-wrap break-all">
        {code}
      </pre>
      <button
        onClick={() => copyToClipboard(code)}
        className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface border border-border rounded-md shadow-sm hover:bg-surface-hover"
      >
        <Copy size={14} />
      </button>
    </div>
  );
}

interface EndpointRow {
  method: string;
  path: string;
  description: string;
}

function EndpointTable({ rows }: { rows: EndpointRow[] }) {
  const methodColor: Record<string, string> = {
    GET: 'text-success',
    POST: 'text-primary',
    PATCH: 'text-warning',
    DELETE: 'text-error',
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.method}-${row.path}`} className="border-b border-border last:border-0">
              <td className="py-3 pr-4 align-top whitespace-nowrap">
                <code className={`text-xs font-bold ${methodColor[row.method] || 'text-foreground'}`}>
                  {row.method}
                </code>
              </td>
              <td className="py-3 pr-4 align-top whitespace-nowrap">
                <code className="text-xs px-2 py-1 bg-surface-hover rounded font-mono">{row.path}</code>
              </td>
              <td className="py-3 align-top text-foreground/70">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ApiKeyDocsPage() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-4xl">
      <div>
        <Link href="/dashboard/apikeys">
          <Button variant="ghost" leftIcon={<ArrowLeft size={16} />} className="mb-4 -ml-2">
            Back to API Keys
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight m-0">API Key Documentation</h1>
        <p className="text-foreground/70 m-0 mt-1">
          Everything an API key can do, and how to use it.
        </p>
      </div>

      <Card className="border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            Authentication
          </CardTitle>
          <CardDescription>
            Every key is scoped to the single workspace it was created in — it can never read or
            write another workspace&apos;s data, even if the workspace ID is guessed correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm text-foreground/70">
          <p>Send your key in either of these header formats:</p>
          <CodeBlock code={`Authorization: Bearer YOUR_API_KEY\n\n# or\n\nX-API-Key: YOUR_API_KEY`} />
          <p>
            A key created for a workspace grants that same level of access no matter who created
            it — treat it like a password. Revoked keys stop working immediately.
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} className="text-primary" />
            Read data
          </CardTitle>
          <CardDescription>Pull information about your workspace on demand.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <EndpointTable
            rows={[
              { method: 'GET', path: '/apikeys/stats', description: 'Workspace summary: member count, invite counts, notification count, file count, API key count, job count, and the 5 most recent audit log entries.' },
              { method: 'GET', path: '/workspaces/me', description: 'This workspace’s own metadata — name, slug, plan, owner, timestamps.' },
              { method: 'GET', path: '/audit/:workspaceId/activity', description: 'The full audit log — every tracked action (invites, member changes, file uploads/deletes, key and webhook changes), including who did it.' },
              { method: 'GET', path: '/uploads/workspace/:workspaceId', description: 'List every file uploaded to the workspace, with name, size, uploader, and URL.' },
              { method: 'GET', path: '/webhooks/workspace/:workspaceId', description: 'List registered webhooks (URL and active status — not the signing secret, which is only ever shown once, at creation).' },
            ]}
          />
          <CodeBlock
            code={`curl -X GET "${API_BASE}/workspaces/me" \\\n  -H "Authorization: Bearer YOUR_API_KEY"`}
          />
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap size={20} className="text-primary" />
            Take actions
          </CardTitle>
          <CardDescription>Upload files and manage webhooks programmatically.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <EndpointTable
            rows={[
              { method: 'POST', path: '/uploads/presign', description: 'Get a signed S3 URL to upload a file directly. Body: { workspaceId, fileName, mimeType }.' },
              { method: 'POST', path: '/uploads/complete', description: 'Register the uploaded file after a successful upload to the presigned URL. Body: { workspaceId, fileName, fileUrl, size, mimeType }.' },
              { method: 'DELETE', path: '/uploads/:fileId', description: 'Delete a file from the workspace and from storage.' },
              { method: 'POST', path: '/webhooks', description: 'Register a new webhook URL. Body: { workspaceId, url }. Returns the signing secret once — save it.' },
              { method: 'PATCH', path: '/webhooks/:id', description: 'Enable or disable a webhook. Body: { workspaceId, active }.' },
              { method: 'DELETE', path: '/webhooks/:id', description: 'Remove a webhook. Body: { workspaceId }.' },
            ]}
          />
          <CodeBlock
            code={`# 1. Get a presigned upload URL\ncurl -X POST "${API_BASE}/uploads/presign" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"workspaceId":"YOUR_WORKSPACE_ID","fileName":"report.pdf","mimeType":"application/pdf"}'\n\n# 2. PUT your file to the returned uploadUrl, then:\ncurl -X POST "${API_BASE}/uploads/complete" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"workspaceId":"YOUR_WORKSPACE_ID","fileName":"report.pdf","fileUrl":"<fileUrl from step 1>","size":123456,"mimeType":"application/pdf"}'`}
          />
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook size={20} className="text-primary" />
            Webhooks
          </CardTitle>
          <CardDescription>
            Get notified the moment something happens in your workspace, instead of polling.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 text-sm text-foreground/70">
          <p>
            Once registered, your URL receives a signed <code>POST</code> request for every event
            below that occurs in this workspace:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              'WORKSPACE_CREATED', 'WORKSPACE_JOINED',
              'MEMBER_REMOVED',
              'INVITE_CREATED', 'INVITE_ACCEPTED',
              'FILE_UPLOADED', 'FILE_DELETED',
              'API_KEY_CREATED', 'API_KEY_REVOKED',
            ].map((event) => (
              <code key={event} className="text-xs px-2 py-1 bg-surface-hover rounded font-mono">
                {event}
              </code>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Request body</h4>
            <CodeBlock
              code={`{\n  "event": "FILE_UPLOADED",\n  "data": { "workspaceId": "...", "userId": "...", "fileId": "...", "fileName": "report.pdf", "size": 123456 },\n  "timestamp": 1787247745812\n}`}
            />
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Verifying the signature</h4>
            <p>
              Every request includes an <code>X-LaunchFlow-Signature</code> header: an HMAC-SHA256
              hex digest of the exact request body, signed with the secret shown when you created
              the webhook.
            </p>
            <CodeBlock
              code={`// Node.js\nconst crypto = require("crypto");\n\nfunction isValid(rawBody, signatureHeader, secret) {\n  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");\n  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));\n}`}
            />
          </div>

          <p className="text-xs text-foreground/50">
            Deliveries retry up to 3 times with exponential backoff if your endpoint doesn&apos;t
            respond with a 2xx status, then are dropped. There&apos;s currently no way to filter
            which events a webhook receives &mdash; it gets everything listed above.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Not available via API key</CardTitle>
          <CardDescription>These still require a logged-in session, not a key.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-foreground/70">
          Inviting or removing members, billing/subscription changes, notifications, analytics, and
          user profile/device management are session-only right now.
        </CardContent>
      </Card>
    </div>
  );
}
