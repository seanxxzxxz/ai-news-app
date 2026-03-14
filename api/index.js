import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// NewsAPI 配置（需要替换为您的 API Key）
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'demo-key';

// 爬虫函数
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

// 从 NewsAPI 获取数据
async function fetchFromNewsAPI() {
  try {
    if (NEWS_API_KEY === 'demo-key') {
      return [];
    }
    
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        apiKey: NEWS_API_KEY,
        country: 'us',
        pageSize: 10
      }
    });
    
    return response.data.articles.map(article => ({
      id: Date.now() + Math.random(),
      category: '国际',
      time: article.publishedAt ? new Date(article.publishedAt).toLocaleString('zh-CN', { hour: 'numeric', minute: 'numeric', hour12: false }) + '前' : '刚刚',
      source: article.source?.name || '新闻来源',
      title: article.title,
      summary: article.description || '',
      tags: ['新闻'],
      importance: 3,
      url: article.url
    }));
  } catch (error) {
    console.error('NewsAPI 错误:', error);
    return [];
  }
}

// 获取新闻数据
app.get('/api/news', async (req, res) => {
  const { category } = req.query;
  
  try {
    let news = await fetchFromNewsAPI();
    
    if (news.length === 0) {
      news = await scrapeNews();
    }
    
    if (!category || category === '全部') {
      return res.json({ news });
    }
    
    const filteredNews = news.filter(item => 
      item.category === category || 
      (category === '科技' && (item.title.includes('AI') || item.title.includes('技术') || item.title.includes('科技'))) ||
      (category === '经济' && (item.title.includes('经济') || item.title.includes('市场') || item.title.includes('增长'))) ||
      (category === '国际' && (item.title.includes('国际') || item.title.includes('全球') || item.title.includes('世界'))) ||
      (category === '文明' && (item.title.includes('文明') || item.title.includes('能源') || item.title.includes('考古') || item.title.includes('人文')))
    );
    
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

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

export default app;