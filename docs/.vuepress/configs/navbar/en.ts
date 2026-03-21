import type { NavbarConfig } from "@vuepress/theme-default";

export const navbarEn: NavbarConfig = [
  {
    text: "🦆 About",
    link: "/about/",
    children: [
      {
        text: "🦆 About Me",
        link: "/about/README.md",
      },
      {
        text: "⛏️ Technology Stack",
        link: "/about/techstack.md",
      },
      {
        text: "🔗 Links",
        link: "/about/links.md",
      },
      {
        text: "🗒️ About Blog",
        link: "/about/blog.md",
      },
    ],
  },
  {
    text: "📝 Notes",
    link: "/notes/",
    children: [
      {
        text: "Algorithm",
        link: "/notes/Algorithm/",
      },
      {
        text: "C++",
        link: "/notes/C++/",
      },
      {
        text: "Compiler",
        link: "/notes/Compiler/",
      },
      {
        text: "Cryptography",
        link: "/notes/Cryptography/",
      },
      { text: "DevOps", link: "/notes/DevOps/" },
      {
        text: "Docker",
        link: "/notes/Docker/",
      },
      {
        text: "DuckDB",
        link: "/notes/DuckDB/",
      },
      {
        text: "Git",
        link: "/notes/Git/",
      },
      {
        text: "Java",
        link: "/notes/Java/",
      },
      {
        text: "Linux",
        link: "/notes/Linux/",
      },
      {
        text: "MS Office",
        link: "/notes/MS Office/",
      },
      {
        text: "MySQL",
        link: "/notes/MySQL/",
      },
      {
        text: "Network",
        link: "/notes/Network/",
      },
      {
        text: "Operating System",
        link: "/notes/Operating System/",
      },
      {
        text: "Performance",
        link: "/notes/Performance/",
      },
      {
        text: "PostgreSQL",
        link: "/notes/PostgreSQL/",
      },
      {
        text: "Productivity",
        link: "/notes/Productivity/",
      },
      {
        text: "Solidity",
        link: "/notes/Solidity/",
      },
      {
        text: "Vue.js",
        link: "/notes/Vue.js/",
      },
      {
        text: "Web",
        link: "/notes/Web/",
      },
      {
        text: "Wireless",
        link: "/notes/Wireless/",
      },
    ],
  },
  {
    text: "📚 Book Notes",
    children: [
      {
        text: "🐧 How Linux Works (notes)",
        link: "/how-linux-works-notes/",
      },
      {
        text: "🐧 Linux Kernel Comments (notes)",
        link: "/linux-kernel-comments-notes/",
      },
      {
        text: "🐧 Linux Kernel Development (notes)",
        link: "/linux-kernel-development-notes/",
      },
      {
        text: "🐤 μc/OS-II Source Code (notes)",
        link: "/uc-os-ii-code-notes/",
      },
      {
        text: "☕ Understanding the JVM (notes)",
        link: "/understanding-the-jvm-notes/",
      },
      {
        text: "⛸️ Redis Implementation (notes)",
        link: "/redis-implementation-notes/",
      },
      {
        text: "🗜️ Understanding Nginx (notes)",
        link: "/understanding-nginx-notes/",
      },
      {
        text: "⚙️ Netty in Action (notes)",
        link: "/netty-in-action-notes/",
      },
      {
        text: "☁️ Spring Microservices (notes)",
        link: "/spring-microservices-notes/",
      },
      {
        text: "⚒️ The Annotated STL Sources (notes)",
        link: "/the-annotated-stl-sources-notes/",
      },
    ],
  },
  {
    text: "🤯 Code Reading",
    children: [
      {
        text: "☕ Java Development Kit 8",
        link: "/jdk-source-code-analysis/",
      },
    ],
  },
];
