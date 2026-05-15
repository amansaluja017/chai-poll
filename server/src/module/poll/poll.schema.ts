import mongoose from "mongoose";
import type { Poll } from "../../common/types/types.ts";

const pollSchema = new mongoose.Schema<Poll>({
    title: {
        type: String,
        required: [true, "Title is required"],
        minLength: [5, "Title must be at least 5 characters long"],
        maxLength: [100, "Title must be at most 100 characters long"]
    },
    description: {
        type: String,
        minLength: [10, "Description must be at least 10 characters long"],
        maxLength: [1000, "Description must be at most 1000 characters long"]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Creator is required"]
    },
    totalVotes: {
        type: Number,
        default: 0
    },
    expiry: {
        type: Date,
        required: [true, "Expiry is required"],
        default: () => new Date(Date.now() + 30 * 60 * 1000)
    },
    isAuthenticationRequired: {
        type: Boolean,
        default: false
    },
    questions: {
        type: [
            {
                question: {
                    type: String,
                    required: [true, "Question is required"]
                },
                questionType: {
                    type: String,
                    enum: ["TEXT", "CHOICE"],
                    required: [true, "Question type is required"]
                },
                isRequired: {
                    type: Boolean,
                    default: false
                },
                options: {
                    type: [
                        {
                            option: {
                                type: String,
                                required: [true, "Option is required"]
                            },
                            votes: {
                                type: Number,
                                default: 0
                            }
                        }
                    ]
                },
                textResponses: {
                    type: [String],
                    default: []
                }
            }
        ],
        required: [true, "Questions are required"]
    },
    status: {
        type: String,
        enum: ["live", "completed", "published"],
        default: "live"
    }
}, { timestamps: true });

pollSchema.index({ title: 1 });

export default mongoose.model<Poll>("Poll", pollSchema);
