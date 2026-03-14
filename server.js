import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API 配置
const CONFIG = {
  gnews: {
    enabled: process.env.GNEWS_API_KEY ? true : false,
    apiKey: process.env.GNEWS_API_KEY,
    url: 'https://gnews.io/api/v4/top-headlines',
    categoryMap: {
      '科技': 'technology',
      '经济': 'business',
      '国际': 'world',
      '社会': 'general',
      '文化': 'science',
      '文明': 'general'
    }
  },
  juhe: {
    enabled: process.env.JUHE_API_KEY ? true : false,
    apiKey: process.env.JUHE_API_KEY,
    url: 'https://v.juhe.cn/toutiao/index',
    categoryMap: {
      '科技': 'tech',
      '经济': 'finance',
      '国际': 'world',
      '社会': 'social',
      '文化': 'culture',
      '文明': 'all'
    }
  },
  tianapi: {
    enabled: process.env.TIANAPI_API_KEY ? true : false,
    apiKey: process.env.TIANAPI_API_KEY,
    url: 'https://api.tianapi.com/social',
    categoryMap: {
      '科技': 'tech',
      '经济': 'finance',
      '国际': 'world',
      '社会': 'social',
      '文化': 'culture',
      '文明': 'social'
    }
  },
  alapi: {
    enabled: process.env.ALAPI_API_KEY ? true : false,
    apiKey: process.env.ALAPI_API_KEY,
    url: 'https://v2.alapi.cn/api/news/tech',
    categoryMap: {
      '科技': 'tech',
      '经济': 'finance',
      '国际': 'world',
      '社会': 'social',
      '文化': 'culture',
      '文明': 'tech'
    }
  },
  qwen: {
    enabled: process.env.QWEN_API_KEY ? true : false,
    apiKey: process.env.QWEN_API_KEY,
    model: 'qwen-plus',
    url: 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
  }
};

