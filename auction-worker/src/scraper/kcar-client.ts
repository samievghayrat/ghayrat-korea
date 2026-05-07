const BASE_URL = "https://www.kcarauction.com";
const LOGIN_URL = `${BASE_URL}/kcar/user/user_logincheck_ajax.do`;
const CONFIRM_URL = `${BASE_URL}/kcar/user/user_confirm_ajax.do`;
const LIST_URL = `${BASE_URL}/kcar/auction/getAuctionCarList_ajax.do`;
const THUMBNAIL_URL = `${BASE_URL}/auction/getThumbnail_ajax.do`;
const IMAGE_BASE = `${BASE_URL}/auction/IMAGE_UPLOAD/CAR/`;
const PAGE_SIZE = 50;

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
  Origin: BASE_URL,
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Dest": "empty",
};

function randomDelay(minMs: number, maxMs: number): Promise<void> {
  const ms = minMs + Math.floor(Math.random() * (maxMs - minMs));
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface InspectionData {
  accidentHistory: string;    // e.g. "무사고" or "사고"
  specialNotes: string;       // 특이사항 (UNQUS field)
  warnings: string[];         // ★-marked warnings extracted from UNQUS
  exteriorCount: number;      // EX_CNT — number of exterior items
  carPoint: string;           // Car condition point (e.g. "4")
  carPointGrade: string;      // Car point grade (e.g. "A")
}

export interface KCarRawCar {
  CAR_ID: string;
  MNUFTR_NM: string;
  MODEL_NM: string;
  CAR_NM: string;
  FORM_YR: string;
  FST_REG_DT: string;
  EXBIT_SEQ: string;
  CNO: string;
  AUC_STRT_PRC: string;
  SCSBID_PRC: string;
  MILG: string;
  GBOX_DCD: string;
  FUEL_TYPE_NM: string;
  DSPLC: string;
  AUC_CD: string;
  AUC_STAT_NM: string;
  GRD_LCSF_NM: string;
  GRD_SCSF_NM: string;
  THUMBNAIL: string;
  THUMBNAIL_MOBILE: string;
  AUC_PLC_NM: string;
  AUC_STRT_END_DATETIME: string;
  EXTERIOR_COLOR_NM: string;
  GRADE: string;
  [key: string]: string;
}

/**
 * Parse engine displacement (cc) from car name or grade.
 * Examples: "디젤 2.0 2WD" → "2000", "가솔린 1.6T" → "1600", "3.5 V6" → "3500"
 */
export function parseEngineVolume(carNm: string, gradeLcsf: string): string | null {
  const text = `${carNm} ${gradeLcsf}`;
  // Match patterns like "2.0", "1.6T", "3.5", "2.2", "1.5 터보"
  const match = text.match(/(\d+\.\d+)\s*[TtLl터]?/);
  if (match) {
    const liters = parseFloat(match[1]);
    if (liters > 0.5 && liters < 10) {
      return String(Math.round(liters * 1000));
    }
  }
  // Match patterns like "1600cc", "2000cc"
  const ccMatch = text.match(/(\d{3,4})\s*cc/i);
  if (ccMatch) {
    return ccMatch[1];
  }
  // Electric cars
  if (/전기|EV|Electric/i.test(text)) {
    return "EV";
  }
  return null;
}

/**
 * Parse inspection data from listing API fields.
 */
export function parseInspectionFromListing(raw: KCarRawCar): InspectionData | null {
  const unqus = raw.UNQUS || "";
  const jindanExList = raw.JINDAN_EX_LIST || "";
  const exCnt = parseInt(raw.EX_CNT || "0", 10);
  const carPoint = raw.CAR_POINT || "";
  const carPointGrade = raw.CAR_POINT2 || "";

  // Extract ★-marked warnings from UNQUS
  const warnings: string[] = [];
  const warningRegex = /★([^★]+)★/g;
  let wm;
  while ((wm = warningRegex.exec(unqus)) !== null) {
    const w = wm[1].replace(/<[^>]+>/g, "").trim();
    if (w && !warnings.includes(w)) warnings.push(w);
  }

  // Clean UNQUS for display (remove HTML tags)
  const specialNotes = unqus.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

  if (!jindanExList && !specialNotes && exCnt === 0 && !carPoint) {
    return null;
  }

  return {
    accidentHistory: jindanExList || "",
    specialNotes,
    warnings,
    exteriorCount: exCnt,
    carPoint,
    carPointGrade,
  };
}

export class KCarClient {
  private cookies: string[] = [];

  private buildCookieHeader(): string {
    return this.cookies.join("; ");
  }

  getCookieHeader(): string {
    return this.buildCookieHeader();
  }

  private extractCookies(response: Response): void {
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        const cookiePair = value.split(";")[0];
        // Update or add cookie
        const cookieName = cookiePair.split("=")[0];
        this.cookies = this.cookies.filter((c) => !c.startsWith(cookieName + "="));
        this.cookies.push(cookiePair);
      }
    });
  }

  async login(userId: string, userPw: string): Promise<void> {
    // Step 1: Login
    const loginRes = await fetch(LOGIN_URL, {
      method: "POST",
      headers: {
        ...BROWSER_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ user_id: userId, user_pw: userPw }).toString(),
      redirect: "manual",
    });

    this.extractCookies(loginRes);

    const loginBody = (await loginRes.json().catch(() => ({}))) as { successYn?: string };
    if (loginBody.successYn !== "Y") {
      throw new Error(`KCar login failed: successYn=${loginBody.successYn}`);
    }

    if (!this.cookies.some((c) => c.startsWith("JSESSIONID="))) {
      throw new Error("KCar login failed: no JSESSIONID cookie");
    }

    // Step 2: Agree to bid terms
    await randomDelay(2000, 3500);
    const confirmRes = await fetch(CONFIRM_URL, {
      method: "POST",
      headers: {
        ...BROWSER_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: this.buildCookieHeader(),
      },
      body: new URLSearchParams({ bid_agree_modal: "Y" }).toString(),
    });
    this.extractCookies(confirmRes);
  }

  async fetchAllCars(pageType: "dCfm" | "wCfm"): Promise<KCarRawCar[]> {
    if (this.cookies.length === 0) {
      throw new Error("Not logged in. Call login() first.");
    }

    const aucType = pageType === "dCfm" ? "daily" : "weekly";
    const refererPage = pageType === "dCfm" ? "daily_auction" : "weekly_auction";
    const allCars: KCarRawCar[] = [];

    // Fetch all lanes (A, B, C, etc.)
    const lanes = ["A", "B", "C", "D", "E", "F", "G", "H"];
    for (const lane of lanes) {
    let startRnum = 1;
    let hasMore = true;

    while (hasMore) {
      const formData = new URLSearchParams({
        AUC_TYPE: aucType,
        PAGE_TYPE: pageType,
        LANE_TYPE: lane,
        START_RNUM: String(startRnum),
        PAGE_CNT: String(PAGE_SIZE),
        SRC_OPT: "sncar",
        MNUFTR_CD: "",
        MODEL_GRP_CD: "",
        MODEL_CD: "",
        ORDER: "",
        OPTION_CD: "",
        FORM_YR_ST: "",
        FORM_YR_ED: "",
        AUC_START_PRC_ST: "",
        AUC_START_PRC_ED: "",
        MILG_ST: "",
        MILG_ED: "",
        CNO: "",
        FUEL_CD: "",
        GBOX_DCD: "",
        COLOR_CD: "",
        CAR_TYPE: "",
        CARMD_CD: "",
        TO_DATE: "",
        FROM_DATE: "",
        CAR_STAT_CD: "",
        AUC_SEQ: "",
        TODAY: "",
        IPTCAR_DCD: "",
        START_DATE: "",
        END_DATE: "",
        AUC_PLC_CD: "",
      });

      const response = await fetch(LIST_URL, {
        method: "POST",
        headers: {
          ...BROWSER_HEADERS,
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Accept: "application/json, text/javascript, */*; q=0.01",
          "X-Requested-With": "XMLHttpRequest",
          Referer: `${BASE_URL}/kcar/auction/${refererPage}/colAuction.do?PAGE_TYPE=${pageType}`,
          Cookie: this.buildCookieHeader(),
        },
        body: formData.toString(),
      });

      this.extractCookies(response);

      if (!response.ok) {
        // Lane might not exist — skip it instead of crashing
        hasMore = false;
        break;
      }

      const data = (await response.json()) as { CAR_LIST?: KCarRawCar[] };
      const cars = data.CAR_LIST || [];
      allCars.push(...cars);

      if (cars.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        startRnum += 1;
        await randomDelay(800, 1500);
      }
    }

    await randomDelay(500, 1000);
    }

    return allCars;
  }

  /** Fetch all image URLs for a single car via getThumbnail_ajax.do */
  async fetchCarImages(carId: string): Promise<string[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(THUMBNAIL_URL, {
      signal: controller.signal,
      method: "POST",
      headers: {
        ...BROWSER_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        Cookie: this.buildCookieHeader(),
      },
      body: new URLSearchParams({ CAR_ID: carId }).toString(),
    }).finally(() => clearTimeout(timer));

    this.extractCookies(response);

    if (!response.ok) {
      return [];
    }

    const data = (await response.json().catch(() => ({}))) as {
      THUMBNAIL?: Array<{
        THUM_WEB_PATH?: string;
        THUM_ID?: string;
        THUM_EXT?: string;
        [key: string]: string | number | undefined;
      }>;
      [key: string]: unknown;
    };

    const list = data.THUMBNAIL || [];
    if (list.length === 0) return [];

    return list
      .filter((item) => item.THUM_WEB_PATH && item.THUM_ID && item.THUM_EXT)
      .map((item) => `${IMAGE_BASE}${item.THUM_WEB_PATH}${item.THUM_ID}_1180${item.THUM_EXT}`);
  }
}
