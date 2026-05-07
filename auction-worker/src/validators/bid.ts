import { z } from "zod";

export const bidRequestSchema = z.object({
  carId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  maxBid: z.number().positive(),
  message: z.string().optional(),
});

export type BidRequestInput = z.infer<typeof bidRequestSchema>;
