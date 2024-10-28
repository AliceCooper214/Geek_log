const fs = require("fs");
const path = require("path");

// 定义需要忽略的文件夹和文件
const IGNORED_PATHS = [".git", "node_modules", ".DS_Store", "thumbs.db"];

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
            <a href="https://alicecooper214.github.io/Geek_log/${relativePath}">${item}</a>
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
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        h1 {
            color: #333;
            text-align: center;
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
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .file {
                margin-left: 10px;
            }
            
            ul {
                padding-left: 10px;
            }
        }
    </style>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // 添加文件夹点击展开/折叠功能
            document.querySelectorAll('.folder-name').forEach(folder => {
                folder.addEventListener('click', function() {
                    const ul = this.nextElementSibling;
                    if (ul && ul.tagName === 'UL') {
                        ul.style.display = ul.style.display === 'none' ? 'block' : 'none';
                    }
                });
            });
        });
    </script>
</head>
<body>
    <h1>Directory Structure</h1>
    ${dirContent}
</body>
</html>`;

  try {
    // 将生成的HTML写入文件
    fs.writeFileSync("index.html", html);
    console.log("Successfully generated directory-structure.html");
  } catch (err) {
    console.error("Error writing HTML file:", err);
  }
}

// 使用示例
const targetDir = "./"; // 当前目录，可以改为其他目录路径
generateFullHTML(targetDir);
