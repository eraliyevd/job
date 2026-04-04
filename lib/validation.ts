import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Auth primitives                                                     */
/* ------------------------------------------------------------------ */
export const phoneSchema = z
  .string().trim()
  .transform(v => v.replace(/[\s\-()+]/g, "").replace(/^998/, "+998").replace(/^8/, "+998"))
  .pipe(z.string().regex(/^\+998[0-9]{9}$/, "Telefon +998XXXXXXXXX formatida bo'lishi kerak"));

export const passwordSchema = z
  .string()
  .min(8,  "Kamida 8 belgi")
  .max(72, "72 belgidan oshmasin")
  .regex(/[A-Za-z]/, "Kamida bitta harf bo'lsin")
  .regex(/[0-9]/,    "Kamida bitta raqam bo'lsin");

export const nameSchema = z
  .string().trim()
  .min(2, "Kamida 2 ta harf").max(80, "80 ta harfdan oshmasin");

/* ------------------------------------------------------------------ */
/*  Auth schemas                                                        */
/* ------------------------------------------------------------------ */
export const RegisterSchema = z.object({ name: nameSchema, phone: phoneSchema, password: passwordSchema });
export const LoginSchema    = z.object({ phone: phoneSchema, password: z.string().min(1, "Parol kiriting") });

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Joriy parol kiriting"),
  newPassword:     passwordSchema,
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: "Parollar mos emas", path: ["confirmPassword"] });

/* ------------------------------------------------------------------ */
/*  Job schema                                                          */
/* ------------------------------------------------------------------ */
export const CreateJobSchema = z.object({
  title:       z.string().trim().min(3, "Sarlavha kamida 3 belgi").max(120, "Sarlavha 120 ta belgidan oshmasin"),
  description: z.string().trim().min(20, "Tavsif kamida 20 belgi"),
  location:    z.string().trim().min(2, "Manzil kiriting").max(100),
  phone:       phoneSchema,

  salaryMin:        z.number({ invalid_type_error: "Raqam kiriting" }).int().min(0).optional(),
  salaryMax:        z.number({ invalid_type_error: "Raqam kiriting" }).int().min(0).optional(),
  salaryNegotiable: z.boolean().default(false),

  ageMin: z.number({ invalid_type_error: "Raqam kiriting" }).int().min(14).max(80).optional(),
  ageMax: z.number({ invalid_type_error: "Raqam kiriting" }).int().min(14).max(80).optional(),

  workTime:   z.enum(["full-time", "part-time", "remote", "shift", "contract", "internship"], {
    required_error: "Ish turini tanlang",
  }),
  experience: z.enum(["no-exp", "1-3", "3-5", "5-plus"]).default("no-exp"),

  deadline: z.string().datetime({ offset: true }).optional().or(z.literal("")),
})
.refine(d => d.salaryNegotiable || !d.salaryMin || !d.salaryMax || d.salaryMin <= d.salaryMax, {
  message: "Minimal maosh maksimaldan katta bo'lishi mumkin emas",
  path: ["salaryMax"],
})
.refine(d => !d.ageMin || !d.ageMax || d.ageMin <= d.ageMax, {
  message: "Minimal yosh maksimaldan katta bo'lishi mumkin emas",
  path: ["ageMax"],
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
export function formatZodError(error: z.ZodError): Record<string, string> {
  return Object.fromEntries(error.errors.map(e => [e.path.join("."), e.message]));
}

export type RegisterInput       = z.infer<typeof RegisterSchema>;
export type LoginInput          = z.infer<typeof LoginSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type CreateJobInput      = z.infer<typeof CreateJobSchema>;
