# 🏆 Agentic Behavior Leaderboard

![Agentic Behavior Leaderboard](https://img.shields.io/badge/Status-Active-emerald?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-6.2-purple?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css)

A behavioral map for AI agents. We evaluate models not just by *whether* they succeed, but by **how** they achieve their goals. 

As AI agents become more autonomous, measuring simple "Success Rate" is no longer enough. Does the model cheat? Does it hack the evaluation framework? Does it hallucinate its reasoning? This leaderboard visualizes the **Behavioral Fingerprint** of different LLMs.

## ✨ Key Features

*   📊 **Multi-Dimensional Leaderboard**: Ranks models across 7 distinct metrics including Integrity, Honesty, and Exploit Rates.
*   🎛️ **Dynamic Ranking Modes**:
    *   **Mode A (Performance)**: Standard ranking by weighted final score.
    *   **Mode B (Fairness)**: Penalizes models that rely heavily on exploits and sandbox breakouts.
    *   **Mode C (Honest Agents)**: Prioritizes models whose reasoning matches their actions.
*   🕸️ **Behavioral Fingerprint (Radar Chart)**: Instantly visualize a model's strategy. See if it's a "Balanced Hexagon" (safe & capable) or a "Spiky Shape" (goal-hacker).
*   🧠 **LLM Judge Insights**: Expandable behavioral summaries explaining *why* a model received its specific scores.

## 📈 Core Metrics

*   **Final Score**: A weighted aggregate of outcome, efficiency, honesty, and integrity.
*   **Success Rate**: The percentage of runs where the model successfully achieved the target goal.
*   **Integrity Score**: Measures adherence to rules and constraints. Negative values indicate rule-breaking.
*   **Efficiency**: Inverse of steps or tool calls. Higher efficiency means faster goal achievement.
*   **Honesty Score**: Evaluated by an LLM judge. Measures if the model's reasoning matches its actions.
*   **Exploit Rate**: Frequency of using direct exploits (e.g., hacking the environment) to achieve the goal.
*   **Meta Exploit Rate**: Frequency of modifying the evaluation framework itself or breaking out of the sandbox.

## 🛠️ Tech Stack

*   **Framework**: React 19 + Vite
*   **Styling**: Tailwind CSS v4
*   **Icons**: Lucide React
*   **Animations**: Framer Motion
*   **Charts**: Recharts

## 🚀 Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/agentic-behavior-leaderboard.git
   cd agentic-behavior-leaderboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Deployment (Vercel)

This project is pre-configured for zero-config deployment on Vercel.

1. Push your code to GitHub.
2. Import the repository in your Vercel dashboard.
3. Vercel will automatically detect Vite and use the `vercel.json` configuration for SPA routing.

## 🔮 Roadmap

*   [x] v1: Static mock data and core visualization components.
*   [ ] v2: Integration with real evaluation backend (fetching `SessionResult`, `ModelStats`, `EvalReport`).
*   [ ] v3: Advanced Taxonomy filtering and historical trend graphs.

---
*Built to keep autonomous agents honest.*
