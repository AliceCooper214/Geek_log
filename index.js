const fs = require("fs");
const path = require("path");

// 定义需要忽略的文件夹和文件
const IGNORED_PATHS = [
  ".git",
  "node_modules",
  ".DS_Store",
  "thumbs.db",
  "index.js",
  "index.html",
];
const DOMAIN = "https://alicecooper214.github.io/Geek_log";

// 判断是否应该忽略该路径
function shouldIgnore(itemName) {
  return IGNORED_PATHS.includes(itemName.toLowerCase());
}

// 生成文件夹结构的HTML字符串
function generateDirHTML(dirPath, basePath = "") {
  let html = "<ul>\n";
  let items;

  try {
    items = fs.readdirSync(dirPath);
  } catch (err) {
    console.error(`Error reading directory ${dirPath}: ${err}`);
    return '<li class="error">Error reading directory</li>\n</ul>\n';
  }

  // 过滤掉需要忽略的文件和文件夹
  items = items.filter((item) => !shouldIgnore(item));

  // 分别处理文件夹和文件，使文件夹显示在前面
  const folders = [];
  const files = [];

  items.forEach((item) => {
    const fullPath = path.join(dirPath, item);
    const relativePath = path.join(basePath, item);

    try {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        folders.push({ item, fullPath, relativePath });
      } else {
        files.push({ item, relativePath });
      }
    } catch (err) {
      console.error(`Error accessing ${fullPath}: ${err}`);
    }
  });

  // 先处理文件夹
  folders.forEach(({ item, fullPath, relativePath }) => {
    html += `<li class="folder">
            <span class="folder-name">📁 ${item}</span>\n`;
    html += generateDirHTML(fullPath, relativePath);
    html += "</li>\n";
  });

  // 再处理文件
  files.forEach(({ item, relativePath }) => {
    const fileExtension = path.extname(item).toLowerCase();
    const fileIcon = getFileIcon(fileExtension);
    // 将 Windows 格式的反斜杠替换为 Web 格式的正斜杠
    const webPath = `${DOMAIN}/${relativePath}`.replace(/\\/g, "/");
    html += `<li class="file">
            <span class="file-icon">${fileIcon}</span>
            <a href="#" data-path="${webPath}" onclick="loadFile('${webPath}'); return false;">${item}</a>
        </li>\n`;
  });

  html += "</ul>\n";
  return html;
}

// 根据文件扩展名返回对应的图标
function getFileIcon(extension) {
  const iconMap = {
    ".js": "📄",
    ".json": "📋",
    ".css": "🎨",
    ".html": "🌐",
    ".md": "📝",
    ".jpg": "🖼️",
    ".jpeg": "🖼️",
    ".png": "🖼️",
    ".gif": "🖼️",
    ".pdf": "📕",
    ".doc": "📘",
    ".docx": "📘",
    ".xls": "📗",
    ".xlsx": "📗",
    ".zip": "📦",
    ".rar": "📦",
    ".tar": "📦",
    ".gz": "📦",
  };

  return iconMap[extension] || "📄";
}

// 生成完整的HTML文件
function generateFullHTML(dirPath) {
  const dirContent = generateDirHTML(dirPath);
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Directory Structure</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            font-family: Arial, sans-serif;
            overflow: hidden;
        }

        /* Banner styles */
        .banner {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background-color: #24292e;
            color: white;
            display: flex;
            align-items: center;
            padding: 0 16px;
            z-index: 1000;
        }

        .menu-button {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 8px;
            margin-right: 16px;
        }

        .banner-title {
            font-size: 1.2em;
            margin: 0;
        }

        /* Sidebar styles */
        .sidebar {
            position: fixed;
            top: 60px;
            left: -300px;
            width: 300px;
            height: calc(100% - 60px);
            background-color: #f5f5f5;
            overflow-y: auto;
            transition: left 0.3s ease;
            z-index: 900;
            box-shadow: 2px 0 5px rgba(0,0,0,0.1);
        }

        .sidebar.open {
            left: 0;
        }

        /* Overlay styles */
        .overlay {
            position: fixed;
            top: 60px;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.5);
            display: none;
            z-index: 800;
        }

        .overlay.open {
            display: block;
        }

        /* Main content styles */
        .main-content {
            position: fixed;
            top: 60px;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: white;
        }

        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }

        /* Directory tree styles */
        .directory-tree {
            padding: 16px;
        }

        .folder { 
            list-style-type: none;
            font-weight: bold;
            margin: 10px 0;
        }

        .file {
            list-style-type: none;
            margin: 5px 0 5px 20px;
            color: #666;
        }

        ul {
            padding-left: 20px;
            margin: 0;
        }

        a {
            text-decoration: none;
            color: #0366d6;
        }

        a:hover {
            text-decoration: underline;
        }

        .folder-name {
            cursor: pointer;
            color: #333;
            display: block;
            padding: 5px 0;
        }

        .folder-name:hover {
            color: #0366d6;
        }

        .file-icon {
            margin-right: 5px;
        }

        .error {
            color: red;
            font-style: italic;
        }

        /* Desktop styles */
        @media (min-width: 1024px) {
            .menu-button {
                display: none;
            }

            .sidebar {
                left: 0;
                width: 300px;
                box-shadow: none;
                border-right: 1px solid #ddd;
            }

            .main-content {
                left: 300px;
            }

            .overlay {
                display: none !important;
            }
        }
    </style>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const menuButton = document.getElementById('menuButton');
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('overlay');
            let isMobile = window.innerWidth < 1024;

            // Initialize folders
            document.querySelectorAll('.folder-name').forEach(folder => {
                const ul = folder.nextElementSibling;
                ul.style.display = 'none';
                folder.addEventListener('click', function() {
                    const ul = this.nextElementSibling;
                    if (ul && ul.tagName === 'UL') {
                        ul.style.display = ul.style.display === 'none' ? 'block' : 'none';
                    }
                });
            });

            // Toggle sidebar
            function toggleSidebar() {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('open');
            }

            menuButton.addEventListener('click', toggleSidebar);
            overlay.addEventListener('click', toggleSidebar);

            // Handle window resize
            window.addEventListener('resize', function() {
                const wasMode = isMobile;
                isMobile = window.innerWidth < 1024;
                
                if (wasMode !== isMobile) {
                    sidebar.classList.remove('open');
                    overlay.classList.remove('open');
                }
            });

            // Handle file clicks on mobile
            if (isMobile) {
                document.querySelectorAll('.file a').forEach(link => {
                    link.addEventListener('click', function() {
                        if (isMobile) {
                            toggleSidebar();
                        }
                    });
                });
            }
        });

        function loadFile(filePath) {
            const iframe = document.getElementById('content-iframe');
            iframe.src = filePath;
        }
    </script>
</head>
<body>
    <div class="banner">
        <button id="menuButton" class="menu-button">☰</button>
        <h1 class="banner-title">Directory Structure</h1>
    </div>
    
    <div id="sidebar" class="sidebar">
        <div class="directory-tree">
            ${dirContent}
        </div>
    </div>

    <div id="overlay" class="overlay"></div>

    <div class="main-content">
        <iframe id="content-iframe" name="content-iframe" src="about:blank"></iframe>
    </div>
</body>
</html>`;

  try {
    fs.writeFileSync("index.html", html);
    console.log("Successfully generated index.html");
  } catch (err) {
    console.error("Error writing HTML file:", err);
  }
}

// 使用示例
const targetDir = "./"; // 当前目录，可以改为其他目录路径
generateFullHTML(targetDir);
