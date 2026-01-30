import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface LocationDocument extends Document {
    userId: Types.ObjectId;
    userType: 'tourist' | 'police';
    location: { type: 'Point'; coordinates: [number, number] };
    accuracy?: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    inSafeZone: boolean;
    currentZone?: string;
    safetyLevel: 'safe' | 'caution' | 'danger';
    deviceId?: string;
    batteryLevel?: number;
    vitals?: { heartRate?: number; spO2?: number; temperature?: number; steps?: number };
    timestamp: Date;
}

const GeoPointSchema = new Schema(
    {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
    },
    { _id: false }
);

const VitalSignsSchema = new Schema(
    {
        heartRate: { type: Number },
        spO2: { type: Number },
        temperature: { type: Number },
        steps: { type: Number },
    },
    { _id: false }
);

const LocationSchema = new Schema<LocationDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        userType: { type: String, enum: ['tourist', 'police'], required: true },
        location: { type: GeoPointSchema, required: true },
        accuracy: { type: Number },
        altitude: { type: Number },
        speed: { type: Number },
        heading: { type: Number },
        inSafeZone: { type: Boolean, default: true },
        currentZone: { type: String },
        safetyLevel: { type: String, enum: ['safe', 'caution', 'danger'], default: 'safe' },
        deviceId: { type: String },
        batteryLevel: { type: Number },
        vitals: { type: VitalSignsSchema },
        timestamp: { type: Date, default: Date.now },
    },
    {
        timestamps: false,
    }
);

LocationSchema.index({ location: '2dsphere' });
LocationSchema.index({ userId: 1, timestamp: -1 });
LocationSchema.index({ timestamp: -1 });
LocationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

const Location: Model<LocationDocument> =
    mongoose.models.Location || mongoose.model<LocationDocument>('Location', LocationSchema);

export default Location;
