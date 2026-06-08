import os
import json
import httpx
import traceback
from dotenv import load_dotenv
from openai import AsyncOpenAI, AsyncAzureOpenAI

# ---------------------------------------------------------------------------
# [대학생 학습 및 디버깅 가이드]
# 이 서비스는 Job-Ora 인공지능 면접 엔진의 핵심입니다.
# K-Statra 프로젝트에서 학습했던 Azure OpenAI(GPT-4o)와 Anthropic(Claude 3.5 Sonnet)을
# 하나의 공통 인터페이스로 추상화하여, 설정 파일(.env)의 LLM_PROVIDER 값에 따라
# 동적으로 다른 AI 서비스를 호출할 수 있도록 라우팅 디자인 패턴(Routing Pattern)이 적용되었습니다.
# ---------------------------------------------------------------------------

load_dotenv()

# --- 환경변수 로드 ---
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "azure").lower()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# --- 디버그 로그 (대학생 개발자들을 위한 서버 콘솔 안내용) ---
print(f"[Hermes Engine] Initializing. Selected LLM Provider: {LLM_PROVIDER.upper()}")
if LLM_PROVIDER == "azure" and (not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_API_KEY):
    print("⚠️  [Warning] Azure OpenAI가 선택되었으나 endpoint 또는 api_key가 설정되지 않았습니다.")
elif LLM_PROVIDER == "anthropic" and not ANTHROPIC_API_KEY:
    print("⚠️  [Warning] Anthropic Claude가 선택되었으나 api_key가 설정되지 않았습니다.")
elif LLM_PROVIDER == "openai" and not OPENAI_API_KEY:
    print("⚠️  [Warning] OpenAI가 선택되었으나 api_key가 설정되지 않았습니다.")


def clean_and_parse_json(raw_text: str) -> dict:
    """
    [안전한 JSON 파싱 헬퍼 함수]
    LLM(특히 Response Format을 네이티브로 지원하지 않는 경우)이 가끔 JSON 앞뒤에
    마크다운 포맷(```json ... ```)을 입혀서 답변하는 버그를 처리합니다.
    대학생 개발자분들이 API 응답 오류 디버깅 시 자주 마주하는 이슈를 미리 예방하기 위해 작성되었습니다.
    """
    text = raw_text.strip()
    # 마크다운 백틱 코드 블록 기호 제거
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        print(f"[Parser Error] Failed to parse JSON. Raw text: \n{raw_text}")
        raise e


async def call_azure_openai(messages: list, response_format_json: bool = True) -> str:
    """
    Azure OpenAI(GPT-4o) API를 호출하는 비동기 함수입니다.
    openai SDK 내의 AsyncAzureOpenAI를 사용하여 비동기 논블로킹(Non-blocking) 통신을 보장합니다.
    """
    # [대학생 디버깅 팁]
    # 환경변수 AZURE_OPENAI_ENDPOINT가 배포판 전체 URL(예: .../openai/deployments/gpt-4o) 형태로
    # 설정되어 있는 경우, SDK가 내부적으로 경로를 중복해서 덧붙여 404 Resource Not Found 에러가 발생합니다.
    # 이를 방지하기 위해 base URL(예: https://k-statra.services.ai.azure.com)만 추출하는 안전 로직을 구현했습니다.
    endpoint = AZURE_OPENAI_ENDPOINT
    if "/openai" in endpoint:
        endpoint = endpoint.split("/openai")[0]

    client = AsyncAzureOpenAI(
        azure_endpoint=endpoint,
        api_key=AZURE_OPENAI_API_KEY,
        api_version="2024-02-01"
    )
    
    kwargs = {
        "model": "gpt-4o",  # Azure 디플로이먼트명(Deployment Name)과 매칭되어야 합니다.
        "messages": messages,
        "temperature": 0.7
    }
    
    if response_format_json:
        kwargs["response_format"] = {"type": "json_object"}
        
    response = await client.chat.completions.create(**kwargs)
    return response.choices[0].message.content


async def call_standard_openai(messages: list, response_format_json: bool = True) -> str:
    """
    공식 OpenAI Direct (GPT-4o) API를 호출하는 비동기 함수입니다.
    """
    client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    
    kwargs = {
        "model": "gpt-4o",
        "messages": messages,
        "temperature": 0.7
    }
    
    if response_format_json:
        kwargs["response_format"] = {"type": "json_object"}
        
    response = await client.chat.completions.create(**kwargs)
    return response.choices[0].message.content


async def call_anthropic_claude(system_prompt: str, messages: list) -> str:
    """
    Anthropic Claude 3.5 Sonnet API를 호출하는 비동기 함수입니다.
    이 함수는 라이브러리 추가 설치를 방지하고 의존성을 가볍게 유지하기 위해,
    이미 설치되어 있는 httpx 패키지를 이용해 비동기 HTTP POST 요청을 보냅니다.
    """
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY가 누락되었습니다.")
        
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    
    # Anthropic API는 system prompt를 messages 내부가 아닌 루트 파라미터로 요구합니다.
    payload = {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 2000,
        "system": system_prompt,
        "messages": messages,
        "temperature": 0.7
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers=headers,
            json=payload,
            timeout=40.0
        )
        
        # 에러 응답인 경우 예외 발생시켜 디버깅을 원활하게 돕습니다.
        if response.status_code != 200:
            print(f"[Anthropic Http Error] Status Code: {response.status_code}, Body: {response.text}")
            response.raise_for_status()
            
        response_data = response.json()
        return response_data["content"][0]["text"]


