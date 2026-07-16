import OpenAI from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const files = [
  "부산_관광지.json",
  "부산_레포츠.json",
  "부산_문화시설.json",
  "부산_쇼핑.json",
  "부산_숙박.json",
  "부산_여행코스.json",
  "부산_축제공연행사.json",
];

async function loadData() {
  const results = await Promise.all(
    files.map(async (file) => {
      const res = await fetch(`/data/${file}`);

      if (!res.ok) {
        throw new Error(`${file} 로드 실패`);
      }

      return await res.json();
    })
  );

  return results;
}

// ======================
// 지역명 추출
// ======================
function extractRegion(message) {
    const regions = [
    "해운대",
    "광안리",
    "서면",
    "남포동",
    "송도",
    "기장",
    "영도",
    "다대포",
    "동래",
    "온천장",
    "부산역",
    "광복동",
    "송정",
    "수영",
    "연산",
  ];

  return regions.find((r) => message.includes(r)) || "";
}

// ======================
// 카테고리 추출
// ======================
function extractCategory(message) {
  if (message.includes("관광")) return "관광지";

  if (
    message.includes("숙소") ||
    message.includes("호텔") ||
    message.includes("펜션")
  )
    return "숙박";

  if (
    message.includes("축제") ||
    message.includes("공연") ||
    message.includes("행사")
  )
    return "축제공연행사";

  if (
    message.includes("쇼핑") ||
    message.includes("시장")
  )
    return "쇼핑";

  if (
    message.includes("문화")
  )
    return "문화시설";

  if (
    message.includes("레포츠") ||
    message.includes("액티비티")
  )
    return "레포츠";

  if (
    message.includes("코스")
  )
    return "여행코스";

  return "";
}

// ======================
// JSON 검색
// ======================
function searchData(allData, message) {

  const region = extractRegion(message);

  const category = extractCategory(message);

  const result = [];

  allData.forEach((data) => {

    if (!data.items) return;

    // 카테고리 선택
    if (category && data.contentType !== category) return;

    data.items.forEach((item) => {

      const title = item.title || "";
      const addr = item.addr1 || "";
      const tel = item.tel || "전화번호 정보 없음";

      // 지역 필터
      if (region) {

        if (
          !title.includes(region) &&
          !addr.includes(region)
        ) {
          return;
        }

      }

      result.push({
        종류: data.contentType,
        이름: title,
        주소: addr,
        전화: tel,
      });

    });

  });

    return result.slice(0, 10);

}
export async function sendMessage(message) {
  try {
    console.log("🚀 시작");

    const allData = await loadData();

    const searched = searchData(allData, message);

    const context = JSON.stringify(searched, null, 2);

if (searched.length === 0) {
    return `죄송합니다.

제공된 부산 관광 데이터에서 관련 정보를 찾을 수 없습니다.

예시 질문

• 해운대 관광지 추천

• 광안리 숙소 추천

• 부산 축제 알려줘`;
}

    console.log("🤖 GPT 요청 시작");

    const response = await client.responses.create({
  model: "gpt-5-mini",

  input: `
너는 'Busan Mate'라는 부산 여행 전문 AI 챗봇이다.

아래 JSON 데이터만 참고하여 답변한다.

=========================
${context}
=========================

사용자 질문
${message}

반드시 아래 규칙을 지켜라.

[규칙]

1. JSON에 있는 정보만 사용한다.

2. JSON에 없는 정보는 절대 생성하지 않는다.

3. 관련 데이터가 없으면

"죄송합니다.
제공된 부산 관광 데이터에서 관련 정보를 찾을 수 없습니다."

라고 답한다.

4. 추천할 경우 아래 형식을 반드시 사용한다.

📍 장소명

🏠 주소

☎️ 전화

📝 한 줄 설명

----------------------------

5. 전화번호가 없으면

"전화번호 정보 없음"

이라고 작성한다.

6. 한 줄 설명은
JSON에 있는 정보만 참고해서
간단히 작성한다.

7. 답변은 최대 3곳까지만 추천한다.

8. 말투는 친절한 여행 가이드처럼 한다.

9. 절대 Markdown 표를 사용하지 않는다.

10. 줄바꿈을 충분히 사용해서 보기 좋게 작성한다.
`,
});

    console.log("🎉 GPT 응답 완료");

    return response.output_text;
  } catch (error) {
    console.error("❌ 오류 발생", error);
    return "오류가 발생했습니다.";
  }
}