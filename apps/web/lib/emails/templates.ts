import { buildClientConfirmationTemplate } from './templates/ClientConfirmation'
import { buildStatusChangeTemplate } from './templates/StatusChange'
import { buildAdminNotificationTemplate } from './templates/AdminNotification'

/**
 * Email Templates Entry Point
 * Refactored to adhere to the 300-line rule via modular sub-modules.
 * Each template logic is now isolated for better maintainability.
 */
export {
  buildClientConfirmationTemplate,
  buildStatusChangeTemplate,
  buildAdminNotificationTemplate
}
