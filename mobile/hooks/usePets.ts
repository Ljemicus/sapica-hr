import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Pet, PetSpecies, PetSize } from '../types/database';
import { useAuth } from '../context/AuthContext';

export function usePets() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });
    setPets((data as Pet[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const createPet = async (pet: {
    name: string;
    species: PetSpecies;
    breed?: string;
    age_years?: number;
    size: PetSize;
    notes?: string;
    photos?: string[];
  }) => {
    if (!user) return { error: 'Not authenticated' };
    const { data, error } = await supabase
      .from('pets')
      .insert({ ...pet, owner_id: user.id })
      .select()
      .single();
    if (data) setPets(prev => [data as Pet, ...prev]);
    return { data: data as Pet | null, error: error?.message ?? null };
  };

  const updatePet = async (id: string, updates: Partial<Pet>) => {
    const { data, error } = await supabase
      .from('pets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (data) setPets(prev => prev.map(p => (p.id === id ? (data as Pet) : p)));
    return { data: data as Pet | null, error: error?.message ?? null };
  };

  const deletePet = async (id: string) => {
    const { error } = await supabase.from('pets').delete().eq('id', id);
    if (!error) setPets(prev => prev.filter(p => p.id !== id));
    return { error: error?.message ?? null };
  };

  return { pets, loading, fetchPets, createPet, updatePet, deletePet };
}