# ===========================================================================
# [핵심 비즈니스 로직 API 구현]
# ===========================================================================

async def get_interview_questions(jd_text: str, resume_text: str, company_name: str, ideal_profile: str) -> dict:
    """
    지원자의 이력서와 채용공고를 기반으로 Hermes AI HR 에이전트가 3~5개의 초기 면접 질문을 자동 생성합니다.
    """
    # 1. Hermes의 에이전트 성격 및 규격을 주입하는 System Prompt 설계
    system_prompt = (
        f"당신은 {company_name}의 글로벌 전문 채용 에이전트이자 수석 HR 면접관인 'Hermes(헤르메스)'입니다.\n"
        f"우리는 회사의 인재상('{ideal_profile}') 및 핵심 가치에 근거하여 지원자를 엄격히 평가합니다.\n"
        f"당신은 {company_name}의 면접관 스타일과 기업 문화 가치관에 완벽하게 몰입해야 합니다 (예: Meta는 실생활 영향력 및 속도 검증, Toyota는 장인정신 및 품질 우선주의).\n"
        "당신의 임무는 지원자의 이력서(Resume)와 채용 공고(Job Description)를 철저히 대조 분석하여, "
        "그들이 회사 문화 및 기술 요구사항에 완벽히 부합하는지 검증할 수 있는 3~5개의 핵심 압박 면접 질문을 생성하는 것입니다.\n\n"
        "각 질문마다 연습 면접 시 활용할 '답변 가이드 팁(tips)'과 '권장 키워드 리스트(keywords)'를 함께 생성해 주십시오. "
        "답변 가이드 팁은 이 회사 고유의 인재상/조직문화 가치를 답변에 어떻게 녹여내야 하는지 구체적으로 조언해야 합니다.\n\n"
        "반드시 아래 JSON 스키마 형식으로만 답변을 반환해 주십시오 (마크다운 등 추가 텍스트 없이 오직 JSON만 반환):\n"
        '{\n'
        '  "questions": [\n'
        '    {\n'
        '      "question": "질문 내용",\n'
        '      "tips": "이 회사 문화(예: 혁신/협업 등)에 맞춘 구체적인 답변 방향 가이드",\n'
        '      "keywords": ["핵심키워드1", "핵심키워드2", "핵심키워드3"]\n'
        '    }\n'
        '  ]\n'
        '}'
    )
    
    user_prompt = f"Job Description:\n{jd_text}\n\nResume:\n{resume_text}"
    
    try:
        if LLM_PROVIDER == "azure":
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            raw_response = await call_azure_openai(messages, response_format_json=True)
            
        elif LLM_PROVIDER == "openai":
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            raw_response = await call_standard_openai(messages, response_format_json=True)
            
        elif LLM_PROVIDER == "anthropic":
            # Anthropic의 경우 role 매핑 (user만 허용되므로 system prompt는 call 함수 내부에서 전달)
            messages = [
                {"role": "user", "content": user_prompt}
            ]
            raw_response = await call_anthropic_claude(system_prompt, messages)
            
        else:
            raise ValueError(f"지원하지 않는 LLM_PROVIDER입니다: {LLM_PROVIDER}")
            
        print(f"[Hermes Engine] Questions generated successfully using {LLM_PROVIDER}.")
        return clean_and_parse_json(raw_response)
        
    except Exception as e:
        print(f"[Error] Failed to generate questions: {str(e)}")
        traceback.print_exc()
        return {"error": str(e), "questions": []}


