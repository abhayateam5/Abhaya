import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface SafetyScoreDocument extends Document {
    userId: Types.ObjectId;
    score: number;
    factors: {
        locationSafety: number;
        timeOfDay: number;
        crowdDensity: number;
        weatherConditions: number;
        networkConnectivity: number;
        routeCompliance: number;
    };
    level: 'excellent' | 'good' | 'moderate' | 'low' | 'critical';
    timestamp: Date;
}

const SafetyFactorsSchema = new Schema(
    {
        locationSafety: { type: Number, required: true, min: 0, max: 100 },
        timeOfDay: { type: Number, required: true, min: 0, max: 100 },
        crowdDensity: { type: Number, required: true, min: 0, max: 100 },
        weatherConditions: { type: Number, required: true, min: 0, max: 100 },
        networkConnectivity: { type: Number, required: true, min: 0, max: 100 },
        routeCompliance: { type: Number, required: true, min: 0, max: 100 },
    },
    { _id: false }
);

const SafetyScoreSchema = new Schema<SafetyScoreDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        score: { type: Number, required: true, min: 0, max: 100 },
        factors: { type: SafetyFactorsSchema, required: true },
        level: {
            type: String,
            enum: ['excellent', 'good', 'moderate', 'low', 'critical'],
            required: true,
        },
        timestamp: { type: Date, default: Date.now },
    },
    {
        timestamps: false,
    }
);

SafetyScoreSchema.index({ userId: 1, timestamp: -1 });
SafetyScoreSchema.index({ timestamp: -1 });
SafetyScoreSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

const SafetyScore: Model<SafetyScoreDocument> =
    mongoose.models.SafetyScore || mongoose.model<SafetyScoreDocument>('SafetyScore', SafetyScoreSchema);

export default SafetyScore;
