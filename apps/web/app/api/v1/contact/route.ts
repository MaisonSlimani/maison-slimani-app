import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/api/handler';
import { createClient } from '@/lib/supabase/server';
import { ContactRepository } from '@maison/db';
import { envoyerEmail, ADMIN_EMAIL } from '@/lib/resend/client';
import { applyRateLimit, getClientIdentifier } from '@/lib/middleware/rate-limit';

const contactSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  message: z.string().min(1, 'Le message est requis'),
});

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
  const contactRepo = new ContactRepository(supabase);
  
  // Fetch settings to get admin email
  const settings = await contactRepo.getSettings();
  const targetEmail = settings?.email_entreprise || ADMIN_EMAIL;

  // External Service (Email)
  await envoyerEmail({
    to: targetEmail,
    subject: `[V1] Nouveau message de ${validatedData.nom}`,
    html: `
      <h2>Nouveau message de contact (API V1)</h2>
      <p><strong>Nom :</strong> ${validatedData.nom}</p>
      <p><strong>Email :</strong> ${validatedData.email}</p>
      ${validatedData.telephone ? `<p><strong>Téléphone :</strong> ${validatedData.telephone}</p>` : ''}
      <p><strong>Message :</strong></p>
      <p>${validatedData.message}</p>
    `,
  });

  return { success: true };
});
