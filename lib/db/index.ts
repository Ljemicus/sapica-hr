export { isSupabaseConfigured } from './helpers';
export { ensureSitterProfile, syncUserProfile } from '@/lib/auth/auth-profile';
export { getUser, getUsers, getUsersByRole, updateUserProfile } from './users';
export { getPets, getPetsByOwner, getPet, createPet, getPetCardData, type PetCardData } from './pets';
export { getSitters, getSitter, getSitterById, getSitterProfileById } from './sitters';
export { getBookings, getAllBookings, getBooking, createBooking, updateBooking, updateBookingStatus } from './bookings';
export { getReviews, getReviewsBySitter, getReviewedBookingIds, createReview } from './reviews';
export { getConversations, getMessages, getConversation, getConversationSummaries, sendMessage, markAsRead, type ConversationSummary } from './messages';
export { getAvailability, setAvailability } from './availability';
export { getWalk, getWalksByBooking, getWalksForUser, getActiveWalksForSitter } from './walks';
export { getUpdates, getUpdatesByBooking } from './pet-updates';
export { createWalk, updateWalk } from './walk-actions';
export { createPetUpdate, getRecentUpdatesBySitter } from './update-actions';
export { getPassport, updatePassport } from './pet-passport';
export { getGroomers, getGroomer, getGroomerReviews } from './groomers';
export { getGroomerAvailability, getGroomerAvailableDates, setGroomerAvailability, deleteGroomerAvailability } from './groomer-availability';
export { createGroomerBooking, getGroomerBookings, getUserGroomerBookings, updateGroomerBookingStatus, cancelGroomerBooking } from './groomer-bookings';
export { getTrainers, getTrainer, getPrograms, createProgram, updateProgram, deleteProgram, getTrainerReviews } from './trainers';
export { getTrainerAvailability, getTrainerAvailableDates, setTrainerAvailability, deleteTrainerAvailability } from './trainer-availability';
export { getTrainerBookedSlots, getTrainerBookings, createTrainerBooking, updateTrainerBookingStatus } from './trainer-bookings';
export { getArticles, getArticle, getRelatedArticles } from './blog';
export {
  getArticleComments,
  getArticleCommentById,
  createArticleComment,
  reportArticleComment,
  deleteArticleComment,
} from './blog-comments';
export { getCategories, getTopics, getTopic, getPosts, getTrendingTopics } from './forum';
export { getLostPets, type LostPetFilters, getLostPetsByUser, getLostPet, updateLostPetStatus, markLostPetFound, addLostPetOwnerUpdate, updateLostPetSightingStatus, updateLostPetHidden, renewLostPet, deleteLostPet, extendLostPetExpiry, processLostPetExpiry, getNewlyRemindedListings } from './lost-pets';
export { getProducts, getProductBySlug, getProductReviews, getRelatedProducts } from './products';
export {
  getPublisherProfile,
  createPublisherProfile,
  updatePublisherProfile,
  markOnboarded,
} from './publisher-profiles';
export {
  getAdoptionListing,
  getAdoptionListings,
  getActiveAdoptionListings,
  getAdoptionListingsByPublisher,
  getPublisherListings,
  createAdoptionListing,
  updateAdoptionListing,
  updateAdoptionListingStatus,
  deleteAdoptionListing,
  canTransition,
  type AdoptionListingFilters,
} from './adoption-listings';
export {
  getProviderApplication,
  getProviderApplicationById,
  getAllProviderApplications,
  upsertProviderApplication,
  submitProviderApplication,
  updateProviderApplicationStatus,
  updateProviderStripeState,
} from './provider-applications';
export {
  createAdoptionInquiry,
  getInquiriesByPublisher,
  getInquiriesByListing,
  type AdoptionInquiry,
} from './adoption-inquiries';

// Trust Layer
export {
  getVerification,
  upsertVerification,
  updateVerificationReview,
  getVerificationById,
  getPendingVerifications,
  getAllVerifications,
} from './provider-verifications';
export {
  createProviderDocument,
  getDocumentsByVerification,
  getDocumentsByProvider,
} from './provider-documents';
export {
  grantBadge,
  revokeBadge,
  getActiveBadges,
} from './provider-badges';
export {
  logAdminAction,
  getAuditLogs,
} from './audit-logs';

// Notifications
export {
  canSendNotification,
  getNotificationPreferences,
  getUserPushSubscriptions,
  removeExpiredSubscriptions,
  type NotificationPreferences,
  type NotificationType,
} from './notifications';

// Push Subscriptions
export {
  savePushSubscription,
  getUserPushSubscriptions as getPushSubscriptionsForUser,
  removePushSubscription,
  sendPushToUser,
} from './push-subscriptions';

export {
  getRescueOrganization,
  getRescueOrganizationByOwner,
  getRescueOrganizationBySlug,
  getRescueOrganizations,
  getRescueOrganizationsByCity,
  getVerifiedRescueOrganizations,
  getPendingRescueOrganizations,
  getRescueStats,
  createRescueOrganization,
  updateRescueOrganization,
  reviewRescueOrganization,
  type RescueStats,
} from './rescue-organizations';
export {
  getRescueAppeal,
  getRescueAppealBySlug,
  getRescueAppealsByOrganization,
  getActiveRescueAppeals,
  createRescueAppeal,
  updateRescueAppeal,
  updateRescueAppealStatus,
} from './rescue-appeals';
export {
  getAppealUpdates,
  createAppealUpdate,
  updateAppealUpdate,
} from './rescue-appeal-updates';
export {
  createAppealDonationRecord,
  getAppealDonationRecords,
  updateAppealDonationStatus,
} from './rescue-appeal-donations';
export {
  createRescueVerificationDocument,
  getRescueVerificationDocument,
  getRescueVerificationDocuments,
  reviewRescueVerificationDocument,
} from './rescue-verification-documents';

// Vet Reviews
export {
  getVetReviews,
  getVetReviewStats,
  createVetReview,
  updateVetReview,
  deleteVetReview,
  markReviewHelpful,
  flagReview,
  getUserVetReview,
} from './vet-reviews';

// Vet Review Types (client-safe)
export {
  VET_SERVICE_LABELS,
  type VetReview,
  type VetReviewStats,
  type VetServiceType,
  type VetReviewStatus,
  type VetWithReviews,
} from '@/lib/types/vet-reviews';
