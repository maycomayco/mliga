import { z } from "zod";

export const dinnerSchema = z.object({
  date: z.string().min(1, "La fecha es requerida"),
  attendeeIds: z.array(z.string()).min(1, "Al menos un asistente es requerido"),
});

export type DinnerInput = z.infer<typeof dinnerSchema>;

export type DinnerWithAttendees = {
  id: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  attendees: { user: { id: string; name: string | null } }[];
};