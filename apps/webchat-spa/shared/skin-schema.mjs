import { z } from 'zod';

export const skinSchema = z
  .object({
    tenant: z.string().min(1),
    mode: z.enum(['fullpage', 'widget']),
    brand: z.object({
      name: z.string().min(1),
      favicon: z.string().min(1),
      logo: z.string().min(1),
      primary: z.string().min(1)
    }),
    directLine: z.object({
      tokenUrl: z.string().url()
    }),
    webchat: z.object({
      styleOptions: z.string().min(1),
      adaptiveCardsHostConfig: z.string().min(1),
      locale: z.string().min(2).default('en-US')
    }),
    fullpage: z.object({
      index: z.string().min(1),
      css: z.string().min(1)
    }),
    hooks: z
      .object({
        script: z.string().min(1)
      })
      .optional()
  })
  .superRefine((value, ctx) => {
    if (value.mode === 'fullpage' && !value.fullpage) {
      ctx.addIssue({
        code: 'custom',
        message: 'Full page skins must define a fullpage block'
      });
    }
  });
