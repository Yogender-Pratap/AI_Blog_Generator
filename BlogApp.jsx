import { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Loader2, Trash2 } from 'lucide-react';

export default function BlogApp() {
  const [articles, setArticles] = useState([]);
  const [titleInput, setTitleInput] = useState('');
  const [detailsInput, setDetailsInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState('blog');
  const [loading, setLoading] = useState(true);

  // Load articles from memory on mount
  useEffect(() => {
    setLoading(false);
  }, []);

  const saveArticles = (newArticles) => {
    setArticles(newArticles);
  };

  const generateArticles = async () => {
    const API_KEY = '' ; // IMPORTANT: Replace with your actual key
    
    const titles = titleInput.split('\n').filter(t => t.trim());
    if (titles.length === 0) {
      alert('Please enter at least one article title');
      return;
    }

    setGenerating(true);
    const newArticles = [...articles];
    
    for (const title of titles) {
      try {
        const prompt = detailsInput 
          ? `Write a comprehensive programming article with the title: "${title}". Additional context: ${detailsInput}\n\nProvide a well-structured article with an introduction, main content sections, code examples where appropriate, and a conclusion. Make it informative and practical for developers.`
          : `Write a comprehensive programming article with the title: "${title}". Provide a well-structured article with an introduction, main content sections, code examples where appropriate, and a conclusion. Make it informative and practical for developers.`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "user", content: prompt }
            ],
            max_tokens: 2000
          })
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message);
        }
        
        const content = data.choices[0].message.content;

        const article = {
          id: `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: title.trim(),
          content: content,
          timestamp: Date.now(),
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        };

        newArticles.unshift(article);
      } catch (error) {
        console.error('Error generating article:', error);
        alert(`Failed to generate article: ${title}. Error: ${error.message}`);
      }
    }

    saveArticles(newArticles);
    setGenerating(false);
    setTitleInput('');
    setDetailsInput('');
    setCurrentPage('blog');
  };

  const deleteArticle = (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    const filtered = articles.filter(a => a.id !== id);
    saveArticles(filtered);
  };

  const BlogPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold text-white">Programming Blog</h1>
          </div>
          <p className="text-purple-200 text-lg">AI-Generated Articles on Software Development</p>
          <button
            onClick={() => setCurrentPage('admin')}
            className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            Generate New Articles
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-purple-200 text-xl mb-4">No articles yet</p>
            <p className="text-purple-300">Go to the admin panel to generate your first articles!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {articles.map((article) => (
              <article key={article.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-purple-500/20 hover:border-purple-500/40 transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{article.title}</h2>
                    <p className="text-purple-300 text-sm">{article.date}</p>
                  </div>
                  <button
                    onClick={() => deleteArticle(article.id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="prose prose-invert max-w-none">
                  <div className="text-purple-100 whitespace-pre-wrap leading-relaxed">{article.content}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const AdminPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="mb-8">
          <button
            onClick={() => setCurrentPage('blog')}
            className="text-blue-300 hover:text-blue-200 mb-4 flex items-center gap-2"
          >
            ← Back to Blog
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-blue-200">Generate AI-powered programming articles</p>
        </header>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-blue-500/20">
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              Article Titles (one per line)
            </label>
            <textarea
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Understanding React Hooks&#10;Building RESTful APIs with Node.js&#10;Introduction to Machine Learning&#10;..."
              className="w-full h-40 px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              disabled={generating}
            />
          </div>

          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              Additional Details (optional)
            </label>
            <textarea
              value={detailsInput}
              onChange={(e) => setDetailsInput(e.target.value)}
              placeholder="Add any specific requirements, target audience, depth level, or focus areas for all articles..."
              className="w-full h-24 px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              disabled={generating}
            />
          </div>

          <button
            onClick={generateArticles}
            disabled={generating || !titleInput.trim()}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Articles...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Articles
              </>
            )}
          </button>

          {generating && (
            <p className="text-blue-200 text-center mt-4 text-sm">
              This may take a minute depending on the number of articles...
            </p>
          )}
        </div>

        {articles.length > 0 && (
          <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20">
            <h2 className="text-xl font-bold text-white mb-4">Existing Articles ({articles.length})</h2>
            <div className="space-y-2">
              {articles.map((article) => (
                <div key={article.id} className="flex justify-between items-center py-2 border-b border-blue-500/20">
                  <span className="text-blue-100">{article.title}</span>
                  <button
                    onClick={() => deleteArticle(article.id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return currentPage === 'blog' ? <BlogPage /> : <AdminPage />;
}
