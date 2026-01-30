import mongoose, { Schema, Document, Model } from 'mongoose';

export interface UserDocument extends Document {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'tourist' | 'police' | 'admin';
    photo?: string;
    nationality?: string;
    passportNumber?: string;
    aadharNumber?: string;
    emergencyContacts?: Array<{ name: string; phone: string; relationship: string }>;
    itinerary?: Array<{ destination: string; startDate: Date; endDate: Date; notes?: string }>;
    safetyScore: number;
    digitalIdHash?: string;
    rfidTag?: string;
    badgeNumber?: string;
    department?: string;
    rank?: string;
    isActive: boolean;
    isVerified: boolean;
    lastActive: Date;
    createdAt: Date;
    updatedAt: Date;
}

const EmergencyContactSchema = new Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        relationship: { type: String, required: true },
    },
    { _id: false }
);

const ItineraryItemSchema = new Schema(
    {
        destination: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        notes: { type: String },
    },
    { _id: false }
);

const UserSchema = new Schema<UserDocument>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        phone: { type: String, required: true, trim: true },
        password: { type: String, required: true, select: false },
        role: { type: String, enum: ['tourist', 'police', 'admin'], default: 'tourist' },
        photo: { type: String },
        nationality: { type: String },
        passportNumber: { type: String },
        aadharNumber: { type: String },
        emergencyContacts: [EmergencyContactSchema],
        itinerary: [ItineraryItemSchema],
        safetyScore: { type: Number, default: 75, min: 0, max: 100 },
        digitalIdHash: { type: String },
        rfidTag: { type: String },
        badgeNumber: { type: String },
        department: { type: String },
        rank: { type: String },
        isActive: { type: Boolean, default: true },
        isVerified: { type: Boolean, default: false },
        lastActive: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ passportNumber: 1 }, { sparse: true });
UserSchema.index({ badgeNumber: 1 }, { sparse: true });

UserSchema.virtual('displayName').get(function () {
    return this.name;
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

const User: Model<UserDocument> =
    mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

export default User;
