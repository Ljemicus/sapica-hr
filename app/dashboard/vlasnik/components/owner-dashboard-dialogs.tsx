import { Cat, Dog, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/shared/image-upload';
import { StarRating } from '@/components/shared/star-rating';
import { type Pet, type Species } from '@/lib/types';
import type { OwnerDashboardBooking, PetFormState } from './owner-dashboard-types';

interface Props {
  showPetDialog: boolean;
  onShowPetDialogChange: (open: boolean) => void;
  editingPet: Pet | null;
  petForm: PetFormState;
  onPetFormChange: (form: PetFormState) => void;
  onSavePet: () => void;
  showReviewDialog: boolean;
  onShowReviewDialogChange: (open: boolean) => void;
  reviewBooking: OwnerDashboardBooking | null;
  reviewRating: number;
  onReviewRatingChange: (rating: number) => void;
  reviewComment: string;
  onReviewCommentChange: (comment: string) => void;
  onSubmitReview: () => void;
  loading: boolean;
}

export function OwnerDashboardDialogs({
  showPetDialog,
  onShowPetDialogChange,
  editingPet,
  petForm,
  onPetFormChange,
  onSavePet,
  showReviewDialog,
  onShowReviewDialogChange,
  reviewBooking,
  reviewRating,
  onReviewRatingChange,
  reviewComment,
  onReviewCommentChange,
  onSubmitReview,
  loading,
}: Props) {
  return (
    <>
      <Dialog open={showPetDialog} onOpenChange={onShowPetDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPet ? 'Uredi ljubimca' : 'Dodaj ljubimca'}</DialogTitle>
            <DialogDescription>Unesite podatke o vašem ljubimcu</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ime *</Label>
              <Input value={petForm.name} onChange={(e) => onPetFormChange({ ...petForm, name: e.target.value })} placeholder="Ime ljubimca" className="focus:border-orange-300" />
            </div>
            <div className="space-y-2">
              <Label>Vrsta *</Label>
              <div className="grid grid-cols-3 gap-2">
                {([['dog', 'Pas', Dog], ['cat', 'Mačka', Cat], ['other', 'Ostalo', HelpCircle]] as const).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onPetFormChange({ ...petForm, species: value as Species })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      petForm.species === value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'
                    }`}
                  >
                    <Icon className="h-6 w-6 mx-auto mb-1 text-orange-500" />
                    <p className="text-xs font-medium">{label}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pasmina</Label>
              <Input value={petForm.breed} onChange={(e) => onPetFormChange({ ...petForm, breed: e.target.value })} placeholder="npr. Labrador" className="focus:border-orange-300" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Dob (godine)</Label>
                <Input type="number" value={petForm.age} onChange={(e) => onPetFormChange({ ...petForm, age: e.target.value })} className="focus:border-orange-300" />
              </div>
              <div className="space-y-2">
                <Label>Težina (kg)</Label>
                <Input type="number" value={petForm.weight} onChange={(e) => onPetFormChange({ ...petForm, weight: e.target.value })} className="focus:border-orange-300" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Posebne potrebe</Label>
              <Textarea value={petForm.special_needs} onChange={(e) => onPetFormChange({ ...petForm, special_needs: e.target.value })} placeholder="Alergije, lijekovi, posebne navike..." className="focus:border-orange-300" />
            </div>
            <div className="space-y-2">
              <Label>Fotografija ljubimca</Label>
              <ImageUpload
                variant="square"
                bucket="pet-photos"
                entityId={editingPet?.id || 'new'}
                onUploadComplete={(urls) => {
                  if (urls[0]) onPetFormChange({ ...petForm, photo_url: urls[0] });
                }}
              />
            </div>
            <Button onClick={onSavePet} className="w-full bg-orange-500 hover:bg-orange-600 btn-hover" disabled={loading}>
              {loading ? 'Spremanje...' : editingPet ? 'Spremi promjene' : 'Dodaj ljubimca'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReviewDialog} onOpenChange={onShowReviewDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ostavi recenziju</DialogTitle>
            <DialogDescription>Za: {reviewBooking?.sitter?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ocjena</Label>
              <div className="flex justify-center py-3 bg-orange-50/50 rounded-xl">
                <StarRating rating={reviewRating} size="lg" interactive onRatingChange={onReviewRatingChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Komentar</Label>
              <Textarea value={reviewComment} onChange={(e) => onReviewCommentChange(e.target.value)} placeholder="Opišite vaše iskustvo..." rows={4} className="focus:border-orange-300" />
            </div>
            <Button onClick={onSubmitReview} className="w-full bg-orange-500 hover:bg-orange-600 btn-hover" disabled={loading}>
              {loading ? 'Šaljem...' : 'Pošalji recenziju'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
