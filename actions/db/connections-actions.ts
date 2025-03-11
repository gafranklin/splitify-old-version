"use server"

import { db } from "@/db/db"
import { InsertConnection, SelectConnection, connectionsTable } from "@/db/schema"
import { ActionState, RideshareApiConnection } from "@/types"
import { eq, and } from "drizzle-orm"

/**
 * Creates or updates a connection
 */
export async function upsertConnectionAction(
  connection: InsertConnection
): Promise<ActionState<SelectConnection>> {
  try {
    // If the ID is not provided, generate it from userId and provider
    if (!connection.id) {
      connection.id = `${connection.userId}:${connection.provider}`
    }
    
    // Check if connection exists
    const existingConnection = await db.query.connections.findFirst({
      where: eq(connectionsTable.id, connection.id)
    })
    
    let result: SelectConnection
    
    if (existingConnection) {
      // Update existing connection
      const [updated] = await db
        .update(connectionsTable)
        .set({
          ...connection,
          updatedAt: new Date()
        })
        .where(eq(connectionsTable.id, connection.id))
        .returning()
      
      result = updated
    } else {
      // Create new connection
      const [created] = await db
        .insert(connectionsTable)
        .values(connection)
        .returning()
      
      result = created
    }
    
    return {
      isSuccess: true,
      message: "Connection saved successfully",
      data: result
    }
  } catch (error) {
    console.error("Error upserting connection:", error)
    return { isSuccess: false, message: "Failed to save connection" }
  }
}

/**
 * Gets a connection by user ID and provider
 */
export async function getConnectionAction(
  userId: string,
  provider: string
): Promise<ActionState<SelectConnection>> {
  try {
    const id = `${userId}:${provider}`
    
    const connection = await db.query.connections.findFirst({
      where: eq(connectionsTable.id, id)
    })
    
    if (!connection) {
      return {
        isSuccess: false,
        message: "Connection not found"
      }
    }
    
    return {
      isSuccess: true,
      message: "Connection retrieved successfully",
      data: connection
    }
  } catch (error) {
    console.error("Error retrieving connection:", error)
    return { isSuccess: false, message: "Failed to retrieve connection" }
  }
}

/**
 * Gets all connections for a user
 */
export async function getUserConnectionsAction(
  userId: string
): Promise<ActionState<SelectConnection[]>> {
  try {
    const connections = await db.query.connections.findMany({
      where: eq(connectionsTable.userId, userId)
    })
    
    return {
      isSuccess: true,
      message: "Connections retrieved successfully",
      data: connections
    }
  } catch (error) {
    console.error("Error retrieving user connections:", error)
    return { isSuccess: false, message: "Failed to retrieve connections" }
  }
}

/**
 * Deletes a connection
 */
export async function deleteConnectionAction(
  userId: string,
  provider: string
): Promise<ActionState<void>> {
  try {
    const id = `${userId}:${provider}`
    
    await db.delete(connectionsTable).where(eq(connectionsTable.id, id))
    
    return {
      isSuccess: true,
      message: "Connection deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting connection:", error)
    return { isSuccess: false, message: "Failed to delete connection" }
  }
} 