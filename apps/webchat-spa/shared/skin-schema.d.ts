import { z } from 'zod';

export const skinSchema: z.ZodObject<
  {
    tenant: z.ZodString;
    mode: z.ZodEnum<[ 'fullpage', 'widget' ]>;
    brand: z.ZodObject<
      {
        name: z.ZodString;
        favicon: z.ZodString;
        logo: z.ZodString;
        primary: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        name: string;
        favicon: string;
        logo: string;
        primary: string;
      },
      {
        name: string;
        favicon: string;
        logo: string;
        primary: string;
      }
    >;
    directLine: z.ZodObject<
      {
        tokenUrl: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        tokenUrl: string;
      },
      {
        tokenUrl: string;
      }
    >;
    webchat: z.ZodObject<
      {
        styleOptions: z.ZodString;
        adaptiveCardsHostConfig: z.ZodString;
        locale: z.ZodDefault<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        styleOptions: string;
        adaptiveCardsHostConfig: string;
        locale: string;
      },
      {
        styleOptions: string;
        adaptiveCardsHostConfig: string;
        locale?: string | undefined;
      }
    >;
    fullpage: z.ZodObject<
      {
        index: z.ZodString;
        css: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        index: string;
        css: string;
      },
      {
        index: string;
        css: string;
      }
    >;
    hooks: z.ZodOptional<
      z.ZodObject<
        {
          script: z.ZodString;
        },
        'strip',
        z.ZodTypeAny,
        {
          script: string;
        },
        {
          script: string;
        }
      >
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    tenant: string;
    mode: 'fullpage' | 'widget';
    brand: {
      name: string;
      favicon: string;
      logo: string;
      primary: string;
    };
    directLine: {
      tokenUrl: string;
    };
    webchat: {
      styleOptions: string;
      adaptiveCardsHostConfig: string;
      locale: string;
    };
    fullpage: {
      index: string;
      css: string;
    };
    hooks?: {
      script: string;
    } | undefined;
  },
  {
    tenant: string;
    mode: 'fullpage' | 'widget';
    brand: {
      name: string;
      favicon: string;
      logo: string;
      primary: string;
    };
    directLine: {
      tokenUrl: string;
    };
    webchat: {
      styleOptions: string;
      adaptiveCardsHostConfig: string;
      locale?: string | undefined;
    };
    fullpage: {
      index: string;
      css: string;
    };
    hooks?: {
      script: string;
    } | undefined;
  }
>;
