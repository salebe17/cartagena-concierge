import { z } from "zod";

export const ServiceRequestSchema = z.object({
  id: z.string().uuid().optional(),
  requester_id: z.string().uuid(),
  service_type: z.string().min(3),
  description: z.string().min(10),
  status: z
    .enum(["pending", "accepted", "completed", "cancelled"])
    .default("pending"),
  address: z.string(),
  offered_price: z.number().positive(),
  accepted_bid_id: z.string().uuid().optional().nullable(),
  images: z.array(z.string().url()).optional(),
});

export const BidSchema = z.object({
  id: z.string().uuid().optional(),
  request_id: z.string().uuid(),
  technician_id: z.string().uuid(),
  amount: z.number().positive(),
  status: z.enum(["pending", "accepted", "rejected"]).default("pending"),
});

export type ServiceRequestInput = z.infer<typeof ServiceRequestSchema>;
export type BidInput = z.infer<typeof BidSchema>;
