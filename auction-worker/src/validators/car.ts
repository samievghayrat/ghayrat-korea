import { z } from "zod";

export const carSchema = z.object({
  id: z.string().optional(),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  price: z.number().positive(),
  mileage: z.number().int().nonnegative(),
  transmission: z.enum(["Automatic", "Manual"]),
  fuelType: z.enum(["Gasoline", "Diesel", "Hybrid", "Electric"]),
  engineTier: z.string().optional(),
  engineVolume: z.string().optional(),
  image: z.string().url(),
  images: z.array(z.string().url()).optional(),
  auctionDate: z.string(),
  lotNumber: z.string(),
  location: z.string(),
  condition: z.enum(["Excellent", "Good", "Fair"]),
  startingBid: z.number().positive(),
  firstRegDate: z.string().optional(),
  color: z.string().optional(),
  vin: z.string().optional(),
});

export const carQuerySchema = z.object({
  brand: z.string().optional(),
  fuelType: z.enum(["Gasoline", "Diesel", "Hybrid", "Electric"]).optional(),
  transmission: z.enum(["Automatic", "Manual"]).optional(),
  condition: z.enum(["Excellent", "Good", "Fair"]).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minYear: z.coerce.number().int().optional(),
  maxYear: z.coerce.number().int().optional(),
  showResults: z.string().optional(),
  limit: z.coerce.number().int().positive().default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export type CarInput = z.infer<typeof carSchema>;
export type CarQuery = z.infer<typeof carQuerySchema>;
