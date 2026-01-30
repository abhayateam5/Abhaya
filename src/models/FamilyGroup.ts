import mongoose, { Schema, Document, Model } from 'mongoose';

export interface FamilyGroupDocument extends Document {
    name: string;
    code: string;
    members: Array<{
        userId: string;
        name: string;
        phone: string;
        photo?: string;
        role: 'admin' | 'member';
        lastLocation?: { latitude: number; longitude: number; timestamp: Date };
        safetyScore?: number;
        isOnline: boolean;
    }>;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const FamilyMemberSchema = new Schema(
    {
        userId: { type: String, required: true },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        photo: { type: String },
        role: { type: String, enum: ['admin', 'member'], default: 'member' },
        lastLocation: {
            latitude: { type: Number },
            longitude: { type: Number },
            timestamp: { type: Date },
        },
        safetyScore: { type: Number },
        isOnline: { type: Boolean, default: false },
    },
    { _id: false }
);

const FamilyGroupSchema = new Schema<FamilyGroupDocument>(
    {
        name: { type: String, required: true, trim: true },
        code: { type: String, required: true, unique: true, uppercase: true },
        members: [FamilyMemberSchema],
        createdBy: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

FamilyGroupSchema.index({ code: 1 });
FamilyGroupSchema.index({ 'members.userId': 1 });
FamilyGroupSchema.index({ createdBy: 1 });

const FamilyGroup: Model<FamilyGroupDocument> =
    mongoose.models.FamilyGroup || mongoose.model<FamilyGroupDocument>('FamilyGroup', FamilyGroupSchema);

export default FamilyGroup;
