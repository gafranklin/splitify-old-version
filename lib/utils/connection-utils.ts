import { InsertConnection } from "@/db/schema"
import { RideshareApiConnection } from "@/types"

/**
 * Converts a RideshareApiConnection to an InsertConnection
 */
export function convertToDbConnection(
  apiConnection: RideshareApiConnection
): InsertConnection {
  return {
    id: `${apiConnection.userId}:${apiConnection.provider}`,
    userId: apiConnection.userId,
    provider: apiConnection.provider,
    accessToken: apiConnection.accessToken,
    refreshToken: apiConnection.refreshToken || null,
    expiresAt: apiConnection.expiresAt || null,
    scope: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}
