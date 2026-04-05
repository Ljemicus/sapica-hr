'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock3, ExternalLink, FileText, Link2, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  RESCUE_DONATION_LINK_STATUS_LABELS,
  RESCUE_ORGANIZATION_STATUS_LABELS,
  RESCUE_REVIEW_STATE_LABELS,
  RESCUE_VERIFICATION_DOCUMENT_REVIEW_STATUS_LABELS,
  RESCUE_VERIFICATION_DOCUMENT_TYPE_LABELS,
  RESCUE_VERIFICATION_STATUS_LABELS,
  type RescueOrganization,
  type RescueVerificationDocument,
} from '@/lib/types';

interface QueueItem {
  organization: RescueOrganization;
  documents: RescueVerificationDocument[];
}

export function RescueReviewQueue({ items }: { items: QueueItem[] }) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [openingDocumentId, setOpeningDocumentId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(() => Object.fromEntries(items.map(({ organization }) => [organization.id, organization.admin_notes ?? ''])));

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => new Date(b.organization.updated_at).getTime() - new Date(a.organization.updated_at).getTime()),
    [items]
  );

  const submitReview = async (payload: {
    entityType: 'organization' | 'donation_link' | 'document';
    organizationId: string;
    documentId?: string;
    action: 'approve' | 'reject' | 'mark_in_review';
  }) => {
    const key = `${payload.entityType}:${payload.documentId ?? payload.organizationId}:${payload.action}`;
    setBusyKey(key);

    try {
      const response = await fetch('/api/admin/rescue-organizations/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          adminNotes: notes[payload.organizationId] ?? '',
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Rescue review action failed');
      }

      toast.success(
        payload.action === 'approve'
          ? 'Review spremljen — green light.'
          : payload.action === 'reject'
            ? 'Review spremljen — vraćeno na doradu.'
            : 'Queue item označen kao in review.'
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Rescue review nije uspio');
    } finally {
      setBusyKey(null);
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
        throw new Error(data?.error?.message || 'Ne mogu otvoriti dokument.');
      }

      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ne mogu otvoriti dokument.');
    } finally {
      setOpeningDocumentId(null);
    }
  };

  if (sortedItems.length === 0) {
    return <div className="rounded-xl border p-4 text-sm text-muted-foreground">Nema rescue slučajeva u queueu.</div>;
  }

  return (
    <div className="space-y-4">
      {sortedItems.map(({ organization, documents }) => {
        const pendingDocuments = documents.filter((document) => document.review_status === 'pending');

        return (
          <div key={organization.id} className="rounded-2xl border p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{organization.display_name}</p>
                  <Badge variant="outline">{RESCUE_ORGANIZATION_STATUS_LABELS[organization.status]}</Badge>
                  <Badge variant="outline">Review: {RESCUE_REVIEW_STATE_LABELS[organization.review_state]}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Verification: {RESCUE_VERIFICATION_STATUS_LABELS[organization.verification_status]} · Donation link: {RESCUE_DONATION_LINK_STATUS_LABELS[organization.external_donation_url_status]}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {organization.email || 'bez emaila'} · {organization.city || 'bez grada'} · slug /{organization.slug}
                </p>
                {organization.external_donation_url && (
                  <a href={organization.external_donation_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs text-emerald-700 hover:underline">
                    <Link2 className="mr-1 h-3.5 w-3.5" /> {organization.external_donation_url}
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyKey !== null}
                  onClick={() => submitReview({ entityType: 'organization', organizationId: organization.id, action: 'mark_in_review' })}
                >
                  <Clock3 className="mr-1.5 h-3.5 w-3.5" /> In review
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={busyKey !== null}
                  onClick={() => submitReview({ entityType: 'organization', organizationId: organization.id, action: 'approve' })}
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve org
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 hover:border-red-200"
                  disabled={busyKey !== null}
                  onClick={() => submitReview({ entityType: 'organization', organizationId: organization.id, action: 'reject' })}
                >
                  <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject org
                </Button>
                {organization.external_donation_url && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200"
                      disabled={busyKey !== null}
                      onClick={() => submitReview({ entityType: 'donation_link', organizationId: organization.id, action: 'approve' })}
                    >
                      <Link2 className="mr-1.5 h-3.5 w-3.5" /> Approve link
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50 hover:border-red-200"
                      disabled={busyKey !== null}
                      onClick={() => submitReview({ entityType: 'donation_link', organizationId: organization.id, action: 'reject' })}
                    >
                      <Link2 className="mr-1.5 h-3.5 w-3.5" /> Reject link
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Textarea
                value={notes[organization.id] ?? ''}
                onChange={(event) => setNotes((current) => ({ ...current, [organization.id]: event.target.value }))}
                placeholder="Admin notes / što treba doraditi"
                rows={3}
              />
              {organization.admin_notes && (
                <p className="text-xs text-muted-foreground">Zadnja spremljena admin note: {organization.admin_notes}</p>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {documents.length === 0 ? (
                <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">Nema uploadanih verification dokumenata.</div>
              ) : (
                documents.map((document) => {
                  const docBusyKeyApprove = `document:${document.id}:approve`;
                  const docBusyKeyReject = `document:${document.id}:reject`;
                  const docBusyKeyReview = `document:${document.id}:mark_in_review`;

                  return (
                    <div key={document.id} className="rounded-xl border p-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="inline-flex items-center gap-2 text-sm font-medium">
                            <FileText className="h-4 w-4 text-slate-500" />
                            {RESCUE_VERIFICATION_DOCUMENT_TYPE_LABELS[document.document_type]}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {document.original_filename ?? 'Bez naziva'} · {RESCUE_VERIFICATION_DOCUMENT_REVIEW_STATUS_LABELS[document.review_status]}
                          </p>
                          {document.document_notes && <p className="mt-1 text-xs text-muted-foreground">Owner note: {document.document_notes}</p>}
                          {document.admin_notes && <p className="mt-1 text-xs text-muted-foreground">Admin note: {document.admin_notes}</p>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" disabled={openingDocumentId === document.id} onClick={() => openDocument(document.id)}>
                            {openingDocumentId === document.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="mr-1.5 h-3.5 w-3.5" />} Open doc
                          </Button>
                          <Button size="sm" variant="outline" disabled={busyKey === docBusyKeyApprove || busyKey === docBusyKeyReject || busyKey === docBusyKeyReview} onClick={() => submitReview({ entityType: 'document', organizationId: organization.id, documentId: document.id, action: 'mark_in_review' })}>
                            <Clock3 className="mr-1.5 h-3.5 w-3.5" /> Pending
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={busyKey === docBusyKeyApprove || busyKey === docBusyKeyReject || busyKey === docBusyKeyReview} onClick={() => submitReview({ entityType: 'document', organizationId: organization.id, documentId: document.id, action: 'approve' })}>
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve doc
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:border-red-200" disabled={busyKey === docBusyKeyApprove || busyKey === docBusyKeyReject || busyKey === docBusyKeyReview} onClick={() => submitReview({ entityType: 'document', organizationId: organization.id, documentId: document.id, action: 'reject' })}>
                            <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject doc
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Pending docs: {pendingDocuments.length} · Zadnji update {new Date(organization.updated_at).toLocaleString('hr-HR')}
            </p>
          </div>
        );
      })}
    </div>
  );
}