async def get_followup_question(jd_text: str, resume_text: str, history: list, company_name: str, ideal_profile: str) -> dict:
    """
    대화 이력을 분석하여 지원자의 답변을 실시간 평가하고, 꼬리 질문을 생성하거나 면접 종료 여부를 판단합니다.
    """
    system_prompt = (
        f"당신은 {company_name}의 글로벌 전문 채용 에이전트이자 수석 HR 면접관인 'Hermes(헤르메스)'입니다.\n"
        f"우리는 회사의 인재상('{ideal_profile}') 및 핵심 가치에 근거하여 지원자를 엄격히 평가합니다.\n"
        f"당신은 {company_name}의 면접관 스타일과 기업 문화 가치관에 완벽하게 몰입해야 합니다 (예: Meta는 실생활 영향력 및 속도 검증, Toyota는 장인정신 및 품질 우선주의).\n"
        "지원자의 이력서, 채용 공고 및 지금까지의 면접 대화 기록(history)을 주의 깊게 분석하십시오.\n\n"
        "당신의 임무:\n"
        "1. 지원자의 마지막 답변 내용을 비판적으로 검증하고 평가(evaluation)하십시오. (잘한 부분과 아쉬운 부분을 구체적으로 짚어줄 것)\n"
        "2. 다음으로 이어갈 날카로운 꼬리 질문(next_question)을 하나 제안하십시오. 문화적 핏이나 기술적 깊이를 강하게 압박해야 합니다. 연습 모드를 위해 이 질문의 답변 가이드 팁(tips)과 추천 키워드(keywords)도 함께 제공하십시오.\n"
        "3. 지원자의 답변을 해당 기업의 인재상과 핵심 가치에 맞추어 훨씬 더 매끄럽고 완벽하게 작성한 모범 예시 답안(better_answer)을 구체적으로 구성해 제공하십시오. (is_finished가 true여도 지원자가 다음 면접 시 참고할 수 있도록 모범 답안을 반드시 작성해 주십시오.)\n"
        "4. 만약 대화가 충분히 진행되었고(보통 3~5회 왕복 후) 면접을 끝마칠 단계라고 판단되면 'is_finished'를 true로 설정하고, 최종 면접 총평을 'evaluation'에 길게 상세히 작성하십시오. (이 경우 'next_question'은 빈 문자열로 둡니다.)\n"
        "   - 이 경우, 5대 평가 지표(scores: technical[직무], communication[소통], problem_solving[문제해결], culture_fit[컬처핏], initiative[주도성])를 0~100점 사이로 채점해 주십시오.\n"
        "   - 또한, 지원 기업의 핵심 가치(idealCandidate 및 회사 이념 참고) 2~3가지를 각각 매칭 스코어와 이유(culture_fit_breakdown)로 세분화하여 분석해 주십시오.\n\n"
        "반드시 아래 JSON 스키마 형식으로만 답변을 반환해 주십시오 (추가 설명이나 마크다운 백틱 없이 오직 JSON만 반환):\n"
        '{\n'
        '  "next_question": "다음 질문 내용 또는 빈 문자열",\n'
        '  "evaluation": "지원자 답변에 대한 평가 피드백 또는 최종 면접 총평",\n'
        '  "better_answer": "지원자의 마지막 답변을 해당 기업 인재상에 맞춰서 더 완벽하게 교정한 모범 예시 답안",\n'
        '  "is_finished": true 또는 false,\n'
        '  "tips": "다음 질문 답변 가이드 팁 (is_finished가 true이면 빈 문자열)",\n'
        '  "keywords": ["키워드1", "키워드2"],\n'
        '  "scores": {\n'
        '    "technical": 85,\n'
        '    "communication": 90,\n'
        '    "problem_solving": 80,\n'
        '    "culture_fit": 95,\n'
        '    "initiative": 88\n'
        '  },\n'
        '  "culture_fit_breakdown": [\n'
        '    {\n'
        '      "value_name": "회사 인재상 중 핵심가치 1 (예: Move Fast)",\n'
        '      "score": 90,\n'
        '      "reason": "구체적인 사례를 통해 임팩트 위주로 증명한 행동을 높이 평가함"\n'
        '    }\n'
        '  ]\n'
        '}'
    )
    
    # 2. 메시지 기록 역할 매핑
    # 프론트엔드의 interviewer/candidate 역할을 OpenAI/Anthropic 규격인 assistant/user로 변환합니다.
    mapped_messages = []
    for msg in history:
        # interviewer -> assistant / candidate -> user
        api_role = "assistant" if msg["role"] == "interviewer" else ("user" if msg["role"] == "candidate" else msg["role"])
        mapped_messages.append({"role": api_role, "content": msg["content"]})
        
    context_message = f"Job Context (참고용):\nJob Description:\n{jd_text}\n\nResume:\n{resume_text}"
    
    try:
        if LLM_PROVIDER == "azure":
            # Context를 첫 System 메시지 바로 뒤에 추가하여 프롬프트 컨텍스트 창 최적화
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "system", "content": context_message}
            ] + mapped_messages
            raw_response = await call_azure_openai(messages, response_format_json=True)
            
        elif LLM_PROVIDER == "openai":
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "system", "content": context_message}
            ] + mapped_messages
            raw_response = await call_standard_openai(messages, response_format_json=True)
            
        elif LLM_PROVIDER == "anthropic":
            # Anthropic은 system prompt는 system 파라미터로 넘기며, 
            # messages 목록의 가장 첫부분에 참고용 컨텍스트를 배치합니다.
            messages = [
                {"role": "user", "content": context_message},
                {"role": "assistant", "content": "네, 확인했습니다. 면접자의 답변을 듣고 평가를 시작해 주세요."}
            ] + mapped_messages
            raw_response = await call_anthropic_claude(system_prompt, messages)
            
        else:
            raise ValueError(f"지원하지 않는 LLM_PROVIDER입니다: {LLM_PROVIDER}")
            
        print(f"[Hermes Engine] Followup evaluation complete using {LLM_PROVIDER}.")
        return clean_and_parse_json(raw_response)
        
    except Exception as e:
        print(f"[Error] Failed to get followup question: {str(e)}")
        traceback.print_exc()
        return {"error": str(e), "next_question": "", "evaluation": "에러가 발생하여 평가를 제공할 수 없습니다.", "is_finished": False}
