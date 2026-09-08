const BASE_URL = "https://www.kcarauction.com";
const LOGIN_URL = `${BASE_URL}/kcar/user/user_logincheck_ajax.do`;
const CONFIRM_URL = `${BASE_URL}/kcar/user/user_confirm.do`;
const CONFIRM_OK_URL = `${BASE_URL}/kcar/user/user_confirm_ok.do`;
const LIST_URL = `${BASE_URL}/kcar/auction/getAuctionCarList_ajax.do`;
const THUMBNAIL_URL = `${BASE_URL}/auction/getThumbnail_ajax.do`;
const IMAGE_BASE = `${BASE_URL}/auction/IMAGE_UPLOAD/CAR/`;
const PAGE_SIZE = 50;

function isClaimPolicyPage(html: string): boolean {
  return html.includes("fnAgreeBid")
    && html.includes("동의안함")
    && html.includes("클레임 처리 불가내역");
}

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
    const headers = response.headers as Headers & { getSetCookie?: () => string[] };
    const combinedHeader = response.headers.get("set-cookie");
    const setCookieHeaders = headers.getSetCookie?.()
      ?? (combinedHeader
        ? combinedHeader.split(/,(?=\s*[!#$%&'*+.^_`|~0-9A-Za-z-]+=)/)
        : []);

    for (const value of setCookieHeaders) {
      const cookiePair = value.split(";")[0]?.trim();
      if (!cookiePair || !cookiePair.includes("=")) continue;
      const cookieName = cookiePair.split("=")[0];
      this.cookies = this.cookies.filter((cookie) => !cookie.startsWith(cookieName + "="));
      this.cookies.push(cookiePair);
    }
  }

  private async followRedirects(response: Response, maxRedirects = 5): Promise<Response> {
    let current = response;

    for (let redirectCount = 0; redirectCount < maxRedirects; redirectCount++) {
      if (current.status < 300 || current.status >= 400) return current;
      const location = current.headers.get("location");
      if (!location) return current;

      const nextUrl = new URL(location, current.url || BASE_URL).toString();
      current = await fetch(nextUrl, {
        method: "GET",
        headers: {
          ...BROWSER_HEADERS,
          Cookie: this.buildCookieHeader(),
          Referer: current.url || BASE_URL,
        },
        redirect: "manual",
      });
      this.extractCookies(current);
    }

    throw new Error("KCar confirmation exceeded the redirect limit");
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

    const loginText = await loginRes.text();
    const loginBody = (() => {
      try {
        return JSON.parse(loginText) as { successYn?: string; message?: string };
      } catch {
        return {} as { successYn?: string; message?: string };
      }
    })();
    if (loginBody.successYn !== "Y") {
      const contentType = loginRes.headers.get("content-type") || "unknown";
      const location = loginRes.headers.get("location") || "none";
      const message = loginBody.message?.replace(/\s+/g, " ").trim().slice(0, 160) || "none";
      throw new Error(
        `KCar login failed: status=${loginRes.status}, contentType=${contentType}, `
        + `successYn=${loginBody.successYn}, location=${location}, message=${message}`,
      );
    }

    if (!this.cookies.some((c) => c.startsWith("JSESSIONID="))) {
      throw new Error("KCar login failed: no JSESSIONID cookie");
    }

    // Step 2: Complete KCar's current post-login confirmation form.
    await randomDelay(2000, 3500);
    let confirmRes = await fetch(CONFIRM_URL, {
      method: "POST",
      headers: {
        ...BROWSER_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: this.buildCookieHeader(),
      },
      body: new URLSearchParams({
        user_id: userId,
        user_pw: userPw,
        i_sReturnUrl: "/kcar/main.do",
      }).toString(),
      redirect: "manual",
    });
    this.extractCookies(confirmRes);
    confirmRes = await this.followRedirects(confirmRes);

    if (!confirmRes.ok) {
      throw new Error(`KCar confirmation failed: ${confirmRes.status}`);
    }

    let confirmationHtml = await confirmRes.text();
    if (isClaimPolicyPage(confirmationHtml)) {
      // The business owner explicitly approved this exact recurring KCar claim
      // policy. Refuse to accept automatically if its identifying text changes.
      const policyText = confirmationHtml
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&quot;/gi, '"')
        .replace(/\s+/g, " ")
        .trim();
      const approvedPolicyMarkers = [
        "사전 검수(실차 확인)절차를 행하지 않는 클레임",
        "차령 만6년 경과",
        "주행거리 15만km이상",
        "옵션 / 외관 / 전자장치 / 소모품",
        "엔진,미션",
        "낙찰차량 출고 후",
        "동의하지 않는 경우 로그아웃됩니다",
      ];
      if (!approvedPolicyMarkers.every((marker) => policyText.includes(marker))) {
        throw new Error("KCar claim policy changed; renewed approval is required");
      }

      let agreementRes = await fetch(CONFIRM_OK_URL, {
        method: "POST",
        headers: {
          ...BROWSER_HEADERS,
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: this.buildCookieHeader(),
          Referer: CONFIRM_URL,
        },
        body: new URLSearchParams({ i_sReturnUrl: "/kcar/main.do" }).toString(),
        redirect: "manual",
      });
      this.extractCookies(agreementRes);
      agreementRes = await this.followRedirects(agreementRes);

      if (!agreementRes.ok) {
        throw new Error(`KCar agreement confirmation failed: ${agreementRes.status}`);
      }

      confirmationHtml = await agreementRes.text();
      if (isClaimPolicyPage(confirmationHtml)) {
        throw new Error("KCar claim-policy agreement was not accepted");
      }
    }
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
        throw new Error(`KCar auction list failed: ${response.status} (${pageType}/${lane})`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.toLowerCase().includes("json")) {
        throw new Error(`KCar auction session rejected (${pageType}/${lane})`);
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
