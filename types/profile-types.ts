/*
Contains the profile-related types.
*/

import { SelectProfile } from "@/db/schema"

// Export any additional profile-related types here if needed
export interface ProfileWithPermissions extends SelectProfile {
  canManageSubscription: boolean
}
