import { after } from 'next/server';
import { createApiHandler } from '@/lib/api/handler';
import { sendCommandeEmails } from '@/lib/emails/send';
import { commandeEmailSchema } from '@/lib/emails/types';

/**
 * Endpoint for manual or secondary email triggers.
 * Backgrounds the actual dispatch using after().
 */
export const POST = createApiHandler(async (req: Request) => {
  const body = await req.json();
  const validatedData = commandeEmailSchema.parse(body);

  after(() => {
    sendCommandeEmails(validatedData).catch((error) => {
      console.error("[API V1 Emails Error]:", error);
    });
  });

  return { success: true, queued: true };
});
