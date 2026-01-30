import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface AlertDocument extends Document {
    type: 'sos' | 'geofence' | 'anomaly' | 'health' | 'silent';
    status: 'active' | 'responding' | 'resolved' | 'false_alarm';
    priority: 'critical' | 'high' | 'medium' | 'low';
    touristId: Types.ObjectId;
    touristName: string;
    touristPhone: string;
    location: { type: 'Point'; coordinates: [number, number] };
    address?: string;
    description?: string;
    audioEvidence?: string;
    photos?: string[];
    respondingOfficerId?: Types.ObjectId;
    respondingOfficerName?: string;
    responseTime?: Date;
    resolutionTime?: Date;
    resolutionNotes?: string;
    blockchainHash?: string;
    createdAt: Date;
    updatedAt: Date;
}

const GeoLocationSchema = new Schema(
    {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
    },
    { _id: false }
);

const AlertSchema = new Schema<AlertDocument>(
    {
        type: {
            type: String,
            enum: ['sos', 'geofence', 'anomaly', 'health', 'silent'],
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'responding', 'resolved', 'false_alarm'],
            default: 'active',
        },
        priority: {
            type: String,
            enum: ['critical', 'high', 'medium', 'low'],
            default: 'high',
        },

        // Tourist info
        touristId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        touristName: { type: String, required: true },
        touristPhone: { type: String, required: true },

        // Location
        location: { type: GeoLocationSchema, required: true },
        address: { type: String },

        // Details
        description: { type: String },
        audioEvidence: { type: String },
        photos: [{ type: String }],

        // Response
        respondingOfficerId: { type: Schema.Types.ObjectId, ref: 'User' },
        respondingOfficerName: { type: String },
        responseTime: { type: Date },
        resolutionTime: { type: Date },
        resolutionNotes: { type: String },

        // Verification
        blockchainHash: { type: String },
    },
    {
        timestamps: true,
    }
);

// Geospatial index for location queries
AlertSchema.index({ location: '2dsphere' });

// Indexes for common queries
AlertSchema.index({ status: 1 });
AlertSchema.index({ priority: 1 });
AlertSchema.index({ touristId: 1 });
AlertSchema.index({ createdAt: -1 });
AlertSchema.index({ status: 1, priority: 1 });

const Alert: Model<AlertDocument> =
    mongoose.models.Alert || mongoose.model<AlertDocument>('Alert', AlertSchema);

export default Alert;
