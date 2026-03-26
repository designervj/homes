/**
 * SEED SCRIPT
 * Run with: node --import tsx scripts/seed.ts
 *
 * This seeds:
 * 1. A default super_admin user
 * 2. All 7 current Lucknow Homes projects as Property documents
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI not set in .env.local");
}

// ─── INLINE SCHEMAS (avoids import alias issues in scripts) ───────────────────

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: { type: String, select: false },
    role: { type: String, enum: ["super_admin", "admin", "agent"], default: "agent" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

const LocationSchema = new mongoose.Schema({ type: { type: String }, coordinates: [Number], address: String, locality: String, city: String, state: String, pincode: String, googleMapsUrl: String }, { _id: false });
const FinancialsSchema = new mongoose.Schema({ listedPrice: Number, priceType: String, pricePerSqft: Number, maintenanceCharges: Number, gstApplicable: Boolean, homeLoanAvailable: Boolean, approvedBanks: [String], isNegotiable: Boolean }, { _id: false });
const SizeLayoutSchema = new mongoose.Schema({ builtUpArea: Number, carpetArea: Number, superBuiltUpArea: Number, plotArea: Number, plotDimensions: String, areaUnit: String, bedrooms: Number, bathrooms: Number, balconies: Number, parkingAvailable: Boolean, parkingType: String, parkingSlots: Number }, { _id: false });
const SpecificationsSchema = new mongoose.Schema({ category: String, propertyType: String, transactionType: String, bhkConfig: String, possessionStatus: String, facingDirection: String, propertyAge: String, availabilityDate: Date }, { _id: false });
const FeaturesSchema = new mongoose.Schema({ amenities: [String], isGatedCommunity: Boolean, isVastuCompliant: Boolean, powerBackup: String, waterSupply: String }, { _id: false });
const LegalInfoSchema = new mongoose.Schema({ ownershipType: String, zoningType: String, reraRegistered: Boolean, reraId: String, titleClearance: String, encumbranceStatus: String }, { _id: false });
const BrokeragePolicySchema = new mongoose.Schema({ listedBy: String, isNegotiable: Boolean, documentationSupport: Boolean, shortlistingSupport: Boolean, siteVisitAvailability: String }, { _id: false });
const NearbyPlaceSchema = new mongoose.Schema({ name: String, category: String, distanceMinutes: Number, distanceKm: Number }, { _id: false });
const MediaAssetSchema = new mongoose.Schema({ url: String, type: String, caption: String, isCover: Boolean, order: Number }, { _id: false });

const PropertySchema = new mongoose.Schema(
  {
    title: String, slug: { type: String, unique: true }, description: String,
    developerName: String, projectName: String, tagline: String,
    status: { type: String, default: "active" },
    location: LocationSchema, specifications: SpecificationsSchema,
    sizeLayout: SizeLayoutSchema, financials: FinancialsSchema,
    features: FeaturesSchema, legalInfo: LegalInfoSchema,
    brokeragePolicy: BrokeragePolicySchema,
    mediaAssets: [MediaAssetSchema], nearbyPlaces: [NearbyPlaceSchema],
    isFeatured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    enquiryCount: { type: Number, default: 0 },
    createdBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);
PropertySchema.index({ "location": "2dsphere" });

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const properties = [
  // ── 1. Okas Enclave ──────────────────────────────────────────────────────
  {
    title: "Okas Enclave – Premium Residential Plots in Sushant Golf City",
    slug: "okas-enclave",
    description: "Pardos OKAS Enclave is a 6.46-acre plotted development project located in Sushant Golf City, Lucknow. It consists of plot sizes ranging from 112.5 sq.m. to 284.64 sq.m. with well-planned green areas, community facilities, and commercial shops within the project. Strategically located on the Sushant Golf City Hi-Tech Township, it offers great social infrastructure with leading schools, hospitals, and entertainment centres in its vicinity.",
    developerName: "Pardos Developers Pvt. Ltd.",
    projectName: "Okas Enclave",
    tagline: "Nature meets modern living in Sushant Golf City",
    status: "active",
    isFeatured: true,
    location: {
      type: "Point",
      coordinates: [80.9462, 26.8467],
      address: "Sushant Golf City, Sultanpur Road",
      locality: "Sushant Golf City",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226030",
    },
    specifications: {
      category: "Residential",
      propertyType: "Plot",
      transactionType: "Sale",
      possessionStatus: "Ready to Move",
      propertyAge: "0-5 Years",
    },
    sizeLayout: {
      plotArea: 112.5,
      plotDimensions: "112.5 sq.m. – 284.64 sq.m.",
      areaUnit: "sqm",
      parkingAvailable: true,
    },
    financials: {
      listedPrice: 5625000,
      priceType: "total",
      pricePerSqft: 5000,
      gstApplicable: false,
      homeLoanAvailable: true,
      approvedBanks: ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank"],
    },
    features: {
      amenities: [
        "Green Area", "Wide Internal Roads", "Swimming Pool",
        "Rainwater Harvesting", "Jogging Track", "Children Play Area",
        "Yoga Park", "24x7 Security", "Gated Community", "Street Lights",
      ],
      isGatedCommunity: true,
      waterSupply: "24x7",
      powerBackup: "Partial",
    },
    legalInfo: {
      ownershipType: "Freehold",
      zoningType: "Residential",
      reraRegistered: true,
      reraId: "UPRERAPRJ12345",
      titleClearance: "Clear",
      encumbranceStatus: "Encumbrance Free",
    },
    brokeragePolicy: {
      listedBy: "Agent",
      isNegotiable: true,
      documentationSupport: true,
      shortlistingSupport: true,
      siteVisitAvailability: "Weekdays / Weekends / By Appointment",
    },
    nearbyPlaces: [
      { name: "HCL IT Park", category: "IT Parks", distanceMinutes: 5 },
      { name: "Lulu Mall", category: "Malls & Multiplex", distanceMinutes: 9 },
      { name: "Medanta Hospital", category: "Hospitals", distanceMinutes: 8 },
      { name: "DPS School", category: "Schools & Colleges", distanceMinutes: 10 },
      { name: "GD Goenka School", category: "Schools & Colleges", distanceMinutes: 5 },
      { name: "Charbagh Railway Station", category: "Key Landmarks", distanceMinutes: 25 },
      { name: "Airport", category: "Key Landmarks", distanceMinutes: 22 },
      { name: "Phoenix Palassio Mall", category: "Malls & Multiplex", distanceMinutes: 14 },
      { name: "Super Speciality Cancer Institute", category: "Hospitals", distanceMinutes: 6 },
    ],
    mediaAssets: [
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/11/gallery-1.jpg", type: "image", isCover: true, order: 1 },
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/11/gallery-2.jpg", type: "image", order: 2 },
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/11/gallery-3.jpg", type: "image", order: 3 },
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/11/gallery-4.jpg", type: "image", order: 4 },
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/11/plot-layout.jpeg", type: "floorplan", order: 5 },
    ],
  },

  // ── 2. Attalika Palms ────────────────────────────────────────────────────
  {
    title: "Attalika Palms – Premium Villas & Resale Plots",
    slug: "attalika-palms",
    description: "Attalika Palms is a premium residential development offering luxury villas and resale plots opposite DLF Garden City in Pursaini, Lucknow. Designed for those who seek a blend of comfort, privacy, and prestige, the project offers spacious 3-4 BHK villas with modern amenities in a gated community setting.",
    developerName: "Attalika Developers",
    projectName: "Attalika Palms",
    tagline: "Premium villas in a gated community setting",
    status: "active",
    isFeatured: true,
    location: {
      type: "Point",
      coordinates: [80.9980, 26.8120],
      address: "Pursaini, Opposite DLF Garden City",
      locality: "Pursaini",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226010",
    },
    specifications: {
      category: "Residential",
      propertyType: "Villa",
      transactionType: "Sale",
      bhkConfig: "4 BHK",
      possessionStatus: "Ready to Move",
      propertyAge: "0-5 Years",
    },
    sizeLayout: {
      builtUpArea: 1450,
      areaUnit: "sqft",
      bedrooms: 4,
      bathrooms: 4,
      balconies: 2,
      parkingAvailable: true,
      parkingType: "Covered",
      parkingSlots: 2,
    },
    financials: {
      listedPrice: 6500000,
      priceType: "total",
      pricePerSqft: 4500,
      maintenanceCharges: 2500,
      maintenancePeriod: "monthly",
      gstApplicable: false,
      homeLoanAvailable: true,
      approvedBanks: ["SBI", "HDFC Bank", "ICICI Bank"],
    },
    features: {
      amenities: [
        "Swimming Pool", "Gym", "Clubhouse", "Garden", "Jogging Track",
        "Children Play Area", "24x7 Security", "CCTV", "Gated Community",
        "Power Backup", "Wide Internal Roads",
      ],
      isGatedCommunity: true,
      isVastuCompliant: true,
      waterSupply: "24x7",
      powerBackup: "Full",
    },
    legalInfo: {
      ownershipType: "Freehold",
      zoningType: "Residential",
      reraRegistered: true,
      reraId: "UPRERAPRJ23456",
      titleClearance: "Clear",
      encumbranceStatus: "Encumbrance Free",
    },
    brokeragePolicy: {
      listedBy: "Agent",
      isNegotiable: true,
      documentationSupport: true,
      shortlistingSupport: true,
      siteVisitAvailability: "By Appointment",
    },
    nearbyPlaces: [
      { name: "DLF Garden City", category: "Key Landmarks", distanceMinutes: 2 },
      { name: "Airport", category: "Key Landmarks", distanceMinutes: 15 },
      { name: "City Centre Mall", category: "Malls & Multiplex", distanceMinutes: 12 },
      { name: "Ram Manohar Lohia Hospital", category: "Hospitals", distanceMinutes: 10 },
    ],
    mediaAssets: [
      { url: "/images/attalika-palms-cover.jpg", type: "image", isCover: true, order: 1 },
    ],
  },

  // ── 3. Stellar Okas Golf View ─────────────────────────────────────────────
  {
    title: "Stellar Okas Golf View – Premium Resale Plots in Sushant Golf City",
    slug: "stellar-okas-golf-view",
    description: "Stellar Okas Golf View offers premium residential resale plots in Sector-H of the prestigious Sushant Golf City. With plots valued up to ₹3.80 Cr, these are among the most sought-after investment assets in Lucknow's high-growth corridor. The development features wide roads, manicured greenery, and direct proximity to the Lucknow Golf Club.",
    developerName: "Stellar Okas Developers",
    projectName: "Stellar Okas Golf View",
    tagline: "Golf view plots in Lucknow's most prestigious address",
    status: "active",
    isFeatured: true,
    location: {
      type: "Point",
      coordinates: [80.9510, 26.8440],
      address: "Sector-H, Sushant Golf City",
      locality: "Sushant Golf City",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226030",
    },
    specifications: {
      category: "Residential",
      propertyType: "Plot",
      transactionType: "Sale",
      possessionStatus: "Ready to Move",
      propertyAge: "0-5 Years",
    },
    sizeLayout: {
      plotArea: 300,
      areaUnit: "sqm",
      parkingAvailable: true,
    },
    financials: {
      listedPrice: 38000000,
      priceType: "total",
      gstApplicable: false,
      homeLoanAvailable: true,
      approvedBanks: ["SBI", "HDFC Bank", "ICICI Bank", "Punjab National Bank"],
    },
    features: {
      amenities: [
        "Golf Course View", "Wide Internal Roads", "Green Area",
        "Street Lights", "24x7 Security", "Gated Community",
        "Rainwater Harvesting", "Underground Utilities",
      ],
      isGatedCommunity: true,
      waterSupply: "24x7",
      powerBackup: "Partial",
    },
    legalInfo: {
      ownershipType: "Freehold",
      zoningType: "Residential",
      reraRegistered: true,
      reraId: "UPRERAPRJ34567",
      titleClearance: "Clear",
      encumbranceStatus: "Encumbrance Free",
    },
    brokeragePolicy: {
      listedBy: "Agent",
      isNegotiable: true,
      documentationSupport: true,
      shortlistingSupport: true,
      siteVisitAvailability: "Weekdays / Weekends",
    },
    nearbyPlaces: [
      { name: "Lucknow Golf Club", category: "Key Landmarks", distanceMinutes: 5 },
      { name: "HCL IT Park", category: "IT Parks", distanceMinutes: 7 },
      { name: "Lulu Mall", category: "Malls & Multiplex", distanceMinutes: 10 },
      { name: "Medanta Hospital", category: "Hospitals", distanceMinutes: 10 },
      { name: "Airport", category: "Key Landmarks", distanceMinutes: 22 },
    ],
    mediaAssets: [
      { url: "/images/stellar-okas-cover.jpg", type: "image", isCover: true, order: 1 },
    ],
  },

  // ── 4. Kailasha Enclave ───────────────────────────────────────────────────
  {
    title: "Kailasha Enclave – Township Plots on Sultanpur Road near IT City",
    slug: "kailasha-enclave",
    description: "Kailasha Enclave is a thoughtfully planned residential township offering resale plots on Sultanpur Road, adjacent to the booming IT City corridor in Lucknow. The project benefits from excellent connectivity to major IT parks, educational institutions, and upcoming infrastructure developments, making it an attractive long-term investment.",
    developerName: "Kailasha Developers",
    projectName: "Kailasha Enclave",
    tagline: "Your gateway to Lucknow's IT City corridor",
    status: "active",
    isFeatured: false,
    location: {
      type: "Point",
      coordinates: [80.9700, 26.7900],
      address: "Sultanpur Road, Near IT City",
      locality: "Sultanpur Road",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226011",
    },
    specifications: {
      category: "Residential",
      propertyType: "Plot",
      transactionType: "Sale",
      possessionStatus: "Ready to Move",
      propertyAge: "0-5 Years",
    },
    sizeLayout: {
      plotArea: 200,
      areaUnit: "sqm",
      parkingAvailable: true,
    },
    financials: {
      listedPrice: 4000000,
      priceType: "total",
      gstApplicable: false,
      homeLoanAvailable: true,
      approvedBanks: ["SBI", "HDFC Bank"],
    },
    features: {
      amenities: [
        "Wide Internal Roads", "Street Lights", "Green Area",
        "24x7 Security", "Gated Community", "Children Play Area",
      ],
      isGatedCommunity: true,
      waterSupply: "Municipal",
      powerBackup: "None",
    },
    legalInfo: {
      ownershipType: "Freehold",
      zoningType: "Residential",
      reraRegistered: true,
      reraId: "UPRERAPRJ45678",
      titleClearance: "Clear",
    },
    brokeragePolicy: {
      listedBy: "Agent",
      isNegotiable: true,
      documentationSupport: true,
      shortlistingSupport: true,
      siteVisitAvailability: "By Appointment",
    },
    nearbyPlaces: [
      { name: "IT City Lucknow", category: "IT Parks", distanceMinutes: 5 },
      { name: "Airport", category: "Key Landmarks", distanceMinutes: 18 },
      { name: "Amity University", category: "Schools & Colleges", distanceMinutes: 15 },
    ],
    mediaAssets: [
      { url: "/images/kailasha-enclave-cover.jpg", type: "image", isCover: true, order: 1 },
    ],
  },

  // ── 5. Greenberry Signature ───────────────────────────────────────────────
  {
    title: "Greenberry Signature – High-Rise Apartments in Vrindavan Yojana",
    slug: "greenberry-signature",
    description: "Greenberry Signature is a premium high-rise residential apartment complex located in Vrindavan Yojana, Awas Vikas, Lucknow. Offering spacious 2 and 3 BHK configurations starting at ₹5,200 per sq. ft., the project is designed for those seeking contemporary urban living with all modern amenities in a well-connected neighbourhood.",
    developerName: "Greenberry Group",
    projectName: "Greenberry Signature",
    tagline: "Contemporary high-rise living in Vrindavan Yojana",
    status: "active",
    isFeatured: true,
    location: {
      type: "Point",
      coordinates: [80.9050, 26.8700],
      address: "Vrindavan Yojana, Awas Vikas",
      locality: "Vrindavan Yojana",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226029",
    },
    specifications: {
      category: "Residential",
      propertyType: "Apartment",
      transactionType: "Sale",
      bhkConfig: "3 BHK",
      furnishingStatus: "Unfurnished",
      possessionStatus: "Ready to Move",
      propertyAge: "0-5 Years",
      totalFloors: "10-20",
    },
    sizeLayout: {
      builtUpArea: 1200,
      carpetArea: 980,
      superBuiltUpArea: 1450,
      areaUnit: "sqft",
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      parkingAvailable: true,
      parkingType: "Covered",
      parkingSlots: 1,
    },
    financials: {
      listedPrice: 7440000,
      priceType: "per_sqft",
      pricePerSqft: 5200,
      maintenanceCharges: 3000,
      maintenancePeriod: "monthly",
      gstApplicable: false,
      homeLoanAvailable: true,
      approvedBanks: ["SBI", "HDFC Bank", "ICICI Bank", "Bank of Baroda"],
    },
    features: {
      amenities: [
        "Lift", "Power Backup", "Swimming Pool", "Gym", "Clubhouse",
        "Garden", "Jogging Track", "Children Play Area", "24x7 Security",
        "CCTV", "Intercom", "Gated Community", "Visitor Parking",
      ],
      isGatedCommunity: true,
      isVastuCompliant: true,
      waterSupply: "24x7",
      powerBackup: "Full",
    },
    legalInfo: {
      ownershipType: "Freehold",
      zoningType: "Residential",
      reraRegistered: true,
      reraId: "UPRERAPRJ56789",
      titleClearance: "Clear",
      encumbranceStatus: "Encumbrance Free",
      occupancyCertificate: "Available",
    },
    brokeragePolicy: {
      listedBy: "Agent",
      isNegotiable: true,
      documentationSupport: true,
      shortlistingSupport: true,
      siteVisitAvailability: "Weekdays / Weekends / By Appointment",
    },
    nearbyPlaces: [
      { name: "City Montessori School", category: "Schools & Colleges", distanceMinutes: 8 },
      { name: "Sanjay Gandhi PGI", category: "Hospitals", distanceMinutes: 15 },
      { name: "Hazratganj", category: "Key Landmarks", distanceMinutes: 20 },
      { name: "Lulu Mall", category: "Malls & Multiplex", distanceMinutes: 18 },
    ],
    mediaAssets: [
      { url: "/images/greenberry-signature-cover.jpg", type: "image", isCover: true, order: 1 },
    ],
  },

  // ── 6. Lavanya Enclave ────────────────────────────────────────────────────
  {
    title: "Lavanya Enclave – Premium 2 & 3 BHK Flats & Residential Plots",
    slug: "lavanya-enclave",
    description: "Lavanya Enclave is a fully developed residential project located at the service lane of Amar Shaheed Path in Aurangabad Jagir, near Bijnor Road and Ramabai Ambedkar Maidan. The project offers both residential plots and 2-3 BHK apartments with excellent connectivity to Kanpur Road and Amar Shaheed Path. Along a 45-metre wide road, the project is enclosed within a well-secured gated community. This is an LDA, RERA and SBI approved project.",
    developerName: "Lavanya Developers",
    projectName: "Lavanya Enclave",
    tagline: "LDA & RERA approved — luxury at an affordable address",
    status: "active",
    isFeatured: true,
    location: {
      type: "Point",
      coordinates: [80.8900, 26.8100],
      address: "Amar Shaheed Path, Aurangabad Jagir, Bijnor Road",
      locality: "Aurangabad Jagir",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226012",
    },
    specifications: {
      category: "Residential",
      propertyType: "Apartment",
      transactionType: "Sale",
      bhkConfig: "3 BHK",
      furnishingStatus: "Unfurnished",
      possessionStatus: "Ready to Move",
      facingDirection: "East",
      propertyAge: "0-5 Years",
    },
    sizeLayout: {
      builtUpArea: 1330,
      carpetArea: 976,
      areaUnit: "sqft",
      bedrooms: 3,
      bathrooms: 2,
      balconies: 1,
      parkingAvailable: true,
      parkingType: "Open",
      parkingSlots: 1,
    },
    financials: {
      listedPrice: 8645000,
      priceType: "per_sqft",
      pricePerSqft: 6500,
      gstApplicable: false,
      homeLoanAvailable: true,
      approvedBanks: ["SBI", "HDFC Bank", "ICICI Bank", "LDA Approved"],
    },
    features: {
      amenities: [
        "Badminton Court", "Landscape Garden", "Jogging Track",
        "Internal Street Lights", "Security Cabin", "CCTV Camera",
        "Children Play Area", "Gated Community",
      ],
      isGatedCommunity: true,
      isVastuCompliant: true,
      waterSupply: "24x7",
      powerBackup: "Partial",
    },
    legalInfo: {
      ownershipType: "Freehold",
      zoningType: "Residential",
      reraRegistered: true,
      reraId: "UPRERAPRJ67890",
      titleClearance: "Clear",
      encumbranceStatus: "Encumbrance Free",
    },
    brokeragePolicy: {
      listedBy: "Agent",
      isNegotiable: true,
      documentationSupport: true,
      shortlistingSupport: true,
      siteVisitAvailability: "Weekdays / Weekends / By Appointment / Anytime",
    },
    nearbyPlaces: [
      { name: "Chaudhary Charan Singh Airport", category: "Key Landmarks", distanceKm: 3 },
      { name: "Railway Station", category: "Key Landmarks", distanceKm: 5 },
      { name: "Kanpur Road", category: "Key Landmarks", distanceKm: 2 },
      { name: "Mall Palm Top", category: "Malls & Multiplex", distanceKm: 0.5 },
      { name: "Ramabai Ambedkar Maidan", category: "Key Landmarks", distanceKm: 0.2 },
    ],
    mediaAssets: [
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/03/IMG_20220227_185611.jpg", type: "image", isCover: true, order: 1 },
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/03/IMG_20220227_185541.jpg", type: "image", order: 2 },
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/03/IMG_20220301_180342.jpg", type: "image", order: 3 },
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/02/0001-1-scaled.jpg", type: "floorplan", order: 4 },
    ],
  },

  // ── 7. Vikas Vihar ────────────────────────────────────────────────────────
  {
    title: "Vikas Vihar – Mixed Residential Development in Lucknow",
    slug: "vikas-vihar",
    description: "Vikas Vihar is a mixed residential development project in the Lucknow metropolitan region, offering a combination of residential plots and apartments designed for both first-time homebuyers and investors looking for long-term value appreciation.",
    developerName: "Vikas Developers",
    projectName: "Vikas Vihar",
    tagline: "Affordable mixed residential living in Lucknow",
    status: "active",
    isFeatured: false,
    location: {
      type: "Point",
      coordinates: [80.9200, 26.8350],
      address: "Lucknow Metropolitan Region",
      locality: "Lucknow",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226001",
    },
    specifications: {
      category: "Residential",
      propertyType: "Plot",
      transactionType: "Sale",
      possessionStatus: "Ready to Move",
    },
    sizeLayout: {
      plotArea: 150,
      areaUnit: "sqm",
      parkingAvailable: true,
    },
    financials: {
      listedPrice: 3000000,
      priceType: "total",
      gstApplicable: false,
      homeLoanAvailable: true,
      approvedBanks: ["SBI", "HDFC Bank"],
    },
    features: {
      amenities: [
        "Wide Internal Roads", "Green Area", "Street Lights", "Security",
      ],
      isGatedCommunity: true,
      waterSupply: "Municipal",
    },
    legalInfo: {
      ownershipType: "Freehold",
      zoningType: "Residential",
      reraRegistered: true,
      reraId: "UPRERAPRJ78901",
      titleClearance: "Clear",
    },
    brokeragePolicy: {
      listedBy: "Agent",
      isNegotiable: true,
      documentationSupport: true,
      shortlistingSupport: true,
      siteVisitAvailability: "By Appointment",
    },
    nearbyPlaces: [
      { name: "Lucknow City Centre", category: "Key Landmarks", distanceMinutes: 20 },
    ],
    mediaAssets: [
      { url: "/images/vikas-vihar-cover.jpg", type: "image", isCover: true, order: 1 },
    ],
  },
];

// ─── SEED FUNCTION ────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Starting database seed...\n");

  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log("✅ Connected to MongoDB\n");

  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  const Property = mongoose.models.Property || mongoose.model("Property", PropertySchema);

  // ── Clear existing data ──────────────────────────────────────────────────
  await Property.deleteMany({});
  console.log("🗑️  Cleared existing properties");

  const existingAdmin = await User.findOne({ email: "admin@homes.in" });
  if (!existingAdmin) {
    // ── Create default admin ─────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash("Admin@Homes2025!", 12);
    await User.create({
      name: "Admin User",
      email: "admin@homes.in",
      phone: "+91 88746 25303",
      password: hashedPassword,
      role: "super_admin",
      isActive: true,
    });
    console.log("👤 Created admin user: admin@homes.in / Admin@Homes2025!");
    console.log("   ⚠️  Change the password immediately after first login!\n");
  } else {
    console.log("👤 Admin user already exists — skipping\n");
  }

  // ── Seed properties ──────────────────────────────────────────────────────
  for (const property of properties) {
    const created = await Property.create(property);
    console.log(`🏠 Created: ${created.title}`);
    console.log(`   Slug: /projects/${created.slug}`);
    console.log(`   RERA: ${(property.legalInfo as { reraId: string }).reraId}`);
    console.log(`   Price: ₹${((property.financials as { listedPrice: number }).listedPrice / 100000).toFixed(0)} Lac onwards\n`);
  }

  console.log("\n✅ Seed complete!");
  console.log(`📦 ${properties.length} properties seeded into MongoDB (homes database)`);
  console.log("🔑 Admin login: admin@homes.in / Admin@Homes2025!\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
