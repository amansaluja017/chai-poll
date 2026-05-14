import { z } from "zod";
import BaseDto from "../../common/dto/base.dto.ts";


class createPollDto extends BaseDto {
    static schema: z.ZodObject = z.object({
        title: z.string().min(5).max(255),
        description: z.string().min(1).max(255).optional(),
        questions: z.array(
            z.object({
                question: z.string().min(1).max(255),
                questionType: z.enum(["TEXT", "CHOICE"]),
                isRequired: z.boolean().optional(),
                options: z.array(z.string()).min(2).max(10).optional(),
            })
        ).min(1).max(10),
        isAuthenticationRequired: z.boolean().optional(),
        expiry: z.number().optional(),
    })
}

class responsePollDto extends BaseDto {
    static schema: z.ZodRecord<z.ZodString, z.ZodString> = z.record(z.string(), z.string());
}

export { createPollDto, responsePollDto };
