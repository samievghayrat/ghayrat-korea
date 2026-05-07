import { type KCarRawCar, parseEngineVolume, parseInspectionFromListing } from "./kcar-client";

export function mapTransmission(gboxDcd: string): "Automatic" | "Manual" {
  const manual = ["M", "MT", "수동"];
  return manual.includes(gboxDcd?.toUpperCase?.() || gboxDcd) ? "Manual" : "Automatic";
}

export function mapFuelType(fuelTypeNm: string): "Gasoline" | "Diesel" | "Hybrid" | "Electric" | "LPG" {
  if (!fuelTypeNm) return "Gasoline";
  const lower = fuelTypeNm.toLowerCase();
  if (fuelTypeNm.includes("디젤") || lower.includes("diesel")) return "Diesel";
  if (fuelTypeNm.includes("하이브리드") || lower.includes("hybrid")) return "Hybrid";
  if (fuelTypeNm.includes("전기") || lower.includes("electric")) return "Electric";
  if (lower.includes("lpg") || lower.includes("lpi") || fuelTypeNm.includes("가스")) return "LPG";
  return "Gasoline";
}

export function mapDriveType(carNm: string, gradeLcsf: string): string | null {
  const text = `${carNm} ${gradeLcsf}`;
  if (/\bAWD\b/i.test(text)) return "AWD";
  if (/\b4WD\b/i.test(text) || /사륜/.test(text)) return "4WD";
  if (/\b2WD\b/i.test(text)) return "2WD";
  if (/\bFWD\b/i.test(text) || /전륜/.test(text)) return "FWD";
  if (/\bRWD\b/i.test(text) || /후륜/.test(text)) return "RWD";
  return null;
}

export function mapAuctionDate(dateStr: string): string {
  if (!dateStr) return "";
  // Handle "YYYY-MM-DD HH:mm~..." format
  if (dateStr.length >= 10 && dateStr[4] === "-") {
    return dateStr.slice(0, 10);
  }
  // Handle "YYYYMMDD" format
  if (/^\d{8}$/.test(dateStr)) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }
  return dateStr;
}

export function mapKCarToSchema(raw: KCarRawCar, imageUrl: string, imageUrls?: string[], displacement?: string | null, vin?: string | null, driveType?: string | null) {
  const year = parseInt(raw.FORM_YR, 10) || new Date().getFullYear();
  // AUC_STRT_PRC is in won (e.g. "10600000"), convert to 만원 (10000 won units)
  const priceWon = parseFloat(raw.AUC_STRT_PRC) || 0;
  const priceManWon = priceWon / 10000;
  const grade = [raw.GRD_LCSF_NM, raw.GRD_SCSF_NM].filter(Boolean).join(" ") || null;

  // Auction result: final price and sold status
  const scsbidPrc = parseFloat(raw.SCSBID_PRC) || 0;
  let finalPrice: number | null = null;
  let soldStatus: string | null = null;
  if (scsbidPrc > 0) {
    finalPrice = scsbidPrc / 10000; // convert won to 만원
    soldStatus = "sold";
  } else if (raw.AUC_STAT_NM && /유찰|불낙|취소/.test(raw.AUC_STAT_NM)) {
    // 출품마감 means "submission closed" (car is waiting for auction), NOT unsold
    soldStatus = "unsold";
  }

  // Use R2-hosted multi-images if available, otherwise fall back to R2 thumbnail
  const images = imageUrls && imageUrls.length > 0
    ? imageUrls
    : null;

  return {
    id: raw.CAR_ID,
    brand: raw.MNUFTR_NM || "Unknown",
    model: raw.MODEL_NM || "Unknown",
    year,
    price: priceManWon,
    mileage: parseInt(raw.MILG?.replace(/,/g, ""), 10) || 0,
    transmission: mapTransmission(raw.GBOX_DCD),
    fuelType: mapFuelType(raw.FUEL_TYPE_NM),
    engineVolume: displacement || raw.ENGDISPMNT || raw.DSPLC || parseEngineVolume(raw.CAR_NM || "", raw.GRD_LCSF_NM || "") || null,
    engineTier: raw.CAR_NM || null,
    image: imageUrl,
    images,
    auctionDate: mapAuctionDate(raw.AUC_STRT_END_DATETIME || raw.FST_REG_DT),
    lotNumber: raw.EXBIT_SEQ || raw.CAR_ID,
    location: raw.AUC_PLC_NM || "KCar Auction",
    condition: "Good" as const,
    startingBid: priceManWon,
    thumbnailPath: raw.THUMBNAIL_MOBILE || null,
    kcarId: raw.CAR_ID,
    auctionCode: raw.AUC_CD || null,
    kcarStatus: raw.AUC_STAT_NM || null,
    grade,
    exbitSeq: raw.EXBIT_SEQ || null,
    cno: raw.CNO || null,
    firstRegDate: raw.FST_REG_DT || null,
    color: raw.EXTERIOR_COLOR_NM || null,
    vin: vin || null,
    driveType: mapDriveType(raw.CAR_NM || "", raw.GRD_LCSF_NM || "") || driveType || null,
    finalPrice,
    soldStatus,
    updatedAt: new Date().toISOString(),
  };
}
