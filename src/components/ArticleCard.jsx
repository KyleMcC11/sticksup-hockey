function ArticleCard({ article }) {
  return (
    <article className="article-card">
      <span>{article.tag}</span>
      <h3>{article.title}</h3>
      <p>{article.text}</p>
      <a href="#">Read More</a>
    </article>
  );
}

export default ArticleCard;