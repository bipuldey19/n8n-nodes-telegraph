# n8n-nodes-telegraph

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![npm](https://img.shields.io/npm/v/n8n-nodes-telegraph)
![License](https://img.shields.io/github/license/bipuldey19/n8n-nodes-telegraph)

This is an n8n community node that lets you use [Telegraph](https://telegra.ph) (Telegra.ph) in your n8n workflows.

Telegraph is a minimalist publishing tool created by Telegram that allows you to create richly formatted posts with photos and embedded content. It's perfect for creating instant articles, blog posts, and documentation pages.

## ✨ Features

- **Create & Manage Accounts** - Create Telegraph accounts, edit account info, and revoke access tokens
- **Create & Edit Pages** - Publish content with full formatting support
- **Multiple Content Formats** - Write in **Markdown**, **HTML**, or native Telegraph JSON format
- **View Statistics** - Get page view counts with date filtering
- **List Pages** - Retrieve all pages associated with an account

## 📦 Installation

### Community Nodes (Recommended)

1. Go to **Settings** > **Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-telegraph` in the search field
4. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-telegraph
```

Then restart n8n.

## 🔧 Operations

### Account

| Operation | Description |
|-----------|-------------|
| **Create** | Create a new Telegraph account |
| **Edit** | Update account information (short name, author name, author URL) |
| **Get** | Retrieve account information |
| **Revoke Access Token** | Revoke current access token and generate a new one |

### Page

| Operation | Description |
|-----------|-------------|
| **Create** | Create a new Telegraph page |
| **Edit** | Edit an existing page |
| **Get** | Get page content and metadata |
| **Get All** | List all pages for an account |
| **Get Views** | Get page view statistics |

## 🔐 Credentials

To use most operations, you'll need a Telegraph **Access Token**.

### Getting an Access Token

1. Use the **Account → Create** operation in n8n (no credentials required)
2. From the response, open the `auth_url` in your browser / `get` request in n8n to activate the account
3. Save the `access_token` from the response
4. Create new credentials in n8n with this token

> ⚠️ **Important:** You must visit the `auth_url` at least once to activate your account.

Or get one via API:
```bash
# Step 1: Create account
curl "https://api.telegra.ph/createAccount?short_name=YourName&author_name=Your%20Name"

# Step 2: Open the auth_url from the response in your browser
# Example: https://edit.telegra.ph/auth/xxxxxxxxxxxx

# Step 3: Use the access_token in your n8n credentials
```

## 📝 Content Formats

The node supports three content input formats for creating/editing pages:

### Markdown (Recommended)

Write content naturally with Markdown syntax:

```markdown
# My Article

This is a **bold** and *italic* text.

## Features
- Easy to write
- Supports formatting
- Great for quick posts

> A beautiful blockquote

[Link to Telegraph](https://telegra.ph)

![Image](https://example.com/image.jpg)
```

**Supported Markdown:**
- Headings (`#`, `##`, `###`, `####`)
- Bold (`**text**`) and Italic (`*text*`)
- Links (`[text](url)`) and Images (`![alt](url)`)
- Unordered lists (`-`, `*`, `+`) and Ordered lists (`1.`, `2.`)
- Code blocks (triple backticks) and inline code
- Blockquotes (`>`)
- Horizontal rules (`---`)

### HTML

Use HTML tags directly:

```html
<h3>My Article</h3>
<p>This is <strong>bold</strong> and <em>italic</em> text.</p>
<ul>
  <li>First item</li>
  <li>Second item</li>
</ul>
<figure>
  <img src="https://example.com/image.jpg">
  <figcaption>Caption</figcaption>
</figure>
```

**Supported HTML tags:** `a`, `aside`, `b`, `blockquote`, `br`, `code`, `em`, `figcaption`, `figure`, `h3`, `h4`, `hr`, `i`, `img`, `li`, `ol`, `p`, `pre`, `s`, `strong`, `u`, `ul`

### JSON (Telegraph Format)

Native Telegraph Node format for advanced use:

```json
[
  {"tag": "h3", "children": ["My Article"]},
  {"tag": "p", "children": ["Hello, ", {"tag": "strong", "children": ["world"]}, "!"]}
]
```

## 📋 Examples

### Create a Simple Page

1. Add **Telegraph** node
2. Select **Page → Create**
3. Set credentials (access token)
4. Enter title: `My First Post`
5. Choose **Markdown** format
6. Write your content
7. Execute!

### Get Page Statistics

1. Add **Telegraph** node
2. Select **Page → Get Views**
3. Enter the page path (e.g., `My-First-Post-11-29`)
4. Optionally filter by year/month/day/hour
5. Execute to see view counts

## ⚠️ Limitations

- Telegraph does **not** support tables (use code blocks as workaround)
- Only `h3` and `h4` headings are supported (others are converted)
- Maximum page size is approximately 64KB
- Images must be hosted externally or uploaded to Telegraph separately

## 🔗 Resources

- [Telegraph API Documentation](https://telegra.ph/api)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [GitHub Repository](https://github.com/bipuldey19/n8n-nodes-telegraph)
- [npm Package](https://www.npmjs.com/package/n8n-nodes-telegraph)

## 📜 License

[MIT](LICENSE.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ for the n8n community
