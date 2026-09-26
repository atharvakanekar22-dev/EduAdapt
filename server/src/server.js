"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
let DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/eduadapt';
const startServer = async () => {
    try {
        let mongoServer = null;
        // Fallback to in-memory DB if no real URL provided or local mongod is not running
        if (DATABASE_URL.includes('localhost')) {
            console.log('Starting in-memory MongoDB for development/demo...');
            mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
            DATABASE_URL = mongoServer.getUri();
        }
        await mongoose_1.default.connect(DATABASE_URL);
        console.log('Connected to MongoDB at', DATABASE_URL);
        if (mongoServer) {
            console.log('Seeding memory database...');
            const { seedDatabase } = await Promise.resolve().then(() => __importStar(require('./utils/seed')));
            await seedDatabase();
        }
        app_1.default.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map