// 统一的新闻数据格式
function normalizeNews(data, source) {
  try {
    let newsItems = [];
    
    if (source === 'gnews') {
      newsItems = data.articles || [];
      return newsItems.map((item, index) => ({
        id: index,
        category: item.category || '国际',
        time: item.publishedAt ? new Date(item.publishedAt).toLocaleString('zh-CN', { hour: 'numeric', minute: 'numeric', hour12: false }) + '前' : '刚刚',
        source: item.source?.name || 'GNews',
        title: item.title || '无标题',
        summary: item.description || '',
        tags: item.tags || ['新闻'],
        importance: 3,
        url: item.url || '#'
      }));
    } else if (source === 'juhe') {
      newsItems = data.result?.data || [];
      return newsItems.map((item, index) => ({
        id: index,
        category: item.category || '国际',
        time: item.date ? new Date(item.date).toLocaleString('zh-CN', { hour: 'numeric', minute: 'numeric', hour12: false }) + '前' : '刚刚',
        source: item.author_name || '聚合数据',
        title: item.title || '无标题',
        summary: item.summary || '',
        tags: item.tags ? item.tags.split(',') : ['新闻'],
        importance: 3,
        url: item.url || '#'
      }));
    } else if (source === 'tianapi') {
      newsItems = data.newslist || [];
      return newsItems.map((item, index) => ({
        id: index,
        category: item.category || '国际',
        time: item.ctime ? new Date(item.ctime * 1000).toLocaleString('zh-CN', { hour: 'numeric', minute: 'numeric', hour12: false }) + '前' : '刚刚',
        source: item.source || '天行数据',
        title: item.title || '无标题',
        summary: item.summary || '',
        tags: item.tags ? item.tags.split(',') : ['新闻'],
        importance: 3,
        url: item.url || '#'
      }));
    } else if (source === 'alapi') {
      newsItems = data.data?.newslist || data.data || [];
      return newsItems.map((item, index) => ({
        id: index,
        category: item.category || '国际',
        time: item.time ? new Date(item.time).toLocaleString('zh-CN', { hour: 'numeric', minute: 'numeric', hour12: false }) + '前' : '刚刚',
        source: item.source || 'ALAPI',
        title: item.title || '无标题',
        summary: item.summary || item.digest || '',
        tags: item.tags ? item.tags.split(',') : ['新闻'],
        importance: 3,
        url: item.url || '#'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('数据格式化错误:', error);
    return [];
  }
}

// GNews API
async function fetchFromGNews(category) {
  if (!CONFIG.gnews.enabled) return [];
  
  try {
    const categoryMap = CONFIG.gnews.categoryMap[category] || CONFIG.gnews.categoryMap['国际'];
    const response = await axios.get(`${CONFIG.gnews.url}?category=${categoryMap}&lang=zh&apikey=${CONFIG.gnews.apiKey}`);
    return normalizeNews(response.data, 'gnews');
  } catch (error) {
    console.error('GNews API 错误:', error.message);
    return [];
  }
}

// 聚合数据 API
async function fetchFromJuhe(category) {
  if (!CONFIG.juhe.enabled) return [];
  
  try {
    const categoryMap = CONFIG.juhe.categoryMap[category] || 'all';
    const response = await axios.get(`${CONFIG.juhe.url}?type=${categoryMap}&key=${CONFIG.juhe.apiKey}`);
    return normalizeNews(response.data, 'juhe');
  } catch (error) {
    console.error('聚合数据 API 错误:', error.message);
    return [];
  }
}

// 天行数据 API
async function fetchFromTianapi(category) {
  if (!CONFIG.tianapi.enabled) return [];
  
  try {
    const categoryMap = CONFIG.tianapi.categoryMap[category] || 'social';
    const response = await axios.get(`${CONFIG.tianapi.url}?key=${CONFIG.tianapi.apiKey}&num=10`);
    return normalizeNews(response.data, 'tianapi');
  } catch (error) {
    console.error('天行数据 API 错误:', error.message);
    return [];
  }
}

// ALAPI API
async function fetchFromAlapi(category) {
  if (!CONFIG.alapi.enabled) return [];
  
  try {
    const categoryMap = CONFIG.alapi.categoryMap[category] || 'tech';
    let url = CONFIG.alapi.url;
    
    // 根据分类选择不同的 API
    if (category === '经济') {
      url = 'https://v2.alapi.cn/api/news/finance';
    } else if (category === '国际') {
      url = 'https://v2.alapi.cn/api/news/world';
    } else if (category === '社会') {
      url = 'https://v2.alapi.cn/api/news/social';
    } else if (category === '文化') {
      url = 'https://v2.alapi.cn/api/news/culture';
    }
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return normalizeNews(response.data, 'alapi');
  } catch (error) {
    console.error('ALAPI 错误:', error.message);
    return [];
  }
}

// 获取新闻数据
app.get('/api/news', async (req, res) => {
  const { category } = req.query;
  const selectedCategory = category || '全部';
  
  try {
    let news = [];
    
    // 按优先级尝试各个 API
    const apiOrder = ['gnews', 'juhe', 'tianapi', 'alapi'];
    
    for (const api of apiOrder) {
      if (CONFIG[api].enabled) {
        const apiNews = await fetchFrom[api](selectedCategory);
        if (apiNews.length > 0) {
          news = [...news, ...apiNews];
          break; // 找到数据后停止尝试其他 API
        }
      }
    }
    
    // 如果所有 API 都失败，使用本地数据
    if (news.length === 0) {
      news = await scrapeNews();
    }
    
    // 如果没有分类筛选，返回所有数据
    if (!selectedCategory || selectedCategory === '全部') {
      // 使用 AI 进行评估和排序
      if (CONFIG.qwen.enabled && news.length > 0) {
        const evaluatedNews = await evaluateNews(news);
        return res.json({ news: evaluatedNews });
      }
      return res.json({ news });
    }
    
    // 按分类筛选
    const filteredNews = news.filter(item => 
      item.category === selectedCategory || 
      (selectedCategory === '科技' && (item.title.includes('AI') || item.title.includes('技术') || item.title.includes('科技'))) ||
      (selectedCategory === '经济' && (item.title.includes('经济') || item.title.includes('市场') || item.title.includes('增长'))) ||
      (selectedCategory === '国际' && (item.title.includes('国际') || item.title.includes('全球') || item.title.includes('世界'))) ||
      (selectedCategory === '文明' && (item.title.includes('文明') || item.title.includes('能源') || item.title.includes('考古') || item.title.includes('人文')))
    );
    
    // 使用 AI 进行评估和排序
    if (CONFIG.qwen.enabled && filteredNews.length > 0) {
      const evaluatedNews = await evaluateNews(filteredNews);
      return res.json({ news: evaluatedNews });
    }
    
    res.json({ news: filteredNews });
  } catch (error) {
    res.status(500).json({ error: '获取新闻失败' });
  }
});

// 获取分类
app.get('/api/categories', (req, res) => {
  res.json({
    categories: ['全部', '科技', '经济', '国际', '社会', '文化', '文明']
  });
});

// 爬虫函数（备用）
async function scrapeNews() {
  try {
    return [
      {
        id: 1,
        category: '科技',
        time: '刚刚',
        source: '科技日报',
        title: 'AI技术突破：新一代语言模型展现惊人推理能力',
        summary: '最新研究表明，新一代大语言模型在复杂推理任务中表现显著提升，能够处理多步骤逻辑问题。专家认为这将推动AI在科研、医疗等领域的应用突破。',
        tags: ['人工智能', '深度学习', '技术创新'],
        importance: 5,
        url: 'https://www.techdaily.com/ai-breakthrough'
      },
      {
        id: 2,
        category: '经济',
        time: '1小时前',
        source: '经济观察报',
        title: '全球经济增长预期上调，新兴市场表现亮眼',
        summary: '国际货币基金组织最新报告显示，2024年全球经济增长预期从3.1%上调至3.4%。主要得益于亚洲新兴市场的强劲表现。',
        tags: ['宏观经济', '市场分析', '全球经济'],
        importance: 4,
        url: 'https://www.economist.com/growth-upgrade'
      },
      {
        id: 3,
        category: '文明',
        time: '2小时前',
        source: '科学美国人',
        title: '核聚变能源突破：实现净能量增益',
        summary: '国际科研团队在核聚变研究中取得历史性突破，首次实现净能量增益。这一里程碑式进展意味着可控核聚变能源有望在未来10-20年内实现商业化。',
        tags: ['核聚变', '清洁能源', '能源革命'],
        importance: 5,
        url: 'https://www.scientificamerican.com/fusion-breakthrough'
      }
    ];
  } catch (error) {
    console.error('爬虫错误:', error);
    return [];
  }
}

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log('已启用的 API:');
  if (CONFIG.gnews.enabled) console.log('  - GNews API');
  if (CONFIG.juhe.enabled) console.log('  - 聚合数据 API');
  if (CONFIG.tianapi.enabled) console.log('  - 天行数据 API');
  if (CONFIG.alapi.enabled) console.log('  - ALAPI');
  if (CONFIG.qwen.enabled) console.log('  - 阿里云千问 AI 模型');
  if (!CONFIG.gnews.enabled && !CONFIG.juhe.enabled && !CONFIG.tianapi.enabled && !CONFIG.alapi.enabled && !CONFIG.qwen.enabled) {
    console.log('  - 未启用任何 API，使用本地数据');
  }
});

// AI 摘要生成函数
async function generateAISummary(title, content) {
  if (!CONFIG.qwen.enabled) {
    return content ? content.substring(0, 200) + '...' : '';
  }
  
  try {
    const prompt = `你是一个专业的新闻编辑，请根据以下新闻标题和内容，生成一段简洁、专业的新闻摘要（不超过 150 字），突出新闻的核心价值和影响：

新闻标题：${title}

新闻内容：${content || '无详细内容'}

请生成摘要：`;

    const response = await axios.post(
      CONFIG.qwen.url,
      {
        model: CONFIG.qwen.model,
        input: {
          prompt: prompt
        },
        parameters: {
          result_format: 'text'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${CONFIG.qwen.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    return response.data?.output?.text || content?.substring(0, 200) + '...' || '';
  } catch (error) {
    console.error('AI 摘要生成失败:', error.message);
    return content ? content.substring(0, 200) + '...' : '';
  }
}

// AI 新闻评估和排序函数
async function evaluateNews(newsArray) {
  if (!CONFIG.qwen.enabled) {
    return newsArray.map((news, index) => ({
      ...news,
      importance: Math.min(5, Math.floor(Math.random() * 3) + 3)
    }));
  }
  
  try {
    const newsText = newsArray.map((news, index) => 
      `${index + 1}. [${news.category}] ${news.title} - ${news.summary.substring(0, 100)}`
    ).join('\n');

    const prompt = `你是一个专业的新闻编辑，请评估以下新闻列表，为每条新闻分配重要度（1-5星，5星为最重要），并按重要度排序。重要度评估标准：
- 5星：具有全球性影响、重大突破、改变行业格局
- 4星：重要行业影响、区域性重大事件
- 3星：一般重要、行业动态
- 2星：次要信息、补充性内容
- 1星：娱乐性、低价值内容

请以 JSON 格式返回评估结果：
{
  "evaluations": [
    {
      "index": 新闻索引,
      "importance": 重要度(1-5),
      "reason": "评估理由"
    }
  ]
}

新闻列表：
${newsText}

请返回评估结果：`;

    const response = await axios.post(
      CONFIG.qwen.url,
      {
        model: CONFIG.qwen.model,
        input: {
          prompt: prompt
        },
        parameters: {
          result_format: 'text'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${CONFIG.qwen.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const resultText = response.data?.output?.text || '{}';
    
    try {
      const result = JSON.parse(resultText);
      if (result.evaluations && Array.isArray(result.evaluations)) {
        return result.evaluations.map(evalItem => ({
          ...newsArray[evalItem.index],
          importance: evalItem.importance,
          ai_reason: evalItem.reason
        }));
      }
    } catch (parseError) {
      console.error('解析 AI 评估结果失败:', parseError.message);
    }
    
    return newsArray.map((news, index) => ({
      ...news,
      importance: Math.min(5, Math.floor(Math.random() * 3) + 3)
    }));
  } catch (error) {
    console.error('AI 评估失败:', error.message);
    return newsArray.map((news, index) => ({
      ...news,
      importance: Math.min(5, Math.floor(Math.random() * 3) + 3)
    }));
  }
}

export default app;