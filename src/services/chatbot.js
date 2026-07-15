import OpenAI from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// JSON 파일 목록
const files = [
  "부산_관광지.json",
  "부산_레포츠.json",
  "부산_문화시설.json",
  "부산_쇼핑.json",
  "부산_숙박.json",
  "부산_여행코스.json",
  "부산_축제공연행사.json",
];

// JSON 불러오기
async function loadData() {
  console.log("📂 JSON 불러오는 중...");

  const results = await Promise.all(
    files.map(async (file) => {
      const res = await fetch(`/data/${file}`);

      if (!res.ok) {
        throw new Error(`${file} 불러오기 실패`);
      }

      return await res.json();
    })
  );

  console.log("✅ JSON 로드 완료");

  return results;
}

// 질문과 관련된 데이터 찾기
function searchData(allData, keyword) {
  console.log("🔍 검색 시작 :", keyword);

  const result = [];

  allData.forEach((data) => {
    if (!data.items) return;

    data.items.forEach((item) => {
      const text = JSON.stringify(item).toLowerCase();

      if (text.includes(keyword.toLowerCase())) {
        result.push({
          종류: data.contentType,
          이름: item.title,
          주소: item.addr1,
          전화: item.tel || "정보 없음",
        });
      }
    });
  });

  console.log("✅ 검색 결과 :", result.length);

  return result.slice(0, 15);
}

export async function sendMessage(message) {
  try {
    console.log("🚀 시작");

    const allData = await loadData();

    const searched = searchData(allData, message);

    const context =
      searched.length > 0
        ? JSON.stringify(searched, null, 2)
        : "관련 데이터를 찾지 못했습니다.";

    console.log("🤖 GPT 요청 시작");

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: `
너는 부산 여행 전문 AI 챗봇이다.

반드시 아래 데이터만 참고해서 답변해.

${context}

사용자 질문:
${message}

조건
- 친절하게 답변
- 데이터에 없는 내용은 추측하지 말 것
- 주소가 있으면 함께 알려줄 것
`,
    });

    console.log("🎉 GPT 응답 완료");

    return response.output_text;
  } catch (error) {
    console.error("❌ 오류 발생", error);
    return "오류가 발생했습니다.";
  }
}