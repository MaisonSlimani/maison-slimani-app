import { DomainResult } from '../models';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

/**
 * Domain contract for Contact management.
 */
export interface IContactRepository {
  /**
   * Persists a contact message.
   */
  create(payload: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>): Promise<DomainResult<ContactMessage>>;
  
  /**
   * Retrieves all messages.
   */
  findAll(): Promise<ContactMessage[]>;

  /**
   * Marks a message as read.
   */
  markAsRead(id: string): Promise<DomainResult<void>>;

  /**
   * Deletes a message.
   */
  delete(id: string): Promise<DomainResult<void>>;
}
