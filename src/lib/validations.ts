import { z } from "zod";

export const ServiceRequestSchema = z.object({
  id: z.string().uuid().optional(),
  requester_id: z.string().uuid(),
  service_type: z.string().min(3),
  description: z.string().min(10),
  status: z
    .enum(["pending", "accepted", "completed", "cancelled"])
    .default("pending"),
  address: z.string().optional(),
  offered_price: z.number().positive(),
  accepted_bid_id: z.string().uuid().optional().nullable(),
  images: z.array(z.string().url()).optional(),
  location_geom: z.any().optional(),
  deleted_at: z.date().optional().nullable(),
  version: z.number().int().default(1),
});

export const BidSchema = z.object({
  id: z.string().uuid().optional(),
  request_id: z.string().uuid(),
  technician_id: z.string().uuid(),
  amount: z.number().positive(),
  status: z.enum(["pending", "accepted", "rejected"]).default("pending"),
  deleted_at: z.date().optional().nullable(),
  version: z.number().int().default(1),
});

export type ServiceRequestInput = z.infer<typeof ServiceRequestSchema>;
export type BidInput = z.infer<typeof BidSchema>;
