import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api/handler';
import { createClient } from '@/lib/supabase/server';
import { SettingsRepository } from '@maison/db';
import { envoyerEmail, ADMIN_EMAIL } from '@/lib/resend/client';
import { applyRateLimit, getClientIdentifier } from '@/lib/middleware/rate-limit';
import { contactSchema } from '@maison/domain';

export const POST = createApiHandler(async (req: Request) => {
  // Rate Limiting (Infrastructure layer)
  const identifier = getClientIdentifier(req as NextRequest);
  const rateLimitResult = await applyRateLimit({ 
    key: `contact-v1:${identifier}`, 
    limit: 5, 
    windowMs: 60 * 1000 
  });
  
  if (!rateLimitResult.success) {
    throw { status: 429, message: 'Trop de requêtes' };
  }

  // Input Validation
  const body = await req.json();
  const validatedData = contactSchema.parse(body);

  // Repository Usage (Business Logic)
  const supabase = await createClient();
  const settingsRepo = new SettingsRepository(supabase);
  
  // Fetch settings to get admin email
  const settings = await settingsRepo.getSettings();
  const targetEmail = settings?.companyEmail || ADMIN_EMAIL;

  // External Service (Email)
  await envoyerEmail({
    to: targetEmail,
    subject: `[V1] Nouveau message de ${validatedData.name}`,
    html: `
      <h2>Nouveau message de contact (API V1)</h2>
      <p><strong>Nom :</strong> ${validatedData.name}</p>
      <p><strong>Email :</strong> ${validatedData.email}</p>
      ${validatedData.phone ? `<p><strong>Téléphone :</strong> ${validatedData.phone}</p>` : ''}
      <p><strong>Message :</strong></p>
      <p>${validatedData.message}</p>
    `,
  });

  return { success: true };
});
