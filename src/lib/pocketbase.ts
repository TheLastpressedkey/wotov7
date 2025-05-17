import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://milt.pockethost.io');

// Auto-refresh auth store on failed requests
pb.autoCancellation(false);

// Export auth store type
export type AuthStore = typeof pb.authStore;

// Export typed collections
export const collections = {
  users: pb.collection('users'),
  events: pb.collection('events')
};

// Helper to check if user is authenticated
export const isAuthenticated = () => pb.authStore.isValid;

// Helper to check if user is admin
export const isAdmin = () => {
  const user = pb.authStore.model;
  return user?.admin === true;
};

// Helper to get current user
export const getCurrentUser = () => pb.authStore.model;

// Helper to logout
export const logout = () => pb.authStore.clear();

// Helper to register for an event
export const registerForEvent = async (eventId: string, status: 'present' | 'absent' | 'undecided') => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const event = await pb.collection('events').getOne(eventId);
  
  // Calculer le nombre actuel de participants avec le statut "present"
  const presentCount = (event.registrations || []).filter(reg => reg.status === 'present').length;
  
  // Vérifier si l'événement est complet
  if (status === 'present' && presentCount >= event.maxParticipants) {
    throw new Error('L\'événement est complet');
  }

  // Generate registration token
  const token = Array.from(crypto.getRandomValues(new Uint8Array(10)))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 15);

  // Create registration object with phone number
  const registration = {
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone?.toString(), // Ajout du numéro de téléphone
    status: status,
    token: token,
    registrationDate: new Date().toISOString()
  };

  // Get current registrations or initialize empty array
  const registrations = event.registrations || [];

  // Mettre à jour l'événement avec la nouvelle inscription
  await pb.collection('events').update(eventId, {
    registrations: [...registrations, registration],
    currentParticipants: presentCount + (status === 'present' ? 1 : 0)
  });

  return token;
};

// Helper to update registration status
export const updateRegistrationStatus = async (eventId: string, token: string, newStatus: 'present' | 'absent' | 'undecided') => {
  const event = await pb.collection('events').getOne(eventId);
  
  const registrations = event.registrations || [];
  const registration = registrations.find(r => r.token === token);
  
  if (!registration) {
    throw new Error('Registration not found');
  }

  // Calculer le nombre actuel de participants avec le statut "present"
  const presentCount = registrations.filter(reg => reg.status === 'present').length;

  // Vérifier si l'événement est complet avant de changer le statut à 'present'
  if (newStatus === 'present' && registration.status !== 'present' && presentCount >= event.maxParticipants) {
    throw new Error('L\'événement est complet');
  }

  // Mettre à jour le statut de l'inscription
  const updatedRegistrations = registrations.map(r => 
    r.token === token ? { ...r, status: newStatus } : r
  );

  // Calculer le nouveau nombre de participants avec le statut "present"
  const newPresentCount = updatedRegistrations.filter(reg => reg.status === 'present').length;

  // Mettre à jour l'événement
  await pb.collection('events').update(eventId, {
    registrations: updatedRegistrations,
    currentParticipants: newPresentCount
  });
};