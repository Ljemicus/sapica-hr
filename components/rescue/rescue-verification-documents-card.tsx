'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  RESCUE_VERIFICATION_DOCUMENT_REVIEW_STATUS_LABELS,
  RESCUE_VERIFICATION_DOCUMENT_TYPE_LABELS,
  type RescueVerificationDocument,
  type RescueVerificationDocumentType,
} from '@/lib/types';

interface Props {
  organizationId?: string;
  documents: RescueVerificationDocument[];
}

export function RescueVerificationDocumentsCard({ organizationId, documents }: Props) {
  const router = useRouter();
  const [documentType, setDocumentType] = useState<RescueVerificationDocumentType>('registration_certificate');
  const [documentNotes, setDocumentNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [openingDocumentId, setOpeningDocumentId] = useState<string | null>(null);

  const sortedDocuments = useMemo(
    () => [...documents].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [documents]
  );

  const uploadDocument = async () => {
    if (!organizationId) {
      toast.error('Prvo spremi organizaciju.');
      return;
    }

    if (!file) {
      toast.error('Dodaj dokument prije uploada.');
      return;
    }

    const payload = new FormData();
    payload.append('organizationId', organizationId);
    payload.append('document_type', documentType);
    payload.append('document_notes', documentNotes);
    payload.append('file', file);

    setUploading(true);
    try {
      const response = await fetch('/api/rescue-verification-documents/upload', {
        method: 'POST',
        body: payload,
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Upload nije uspio.');
      }

      toast.success('Dokument je uploadan i poslan u review queue.');
      setDocumentNotes('');
      setFile(null);
      const input = document.getElementById('rescue-document-file') as HTMLInputElement | null;
      if (input) input.value = '';
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload nije uspio.');
    } finally {
      setUploading(false);
    }
  };

  const openDocument = async (documentId: string) => {
    setOpeningDocumentId(documentId);
    try {
      const response = await fetch(`/api/rescue-verification-documents/${documentId}/signed-url`, {
        method: 'GET',
        cache: 'no-store',
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.signedUrl) {
        throw new Error(data?.error?.message || 'Nije moguće otvoriti dokument.');
      }

      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nije moguće otvoriti dokument.');
    } finally {
      setOpeningDocumentId(null);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold font-[var(--font-heading)]">Verification docs</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pravi upload ide u privatni storage bucket. Ti i admin otvarate dokument preko kratkog signed URL-a, bez javnog exposurea. Malo manje fake it till you make it, malo više actual file.
        </p>

        {organizationId ? (
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document_type">Tip dokumenta</Label>
              <select
                id="document_type"
                name="document_type"
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value as RescueVerificationDocumentType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {Object.entries(RESCUE_VERIFICATION_DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rescue-document-file">Dokument</Label>
              <Input
                id="rescue-document-file"
                name="document_file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">Dozvoljeno: PDF, JPG, PNG, WebP · max 10 MB</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="document_notes">Napomena za admin review</Label>
              <Textarea
                id="document_notes"
                name="document_notes"
                rows={3}
                value={documentNotes}
                onChange={(event) => setDocumentNotes(event.target.value)}
                placeholder="Primjer: IBAN potvrda izdana 03/2026."
              />
            </div>
            <Button type="button" variant="outline" className="gap-2" onClick={uploadDocument} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? 'Uploadam…' : 'Dodaj dokument'}
            </Button>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">Prvo spremi organizaciju pa se otvara verification docs queue.</div>
        )}

        <div className="mt-6 space-y-3">
          {sortedDocuments.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">Još nema dokumenata za review.</div>
          ) : (
            sortedDocuments.map((document) => (
              <div key={document.id} className="rounded-2xl border p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{RESCUE_VERIFICATION_DOCUMENT_TYPE_LABELS[document.document_type]}</p>
                    <p className="mt-1 text-muted-foreground">
                      {document.original_filename ?? 'Bez naziva'}
                      {document.file_size_bytes ? ` · ${Math.max(1, Math.round(document.file_size_bytes / 1024))} KB` : ''}
                    </p>
                    {document.document_notes && <p className="mt-2 text-muted-foreground">{document.document_notes}</p>}
                    {document.admin_notes && <p className="mt-2 text-xs text-amber-700">Admin note: {document.admin_notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline">{RESCUE_VERIFICATION_DOCUMENT_REVIEW_STATUS_LABELS[document.review_status]}</Badge>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      disabled={openingDocumentId === document.id}
                      onClick={() => openDocument(document.id)}
                    >
                      {openingDocumentId === document.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
                      Otvori dokument
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
