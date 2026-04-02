import { Camera, Image, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/shared/image-upload';
import { CITIES, SERVICE_LABELS, type ServiceType, type UpdateType, type User as UserType } from '@/lib/types';

interface ProfileForm {
  bio: string;
  experience_years: string;
  services: ServiceType[];
  prices: Record<string, number>;
  city: string;
}

interface Props {
  showUpdateDialog: boolean;
  onShowUpdateDialogChange: (open: boolean) => void;
  showProfileDialog: boolean;
  onShowProfileDialogChange: (open: boolean) => void;
  updateType: UpdateType;
  onUpdateTypeChange: (type: UpdateType) => void;
  updateEmoji: string;
  onUpdateEmojiChange: (emoji: string) => void;
  updateCaption: string;
  onUpdateCaptionChange: (value: string) => void;
  updatePhotoUrls: string[];
  onUpdatePhotoUrlsChange: (urls: string[]) => void;
  sendingUpdate: boolean;
  onSendUpdate: () => void;
  loading: boolean;
  onSaveProfile: () => void;
  profileForm: ProfileForm;
  onProfileFormChange: (form: ProfileForm) => void;
  onToggleService: (service: ServiceType) => void;
  user: UserType;
  emojiOptions: string[];
  onAvatarUploaded?: () => void;
}

export function SitterDashboardDialogs({
  showUpdateDialog,
  onShowUpdateDialogChange,
  showProfileDialog,
  onShowProfileDialogChange,
  updateType,
  onUpdateTypeChange,
  updateEmoji,
  onUpdateEmojiChange,
  updateCaption,
  onUpdateCaptionChange,
  onUpdatePhotoUrlsChange,
  sendingUpdate,
  onSendUpdate,
  loading,
  onSaveProfile,
  profileForm,
  onProfileFormChange,
  onToggleService,
  user,
  emojiOptions,
  onAvatarUploaded,
}: Props) {
  return (
    <>
      <Dialog open={showUpdateDialog} onOpenChange={onShowUpdateDialogChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pošalji ažuriranje</DialogTitle>
            <DialogDescription>Vlasnik će biti obaviješten o ažuriranju</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vrsta ažuriranja</Label>
              <div className="flex gap-2">
                {([
                  { type: 'photo' as UpdateType, label: 'Fotografija', icon: Image },
                  { type: 'text' as UpdateType, label: 'Tekst', icon: MessageSquare },
                  { type: 'video' as UpdateType, label: 'Video', icon: Camera, disabled: true },
                ]).map(({ type, label, icon: Icon, disabled }) => (
                  <button
                    key={type}
                    onClick={() => !disabled && onUpdateTypeChange(type)}
                    disabled={disabled}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      updateType === type
                        ? 'bg-orange-500 text-white'
                        : disabled
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    {disabled && <span className="text-[10px]">(uskoro)</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Emoji</Label>
              <div className="flex gap-2 flex-wrap">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onUpdateEmojiChange(emoji)}
                    className={`text-2xl p-1.5 rounded-lg transition-colors ${
                      updateEmoji === emoji ? 'bg-orange-100 ring-2 ring-orange-300' : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Opis *</Label>
              <Textarea
                value={updateCaption}
                onChange={(e) => onUpdateCaptionChange(e.target.value)}
                placeholder="Opišite što se trenutno događa..."
                rows={3}
                className="focus:border-orange-300"
              />
            </div>

            {updateType === 'photo' && (
              <div className="space-y-2">
                <Label>Fotografija</Label>
                <ImageUpload
                  variant="dropzone"
                  maxFiles={1}
                  bucket="pet-photos"
                  entityId={user.id}
                  onUploadComplete={(urls) => onUpdatePhotoUrlsChange(urls)}
                />
              </div>
            )}

            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 btn-hover"
              onClick={onSendUpdate}
              disabled={!updateCaption.trim() || sendingUpdate}
            >
              {sendingUpdate ? 'Slanje...' : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Pošalji
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showProfileDialog} onOpenChange={onShowProfileDialogChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uredi profil</DialogTitle>
            <DialogDescription>Ažurirajte svoj sitter profil</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <ImageUpload
                variant="avatar"
                bucket="avatars"
                entityId={user.id}
                currentImageUrl={user.avatar_url}
                fallbackText={user.name?.charAt(0) || '?'}
                onUploadComplete={() => onAvatarUploaded?.()}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground -mt-2">Profilna fotografija</p>
            <div className="space-y-2">
              <Label>Bio *</Label>
              <Textarea
                value={profileForm.bio}
                onChange={(e) => onProfileFormChange({ ...profileForm, bio: e.target.value })}
                placeholder="Opišite se i svoje iskustvo s ljubimcima..."
                rows={4}
                className="focus:border-orange-300"
              />
            </div>
            <div className="space-y-2">
              <Label>Godine iskustva</Label>
              <Input
                type="number"
                value={profileForm.experience_years}
                onChange={(e) => onProfileFormChange({ ...profileForm, experience_years: e.target.value })}
                className="focus:border-orange-300"
              />
            </div>
            <div className="space-y-2">
              <Label>Grad</Label>
              <select
                value={profileForm.city}
                onChange={(e) => onProfileFormChange({ ...profileForm, city: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-orange-300"
              >
                <option value="">Odaberite grad</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Usluge *</Label>
              <div className="space-y-2">
                {(Object.entries(SERVICE_LABELS) as [ServiceType, string][]).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl border hover:border-orange-200 transition-colors">
                    <div className="flex items-center gap-2">
                      <Switch checked={profileForm.services.includes(key)} onCheckedChange={() => onToggleService(key)} />
                      <span className="text-sm">{label}</span>
                    </div>
                    {profileForm.services.includes(key) && (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          className="w-20 h-8 text-sm focus:border-orange-300"
                          placeholder="€"
                          value={profileForm.prices[key] || ''}
                          onChange={(e) => onProfileFormChange({
                            ...profileForm,
                            prices: { ...profileForm.prices, [key]: parseInt(e.target.value) || 0 },
                          })}
                        />
                        <span className="text-sm text-muted-foreground">€</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={onSaveProfile} className="w-full bg-orange-500 hover:bg-orange-600 btn-hover" disabled={loading}>
              {loading ? 'Spremanje...' : 'Spremi profil'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
