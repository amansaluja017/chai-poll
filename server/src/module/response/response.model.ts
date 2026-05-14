import mongoose, { Schema } from "mongoose";
import type { Response } from "../../common/types/types";

const responseSchema = new Schema<Response>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    poll: {
        type: Schema.Types.ObjectId,
        ref: "Poll",
        required: true
    },
    response: {
        type: Schema.Types.Mixed,
        required: true
    },
    guestId: {
        type: String,
        default: null
    }
}, { timestamps: true });

export default mongoose.model<Response>("Response", responseSchema);
