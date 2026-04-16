import { z } from "zod";
import { BucketStatus } from "@/generated/prisma/client";

// Strip HTML tags to prevent XSS
function sanitize(val: string): string {
  return val.replace(/<[^>]*>/g, "").trim();
}

const sanitizedString = (max: number) =>
  z.string().transform(sanitize).pipe(z.string().min(1).max(max));

const optionalSanitizedString = (max: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? sanitize(v) : undefined))
    .pipe(z.string().max(max).optional());

// BucketItem
export const createBucketItemSchema = z.object({
  title: sanitizedString(200),
  description: optionalSanitizedString(1000),
  category: sanitizedString(100),
  status: z.nativeEnum(BucketStatus).optional(),
  orientationId: z.string().cuid().nullable().optional(),
});

export const updateBucketItemSchema = z.object({
  title: sanitizedString(200).optional(),
  description: optionalSanitizedString(1000),
  category: sanitizedString(100).optional(),
  status: z.nativeEnum(BucketStatus).optional(),
  orientationId: z.string().cuid().nullable().optional(),
  doneAt: z.string().datetime().nullable().optional(),
});

// LifeOrientation
export const createOrientationSchema = z.object({
  title: sanitizedString(200),
  description: optionalSanitizedString(1000),
});

export const updateOrientationSchema = z.object({
  title: sanitizedString(200).optional(),
  description: optionalSanitizedString(1000),
});

// Mandala
export const createMandalaSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  quarter: z.number().int().min(1).max(4),
  centerTheme: z.string().max(200).optional(),
});

export const updateMandalaCellSchema = z.object({
  title: z
    .string()
    .transform(sanitize)
    .pipe(z.string().max(200))
    .optional(),
  memo: optionalSanitizedString(500),
  orientationId: z.string().cuid().nullable().optional(),
  bucketItemId: z.string().cuid().nullable().optional(),
});

// Calendar query
export const calendarQuerySchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/)
    .transform(Number)
    .pipe(z.number().int().min(2000).max(2100)),
  month: z
    .string()
    .regex(/^([1-9]|1[0-2])$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(12)),
});
