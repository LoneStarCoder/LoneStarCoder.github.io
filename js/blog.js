// blog.js - Core functionality for dynamic markdown blog

// Configuration
const config = {
    postsDirectory: 'posts/',
    postsPerPage: 5,
    dateFormat: { year: 'numeric', month: 'long', day: 'numeric' }
};

// Log configuration to help debug
console.log("Blog.js loaded with config:", config);

// Blog post class
class BlogPost {
    constructor(metadata, content) {
        this.title = metadata.title || 'Untitled Post';
        this.date = metadata.date ? new Date(metadata.date) : new Date();
        this.author = metadata.author || 'Anonymous';
        this.summary = metadata.summary || '';
        this.tags = metadata.tags || [];
        this.slug = metadata.slug || this.title.toLowerCase().replace(/[^\w]+/g, '-');
        this.content = content;
    }

    // Format the date according to the config
    formattedDate() {
        return this.date.toLocaleDateString('en-US', config.dateFormat);
    }

    // Generate HTML for a blog post preview
    generatePreview() {
        return `
            <article>
                <h3>${this.title}</h3>
                <p class="post-meta">By ${this.author} on ${this.formattedDate()}</p>
                <p>${this.summary}</p>
                <a href="./post.html?slug=${this.slug}">Read more</a>
            </article>
        `;
    }

    // Generate full HTML for a blog post
    generateFullPost() {
        // We'll use marked.js to convert markdown to HTML
        const contentHtml = marked.parse(this.content);
        
        return `
            <article>
                <h2>${this.title}</h2>
                <p class="post-meta">By ${this.author} on ${this.formattedDate()}</p>
                <div class="post-tags">
                    ${this.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="post-content">
                    ${contentHtml}
                </div>
            </article>
        `;
    }
}

// Blog controller
class BlogController {
    constructor() {
        this.posts = [];
        this.initialized = false;
    }

    // Initialize the blog
    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log("Starting blog initialization");
            // Fetch the index of posts
            const response = await fetch(`${config.postsDirectory}index.json`);
            if (!response.ok) {
                console.warn(`Failed to load post index: ${response.status} ${response.statusText}`);
                throw new Error('Failed to load post index');
            }
            
            const postIndex = await response.json();
            console.log("Loaded post index:", postIndex);
            
            // Load posts in parallel
            const postPromises = postIndex.posts.map(postInfo => this.loadPost(postInfo.slug));
            this.posts = await Promise.all(postPromises);
            
            // Sort posts by date (newest first)
            this.posts.sort((a, b) => b.date - a.date);
            console.log("Loaded and sorted posts:", this.posts);
            
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing blog:', error);
            // Handle missing index by trying to load posts directly
            await this.loadPostsDirectly();
        }
    }

    // Fallback method to load posts without an index
    async loadPostsDirectly() {
        console.log("Falling back to direct post loading");
        // In a real site, this would scan the directory
        // For simplicity, we'll hardcode a few known posts
        const knownPosts = [
            'daisychainedscomgatewayserverremoval',
            'understanding_cybersecurity_threats'
        ];
        
        const postPromises = knownPosts.map(slug => this.loadPost(slug));
        this.posts = (await Promise.all(postPromises)).filter(post => post !== null);
        
        // If we still couldn't load any posts, create fake ones
        if (this.posts.length === 0) {
            console.log("Creating fallback post objects");
            this.posts = [
                new BlogPost({
                    title: "SCOM Daisy-chained Gateway Server Removal",
                    date: "2025-03-19",
                    author: "Lone Star Coder",
                    summary: "A straightforward guide to removing daisy-chained gateway servers in System Center Operations Manager (SCOM)",
                    tags: ["SCOM", "Gateway", "Server Management", "System Center"],
                    slug: "daisychainedscomgatewayserverremoval"
                }, "Fallback content - please view the full post page"),
                new BlogPost({
                    title: "Understanding Cybersecurity Threats - Some Basics",
                    date: "2025-03-15",
                    author: "Lone Star Coder",
                    summary: "In this post, we explore the various types of cybersecurity threats and how to mitigate them effectively",
                    tags: ["Cybersecurity", "Threats", "Security", "IT"],
                    slug: "understanding_cybersecurity_threats"
                }, "Fallback content - please view the full post page")
            ];
        }
        
        // Sort posts by date (newest first)
        this.posts.sort((a, b) => b.date - a.date);
        
        this.initialized = true;
    }

    // Load a single post by slug
    async loadPost(slug) {
        try {
            console.log(`Attempting to load post: ${slug}`);
            const response = await fetch(`${config.postsDirectory}${slug}.md`);
            if (!response.ok) {
                console.warn(`Failed to load post ${slug}: ${response.status} ${response.statusText}`);
                return null;
            }
            
            const markdown = await response.text();
            console.log(`Successfully loaded markdown for ${slug}`);
            
            // Parse frontmatter (metadata at the top of the markdown file)
            const metadata = this.parseFrontMatter(markdown);
            const content = this.stripFrontMatter(markdown);
            
            return new BlogPost({...metadata, slug}, content);
        } catch (error) {
            console.error(`Error loading post ${slug}:`, error);
            return null;
        }
    }

    // Parse front matter from markdown (simple version)
    parseFrontMatter(markdown) {
        const metadata = {};
        
        // Look for frontmatter between --- markers
        const frontMatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n/);
        
        if (frontMatterMatch && frontMatterMatch[1]) {
            const frontMatter = frontMatterMatch[1];
            
            // Extract key-value pairs
            const lines = frontMatter.split('\n');
            for (const line of lines) {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.substring(0, colonIndex).trim();
                    const value = line.substring(colonIndex + 1).trim();
                    
                    // Handle special cases like date and tags
                    if (key === 'tags') {
                        metadata[key] = value.split(',').map(tag => tag.trim());
                    } else {
                        metadata[key] = value;
                    }
                }
            }
        }
        
        return metadata;
    }

    // Remove front matter from markdown
    stripFrontMatter(markdown) {
        return markdown.replace(/^---\n[\s\S]*?\n---\n/, '');
    }

    // Get all posts
    getPosts() {
        return this.posts;
    }

    // Get a single post by slug
    getPostBySlug(slug) {
        return this.posts.find(post => post.slug === slug);
    }

    // Render blog listing
    renderBlogListing(elementId, page = 1) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const startIndex = (page - 1) * config.postsPerPage;
        const endIndex = startIndex + config.postsPerPage;
        const postsToShow = this.posts.slice(startIndex, endIndex);
        
        if (postsToShow.length === 0) {
            element.innerHTML = '<p>No posts found.</p>';
            return;
        }
        
        const postsHtml = postsToShow.map(post => post.generatePreview()).join('');
        element.innerHTML = postsHtml;
    }

    // Render a single post
    renderPost(elementId, slug) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const post = this.getPostBySlug(slug);
        
        if (!post) {
            element.innerHTML = '<p>Post not found.</p>';
            return;
        }
        
        element.innerHTML = post.generateFullPost();
        
        // Initialize code highlighting if available
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
    }
}

// Create global blog instance
const blog = new BlogController();