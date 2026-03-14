import React, { useState, useEffect } from 'react';
import NewsCard from './NewsCard';
import './NewsSummary.css';

const NewsSummary = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [sortBy, setSortBy] = useState('importance');

  const categories = ['全部', '科技', '经济', '国际', '社会', '文化', '文明'];

  useEffect(() => {
    fetchNewsData();
  }, []);

  const fetchNewsData = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/news');
      const data = await response.json();
      
      if (data.news) {
        setNewsData(data.news);
      } else {
        throw new Error('获取新闻失败');
      }
    } catch (error) {
      console.error('获取新闻数据失败:', error);
      // 如果 API 失败，使用本地数据作为备用
      const mockNews = [
        {
          id: 1,
          category: '科技',
          time: '2小时前',
          source: '科技日报',
          title: 'AI技术突破：新一代语言模型展现惊人推理能力',
          summary: '最新研究表明，新一代大语言模型在复杂推理任务中表现显著提升，能够处理多步骤逻辑问题。专家认为这将推动AI在科研、医疗等领域的应用突破。模型在数学推理、代码生成和常识理解方面取得重大进展。',
          tags: ['人工智能', '深度学习', '技术创新'],
          importance: 5,
          url: 'https://www.techdaily.com/ai-breakthrough'
        },
        {
          id: 2,
          category: '经济',
          time: '3小时前',
          source: '经济观察报',
          title: '全球经济增长预期上调，新兴市场表现亮眼',
          summary: '国际货币基金组织最新报告显示，2024年全球经济增长预期从3.1%上调至3.4%。主要得益于亚洲新兴市场的强劲表现和欧美经济复苏超预期。专家提醒仍需关注通胀压力和地缘政治风险。',
          tags: ['宏观经济', '市场分析', '全球经济'],
          importance: 4,
          url: 'https://www.economist.com/growth-upgrade'
        },
        {
          id: 3,
          category: '国际',
          time: '4小时前',
          source: '环球时报',
          title: '气候变化应对新进展：多国承诺加大减排力度',
          summary: '在最新气候峰会上，主要经济体宣布了更积极的减排目标，承诺到2030年将碳排放减少50%。可再生能源投资大幅增加，清洁技术发展迅速。科学家表示这是应对气候变化的关键一步。',
          tags: ['气候变化', '环保', '国际合作'],
          importance: 5,
          url: 'https://www.globaltimes.cn/climate-action'
        },
        {
          id: 4,
          category: '科技',
          time: '5小时前',
          source: '36氪',
          title: '量子计算商业化进程加速，多家企业推出实用解决方案',
          summary: '量子计算技术正从实验室走向商业应用。IBM、谷歌等公司推出面向企业的量子计算服务，在金融建模、药物研发等领域展现潜力。专家预测未来5年内量子计算将实现重大突破。',
          tags: ['量子计算', '商业化', '前沿技术'],
          importance: 4,
          url: 'https://36kr.com/quantum-computing'
        },
        {
          id: 5,
          category: '社会',
          time: '6小时前',
          source: '澎湃新闻',
          title: '远程办公模式演变：混合办公成为新常态',
          summary: '疫情后远程办公模式持续演变，混合办公成为主流选择。调查显示，70%的企业采用灵活办公制度，员工满意度和工作效率双提升。专家建议企业建立完善的远程管理体系。',
          tags: ['工作方式', '社会趋势', '企业管理'],
          importance: 3,
          url: 'https://www.thepaper.cn/remote-work'
        },
        {
          id: 6,
          category: '文化',
          time: '7小时前',
          source: '南方周末',
          title: '数字文化遗产保护：新技术助力传统文化传承',
          summary: '数字化技术为文化遗产保护带来新机遇。3D扫描、VR技术让文物以数字形式永久保存，线上展览让更多人接触传统文化。专家呼吁加强数字文化遗产的国际合作与标准制定。',
          tags: ['文化传承', '数字技术', '遗产保护'],
          importance: 3,
          url: 'https://www.infzm.com/cultural-heritage'
        },
        {
          id: 7,
          category: '文明',
          time: '1小时前',
          source: '科学美国人',
          title: '核聚变能源突破：实现净能量增益，人类能源未来迎来转折点',
          summary: '国际科研团队在核聚变研究中取得历史性突破，首次实现净能量增益。这一里程碑式进展意味着可控核聚变能源有望在未来10-20年内实现商业化。专家表示这将彻底改变人类能源结构，为解决气候变化问题提供终极方案。',
          tags: ['核聚变', '清洁能源', '能源革命'],
          importance: 5,
          url: 'https://www.scientificamerican.com/fusion-breakthrough'
        },
        {
          id: 8,
          category: '文明',
          time: '30分钟前',
          source: '自然杂志',
          title: '考古重大发现：距今1万年前的古代文明遗址揭示人类社会起源新线索',
          summary: '考古学家在中东地区发现距今1万年前的古代文明遗址，出土了大量文物和建筑遗迹。这一发现将人类文明起源时间提前了2000年，为研究人类社会起源和演变提供了关键证据。专家称这是21世纪最重要的考古发现之一。',
          tags: ['考古发现', '人类起源', '文明史'],
          importance: 5,
          url: 'https://www.nature.com/archaeology'
        },
        {
          id: 9,
          category: '文明',
          time: '45分钟前',
          source: '哲学时报',
          title: '人工智能伦理新思想：全球学者提出"数字人文主义"框架',
          summary: '来自20多个国家的顶尖学者联合提出"数字人文主义"思想框架，为人工智能发展提供伦理指导。该框架强调技术发展必须以人类福祉为核心，引发了全球范围内的热烈讨论。专家认为这将影响未来十年的人工智能发展方向。',
          tags: ['人工智能伦理', '数字人文', '思想创新'],
          importance: 4,
          url: 'https://www.philosophytimes.com/ai-ethics'
        }
      ];
      setNewsData(mockNews);
    }
    
    setLoading(false);
  };

  const handleRefresh = () => {
    fetchNewsData();
  };

  const filteredNews = newsData.filter(news => 
    selectedCategory === '全部' || news.category === selectedCategory
  );

  const sortedNews = [...filteredNews].sort((a, b) => {
    if (sortBy === 'importance') return b.importance - a.importance;
    if (sortBy === 'time') return a.id - b.id;
    return 0;
  });

  return (
    <div className="news-summary">
      <div className="news-header">
        <h1 className="page-title">AI 精华新闻摘要</h1>
        <p className="page-subtitle">智能筛选，深度分析，每天5分钟掌握重要信息</p>
      </div>

      <div className="news-controls">
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="sort-controls">
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? '🔄 刷新中...' : '🔄 刷新最新'}
          </button>
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="importance">按重要度排序</option>
            <option value="time">按时间排序</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>AI正在为您分析新闻...</p>
        </div>
      ) : (
        <div className="news-container">
          {sortedNews.map(news => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      )}

      <div className="news-footer-info">
        <p>📊 今日共分析 {newsData.length} 条新闻，为您筛选出 {filteredNews.length} 条精华内容</p>
        <p className="update-time">最后更新: {new Date().toLocaleString('zh-CN')}</p>
      </div>
    </div>
  );
};

export default NewsSummary;