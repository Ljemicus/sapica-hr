'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Upload, CheckCircle, XCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  VERIFICATION_STATUS_LABELS,
  VERIFICATION_STATUS_COLORS,
  type VerificationStatus,
  type ProviderVerification,
} from '@/lib/types/trust';

interface UploadedDoc {
  document_type: 'id_document' | 'selfie_with_document';
  storage_bucket: string;
  storage_path: string;
  fileName: string;
}

interface Props {
  verification: ProviderVerification | null;
}

const STATUS_ICONS: Record<VerificationStatus, typeof Shield> = {
  not_submitted: Shield,
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  resubmission_requested: AlertTriangle,
};

export function ProviderIdentityVerification({ verification }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [idDoc, setIdDoc] = useState<UploadedDoc | null>(null);
  const [selfieDoc, setSelfieDoc] = useState<UploadedDoc | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = !verification || verification.status === 'rejected' || verification.status === 'resubmission_requested' || verification.status === 'not_submitted';

  const uploadFile = async (file: File, docType: 'id_document' | 'selfie_with_document') => {
    setUploading(docType);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', docType);
      formData.append('folder', 'identity');

      const res = await fetch('/api/upload/verification', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Upload failed');
      }

      const data = await res.json();
      const doc: UploadedDoc = {
        document_type: docType,
        storage_bucket: data.bucket,
        storage_path: data.path,
        fileName: data.fileName,
      };

      if (docType === 'id_document') setIdDoc(doc);
      else setSelfieDoc(doc);

      toast.success('Dokument učitan');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload nije uspio');
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async () => {
    if (!fullName.trim() || !dateOfBirth.trim() || !address.trim()) {
      toast.error('Sva polja su obavezna.');
      return;
    }
    if (!idDoc || !selfieDoc) {
      toast.error('Potrebni su dokument identiteta i selfie s dokumentom.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/provider/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          date_of_birth: dateOfBirth.trim(),
          address: address.trim(),
          documents: [
            { document_type: idDoc.document_type, storage_bucket: idDoc.storage_bucket, storage_path: idDoc.storage_path },
            { document_type: selfieDoc.document_type, storage_bucket: selfieDoc.storage_bucket, storage_path: selfieDoc.storage_path },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Slanje nije uspjelo');
      }

      toast.success('Zahtjev za verifikaciju identiteta je poslan!');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri slanju zahtjeva');
    } finally {
      setSubmitting(false);
    }
  };

  const status = verification?.status || 'not_submitted';
  const StatusIcon = STATUS_ICONS[status];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            Verifikacija identiteta
          </CardTitle>
          <Badge className={`${VERIFICATION_STATUS_COLORS[status]} border text-xs`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {VERIFICATION_STATUS_LABELS[status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status messages */}
        {status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            Vaš zahtjev je poslan i čeka pregled. Očekujte odgovor u roku 24 sata.
          </div>
        )}
        {status === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            Vaš identitet je verificiran. Hvala na suradnji!
          </div>
        )}
        {status === 'rejected' && verification?.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            <p className="font-medium">Zahtjev je odbijen</p>
            <p className="mt-1">{verification.rejection_reason}</p>
            <p className="mt-2 text-xs">Možete ponovno poslati zahtjev s ispravnim dokumentima.</p>
          </div>
        )}
        {status === 'resubmission_requested' && verification?.rejection_reason && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
            <p className="font-medium">Potrebna nadopuna</p>
            <p className="mt-1">{verification.rejection_reason}</p>
          </div>
        )}

        {/* Submission form */}
        {canSubmit && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Puno ime (kao na dokumentu)</Label>
              <Input
                id="full_name"
                placeholder="Ivan Horvat"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Datum rođenja</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresa (mjesto stanovanja)</Label>
              <Input
                id="address"
                placeholder="Ulica i broj, Grad"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Document uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dokument identiteta</Label>
                <input
                  ref={idInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file, 'id_document');
                  }}
                />
                {idDoc ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                    <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="truncate text-green-800">{idDoc.fileName}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto h-6 px-2 text-xs"
                      onClick={() => { setIdDoc(null); if (idInputRef.current) idInputRef.current.value = ''; }}
                    >
                      Ukloni
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    disabled={uploading === 'id_document'}
                    onClick={() => idInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {uploading === 'id_document' ? 'Učitavanje...' : 'Učitaj dokument'}
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">Osobna iskaznica, putovnica ili vozačka dozvola</p>
              </div>

              <div className="space-y-2">
                <Label>Selfie s dokumentom</Label>
                <input
                  ref={selfieInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file, 'selfie_with_document');
                  }}
                />
                {selfieDoc ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                    <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="truncate text-green-800">{selfieDoc.fileName}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto h-6 px-2 text-xs"
                      onClick={() => { setSelfieDoc(null); if (selfieInputRef.current) selfieInputRef.current.value = ''; }}
                    >
                      Ukloni
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    disabled={uploading === 'selfie_with_document'}
                    onClick={() => selfieInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {uploading === 'selfie_with_document' ? 'Učitavanje...' : 'Učitaj selfie'}
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">Fotografija vas s dokumentom u ruci</p>
              </div>
            </div>

            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={submitting || !fullName.trim() || !dateOfBirth || !address.trim() || !idDoc || !selfieDoc}
              onClick={handleSubmit}
            >
              {submitting ? 'Slanje...' : 'Pošalji zahtjev za verifikaciju'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
