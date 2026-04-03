'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, XCircle, RotateCcw, Eye, Clock, FileText, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  VERIFICATION_STATUS_LABELS,
  VERIFICATION_STATUS_COLORS,
  type VerificationStatus,
  type ProviderVerification,
} from '@/lib/types/trust';

interface EnrichedVerification extends ProviderVerification {
  provider_display_name: string;
  provider_city: string | null;
  provider_type: string | null;
}

interface DocumentWithUrl {
  id: string;
  document_type: string;
  signed_url: string | null;
  storage_path: string;
}

export function AdminVerificationQueue() {
  const router = useRouter();
  const [verifications, setVerifications] = useState<EnrichedVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [internalNotes, setInternalNotes] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Record<string, DocumentWithUrl[]>>({});
  const [loadingDocs, setLoadingDocs] = useState<string | null>(null);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await fetch(`/api/admin/verifications${params}`);
      if (res.ok) {
        const data = await res.json();
        setVerifications(data.verifications || []);
      }
    } catch {
      toast.error('Greška pri dohvaćanju verifikacija');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [filter]);

  const fetchDocuments = async (verificationId: string) => {
    if (documents[verificationId]) return;
    setLoadingDocs(verificationId);
    try {
      const res = await fetch(`/api/admin/verifications/documents?verificationId=${verificationId}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(prev => ({ ...prev, [verificationId]: data.documents || [] }));
      }
    } catch {
      toast.error('Greška pri dohvaćanju dokumenata');
    } finally {
      setLoadingDocs(null);
    }
  };

  const handleAction = async (verificationId: string, action: string) => {
    if (action === 'reject' && !rejectionReasons[verificationId]?.trim()) {
      toast.error('Razlog odbijanja je obavezan');
      return;
    }

    setReviewingId(verificationId);
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId,
          action,
          rejectionReason: rejectionReasons[verificationId] || '',
          notesInternal: internalNotes[verificationId] || '',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Action failed');
      }

      const actionLabels: Record<string, string> = {
        approve: 'Verifikacija odobrena',
        reject: 'Verifikacija odbijena',
        request_resubmission: 'Zatražena nadopuna',
      };
      toast.success(actionLabels[action] || 'Ažurirano');
      await fetchVerifications();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška');
    } finally {
      setReviewingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      fetchDocuments(id);
    }
  };

  const DOCUMENT_TYPE_LABELS: Record<string, string> = {
    id_document: 'Dokument identiteta',
    selfie_with_document: 'Selfie s dokumentom',
    business_doc: 'Poslovni dokument',
    qualification_doc: 'Kvalifikacijski dokument',
  };

  const pendingCount = verifications.filter(v => v.status === 'pending').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-500" />
          Identity verifikacije
          {pendingCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-yellow-500 text-white text-xs font-bold">
              {pendingCount}
            </span>
          )}
        </h3>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="grid w-full grid-cols-4 h-10">
          <TabsTrigger value="pending" className="text-xs">Na čekanju</TabsTrigger>
          <TabsTrigger value="approved" className="text-xs">Odobrene</TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs">Odbijene</TabsTrigger>
          <TabsTrigger value="all" className="text-xs">Sve</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center text-muted-foreground">
            Učitavanje...
          </CardContent>
        </Card>
      ) : verifications.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center text-muted-foreground">
            Nema verifikacija za prikaz.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {verifications.map((v) => (
            <Card key={v.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{v.provider_display_name}</p>
                      <Badge className={`${VERIFICATION_STATUS_COLORS[v.status]} border text-xs`}>
                        {VERIFICATION_STATUS_LABELS[v.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                      {v.provider_type && <span className="flex items-center gap-1"><User className="h-3 w-3" />{v.provider_type}</span>}
                      {v.provider_city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.provider_city}</span>}
                      {v.submitted_at && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(v.submitted_at).toLocaleDateString('hr-HR')}</span>}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-shrink-0"
                    onClick={() => toggleExpand(v.id)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {expandedId === v.id ? 'Zatvori' : 'Pregledaj'}
                  </Button>
                </div>

                {/* Expanded detail view */}
                {expandedId === v.id && (
                  <div className="border-t pt-3 space-y-3">
                    {/* Documents */}
                    <div>
                      <p className="text-sm font-medium mb-2">Dokumenti</p>
                      {loadingDocs === v.id ? (
                        <p className="text-xs text-muted-foreground">Učitavanje dokumenata...</p>
                      ) : documents[v.id]?.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {documents[v.id].map((doc) => (
                            <div key={doc.id} className="border rounded-lg p-2">
                              <p className="text-xs font-medium mb-1">{DOCUMENT_TYPE_LABELS[doc.document_type] || doc.document_type}</p>
                              {doc.signed_url ? (
                                doc.storage_path.endsWith('.pdf') ? (
                                  <a
                                    href={doc.signed_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                  >
                                    <FileText className="h-3 w-3" /> Otvori PDF
                                  </a>
                                ) : (
                                  <img
                                    src={doc.signed_url}
                                    alt={DOCUMENT_TYPE_LABELS[doc.document_type]}
                                    className="w-full h-40 object-cover rounded border"
                                  />
                                )
                              ) : (
                                <p className="text-xs text-muted-foreground">Dokument nije dostupan</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Nema dokumenata</p>
                      )}
                    </div>

                    {/* Review info */}
                    {v.reviewed_at && (
                      <p className="text-xs text-muted-foreground">
                        Pregledano: {new Date(v.reviewed_at).toLocaleDateString('hr-HR')}
                        {v.rejection_reason && ` — "${v.rejection_reason}"`}
                      </p>
                    )}
                    {v.notes_internal && (
                      <p className="text-xs text-muted-foreground">Interne bilješke: {v.notes_internal}</p>
                    )}

                    {/* Action form for pending verifications */}
                    {v.status === 'pending' && (
                      <div className="space-y-2 border-t pt-3">
                        <Input
                          placeholder="Razlog odbijanja ili bilješka..."
                          value={rejectionReasons[v.id] ?? ''}
                          onChange={(e) => setRejectionReasons(prev => ({ ...prev, [v.id]: e.target.value }))}
                          className="text-sm rounded-lg"
                        />
                        <Input
                          placeholder="Interna bilješka (nevidljiva provideru)..."
                          value={internalNotes[v.id] ?? ''}
                          onChange={(e) => setInternalNotes(prev => ({ ...prev, [v.id]: e.target.value }))}
                          className="text-sm rounded-lg"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 shadow-sm"
                            disabled={reviewingId === v.id}
                            onClick={() => handleAction(v.id, 'approve')}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" /> Odobri
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:bg-red-50 hover:border-red-200"
                            disabled={reviewingId === v.id}
                            onClick={() => handleAction(v.id, 'reject')}
                          >
                            <XCircle className="h-3 w-3 mr-1" /> Odbij
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-500 hover:bg-orange-50 hover:border-orange-200"
                            disabled={reviewingId === v.id}
                            onClick={() => handleAction(v.id, 'request_resubmission')}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" /> Traži nadopunu
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
