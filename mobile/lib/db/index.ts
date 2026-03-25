import {
  sitters,
  groomers,
  trainers,
  myPets,
  reviews,
  conversations,
  chatMessages,
  lostPets,
  myBookings,
  walkSession,
  photoUpdates,
  petPassports,
  groomingServices,
  trainingPrograms,
} from '../mockData';

export async function getSitters() {
  return sitters;
}

export async function getSitter(id: string) {
  return sitters.find((s) => s.id === id)
    ?? groomers.find((s) => s.id === id)
    ?? trainers.find((s) => s.id === id)
    ?? null;
}

export async function getSitterReviews(_sitterId: string) {
  return reviews;
}

export async function getConversations() {
  return conversations;
}

export async function getMessages(_otherUserId: string) {
  return chatMessages;
}

export async function getPets() {
  return myPets;
}

export async function getBookings() {
  return myBookings;
}

export async function getBooking(id: string) {
  return myBookings.find((b) => b.id === id) ?? null;
}

export async function getLostPets() {
  return lostPets;
}

export async function getWalkSession() {
  return walkSession;
}

export async function getPhotoUpdates() {
  return photoUpdates;
}

export async function getPetPassport(petId: string) {
  return petPassports.find((p) => p.petId === petId) ?? null;
}

export async function getGroomingServices() {
  return groomingServices;
}

export async function getGroomers() {
  return groomers;
}

export async function getTrainingPrograms() {
  return trainingPrograms;
}

export async function getTrainers() {
  return trainers;
}
