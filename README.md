# 🚀 Landing Page

**Modern Landing Page built with Vite + TypeScript + Tailwind CSS**

*Fast, lightweight, and performance-oriented frontend landing page*

[![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-3+-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[English](#english) | [Español](#español)

---

## English

### 🎯 What is this project?

This project is a **modern, high-performance landing page** built using **Vite + TypeScript + Tailwind CSS**.  
It focuses on:

- ⚡ Fast loading times  
- 🎨 Clean UI with animations (Lottie)  
- 📱 Responsive design  
- 🧪 Good Lighthouse performance scores  

Even though the project already achieves good performance metrics, there are some technical debts and architectural limitations to be addressed.

---

### 🛠️ Tech Stack

- **Vite** – Fast bundler and dev server  
- **TypeScript** – Static typing  
- **Tailwind CSS** – Utility-first styling  
- **EmailJS** – Client-side email handling  
- **Lottie (dotlottie-web)** – Animations  
- **ESLint + Prettier** – Code quality  
- **Rollup Visualizer** – Bundle analysis  

---

### 📁 Project Structure

```txt
Landing-Page/
├─ public/              # Public static assets
├─ src/
│  ├─ assets/           # SVGs, images, animations
│  ├─ functions/        # Project-specific logic
│  ├─ utils/            # Shared utilities
│  ├─ types/            # TypeScript types
│  └─ vite-env.d.ts     # Vite typings
├─ dist/                # Production build output
├─ index.html           # Main HTML entry point
├─ index.css            # Global styles
├─ vite.config.ts       # Vite configuration
├─ tsconfig.json        # TypeScript configuration
└─ package.json
