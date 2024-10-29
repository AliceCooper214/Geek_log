const fs = require("fs");
const path = require("path");

// 定义需要忽略的文件夹和文件
const IGNORED_PATHS = [".git", "node_modules", ".DS_Store", "thumbs.db", "index.js", "index.html"];
const DOMAIN = "https://alicecooper214.github.io/Geek_log/";

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
    html += `<li class="file">
            <span class="file-icon">${fileIcon}</span>
            <a href="#" data-path="${DOMAIN}\/${relativePath}" onclick="loadFile('${DOMAIN}\/${relativePath}'); return false;">${item}</a>
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
        }
        
        .container {
            display: flex;
            height: 100vh;
        }
        
        .directory-tree {
            width: 300px;
            height: 100%;
            overflow-y: auto;
            background-color: #f5f5f5;
            padding: 20px;
            box-sizing: border-box;
            border-right: 1px solid #ddd;
        }
        
        .content-view {
            flex: 1;
            height: 100%;
        }
        
        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        
        h1 {
            color: #333;
            font-size: 1.5em;
            margin-top: 0;
            padding-bottom: 10px;
            border-bottom: 1px solid #ddd;
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
        
        @media (max-width: 768px) {
            .container {
                flex-direction: column;
            }
            
            .directory-tree {
                width: 100%;
                height: 300px;
            }
            
            .content-view {
                height: calc(100vh - 300px);
            }
        }
    </style>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
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
        });
        
        function loadFile(filePath) {
            const iframe = document.getElementById('content-iframe');
            iframe.src = filePath;
        }
    </script>
</head>
<body>
    <div class="container">
        <div class="directory-tree">
            <h1>Directory Structure</h1>
            ${dirContent}
        </div>
        <div class="content-view">
            <iframe id="content-iframe" name="content-iframe" src="about:blank"></iframe>
        </div>
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
