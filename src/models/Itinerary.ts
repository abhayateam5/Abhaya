import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ItineraryDocument extends Document {
    userId: Types.ObjectId;
    title: string;
    destinations: DestinationDoc[];
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface DestinationDoc {
    id: string;
    name: string;
    address: string;
    location: { latitude: number; longitude: number };
    arrivalDate: Date;
    departureDate: Date;
    notes?: string;
    checkpoints?: CheckpointDoc[];
}

interface CheckpointDoc {
    id: string;
    time: Date;
    status: 'pending' | 'checked_in' | 'missed';
    notes?: string;
}

const CheckpointSchema = new Schema(
    {
        id: { type: String, required: true },
        time: { type: Date, required: true },
        status: { type: String, enum: ['pending', 'checked_in', 'missed'], default: 'pending' },
        notes: { type: String },
    },
    { _id: false }
);

const DestinationSchema = new Schema(
    {
        id: { type: String, required: true },
        name: { type: String, required: true },
        address: { type: String, required: true },
        location: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
        },
        arrivalDate: { type: Date, required: true },
        departureDate: { type: Date, required: true },
        notes: { type: String },
        checkpoints: [CheckpointSchema],
    },
    { _id: false }
);

const ItinerarySchema = new Schema<ItineraryDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        destinations: [DestinationSchema],
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

// Indexes
ItinerarySchema.index({ userId: 1 });
ItinerarySchema.index({ isActive: 1 });
ItinerarySchema.index({ startDate: 1, endDate: 1 });

const Itinerary: Model<ItineraryDocument> =
    mongoose.models.Itinerary || mongoose.model<ItineraryDocument>('Itinerary', ItinerarySchema);

export default Itinerary;
