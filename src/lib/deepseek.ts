import type { Entry, ThemeAnalysis } from '../types';

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

const SYSTEM_PROMPT = `你是用户的思考伙伴。用户用语音记录每天的思考,你的任务是跨越多天的记录,提炼他反复在想的主题,并追踪每个主题下他的观点是怎么随时间演变的。

要求:
- 忠实。只根据记录里实际出现的内容总结,不要编造、不要替他下结论。
- 用他自己的说法和框架,不要套用外部理论或华丽辞藻。
- 语言简单精准,不要修辞、不要比喻、不要自造术语。
- 找出真正反复出现、对他重要的主题;偶尔提一次的不算主题。
- 演变只在观点确实有推进或转变时记录,不要为了凑数硬编。
- 全部用中文。

只输出一个 JSON 对象,不要任何额外文字,结构如下:
{
  "overview": "对这段时间整体思考的一句话概览",
  "themes": [
    {
      "title": "主题名称,简短",
      "summary": "这个主题是关于什么的,1-2 句",
      "core_view": "用户在这个主题上当前的核心观点或立场",
      "evolution": [
        { "date": "YYYY-MM-DD", "thought": "当时的想法,或相比之前的转变" }
      ],
      "open_questions": ["用户在这个主题上还没想清楚的问题"],
      "entry_refs": ["相关记录的 id"]
    }
  ]
}
themes 按重要性排序,evolution 按时间从早到晚排列。`;

function formatDate(ms: number): string {
  const d = new Date(ms);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function buildUserPrompt(entries: Entry[]): string {
  const chronological = [...entries].sort((a, b) => a.createdAt - b.createdAt);
  const lines = chronological.map(
    (e) => `[${formatDate(e.createdAt)} | id:${e.id}]\n${e.text}`,
  );
  return `以下是我的思考记录,按时间从早到晚排列。请提炼我反复在想的主题,并追踪每个主题下我的观点是怎么随时间演变的。\n\n${lines.join('\n\n')}`;
}

interface DeepSeekResponse {
  choices?: { message?: { content?: string } }[];
}

export async function analyzeThemes(
  entries: Entry[],
  apiKey: string,
  model: string,
): Promise<ThemeAnalysis> {
  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(entries) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 8000,
      stream: false,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`DeepSeek 接口报错 ${res.status}：${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as DeepSeekResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('模型没有返回内容,请重试。');

  let parsed: { overview?: string; themes?: ThemeAnalysis['themes'] };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('模型返回的不是有效 JSON,请重试或换个模型。');
  }

  return {
    overview: parsed.overview ?? '',
    themes: parsed.themes ?? [],
    analyzedAt: Date.now(),
    entryCount: entries.length,
  };
}
