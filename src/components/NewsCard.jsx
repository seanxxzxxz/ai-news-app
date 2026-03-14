import React from 'react';
import './NewsCard.css';

const NewsCard = ({ news }) => {
  const handleReadMore = (e) => {
    e.preventDefault();
    if (news.url && news.url !== '#') {
      window.open(news.url, '_blank');
    } else {
      alert('当前为演示数据，暂无原文链接。您可以复制以下内容进行测试：\n\n' + news.title + '\n\n' + news.summary);
    }
  };

  return (
    <div className="news-card">
      <div className="news-header">
        <span className="news-category">{news.category}</span>
        <span className="news-time">{news.time}</span>
      </div>
      <div className="news-source">
        <span className="source-label">来源:</span>
        <span className="source-name">{news.source}</span>
      </div>
      <h3 className="news-title">{news.title}</h3>
      <div className="news-summary">
        <div className="ai-badge">
          <span className="ai-icon">🤖</span>
          <span>AI精华提炼</span>
        </div>
        <p className="summary-text">{news.summary}</p>
      </div>
      <div className="news-tags">
        {news.tags.map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
      </div>
      <div className="news-footer">
        <div className="importance-level">
          <span className="importance-label">重要度:</span>
          <div className="importance-stars">
            {[...Array(news.importance)].map((_, i) => (
              <span key={i} className="star">⭐</span>
            ))}
          </div>
        </div>
        <a 
          href="#" 
          className="read-more" 
          onClick={handleReadMore}
        >
          阅读原文
        </a>
      </div>
    </div>
  );
};

export default NewsCard;