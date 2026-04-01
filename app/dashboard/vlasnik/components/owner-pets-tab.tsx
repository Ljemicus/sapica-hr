import Link from 'next/link';
import { Edit, FileHeart, PawPrint, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { SPECIES_LABELS, type Pet } from '@/lib/types';
import { speciesGradients, speciesIcons } from './owner-dashboard-constants';

interface Props {
  pets: Pet[];
  onAddPet: () => void;
  onEditPet: (pet: Pet) => void;
  onDeletePet: (petId: string) => void;
}

export function OwnerPetsTab({ pets, onAddPet, onEditPet, onDeletePet }: Props) {
  if (pets.length === 0) {
    return (
      <EmptyState
        icon={PawPrint}
        title="Nemate dodanih ljubimaca"
        description="Dodajte svog prvog ljubimca da biste mogli napraviti rezervaciju."
        action={<Button onClick={onAddPet} className="bg-orange-500 hover:bg-orange-600 btn-hover"><Plus className="h-4 w-4 mr-1" /> Dodaj ljubimca</Button>}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {pets.map((pet) => {
        const Icon = speciesIcons[pet.species];
        const gradient = speciesGradients[pet.species];
        return (
          <Card key={pet.id} className="border-0 shadow-sm card-hover overflow-hidden">
            <CardContent className="p-0">
              <div className={`h-3 bg-gradient-to-r ${gradient}`} />
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{pet.name}</h3>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600" onClick={() => onEditPet(pet)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => onDeletePet(pet.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{SPECIES_LABELS[pet.species]}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      {pet.age && <Badge variant="secondary" className="text-xs bg-gray-50">{pet.age} god.</Badge>}
                      {pet.weight && <Badge variant="secondary" className="text-xs bg-gray-50">{pet.weight} kg</Badge>}
                    </div>
                    {pet.special_needs && (
                      <p className="text-xs text-amber-600 mt-2 bg-amber-50 rounded-lg p-2">⚠️ {pet.special_needs}</p>
                    )}
                    <div className="mt-2">
                      <Link href={`/ljubimac/${pet.id}/karton`}>
                        <Button variant="outline" size="sm" className="text-xs hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
                          <FileHeart className="h-3 w-3 mr-1" /> Zdravstveni karton
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
