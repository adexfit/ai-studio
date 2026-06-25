// src/utils/templates.js

export const PROMPT_TEMPLATES = [
  {
    id: 'build-ea',
    label: 'Build EA',
    icon: 'Bot',
    category: 'Create',
    prompt: `Build a complete MT5 Expert Advisor for the following strategy:

Strategy details:
- 
- 

Requirements:
- Include proper risk management (stop loss, take profit)
- Add input parameters for all key settings
- Include comments explaining each section
- Handle all edge cases and errors`,
  },
  {
    id: 'build-indicator',
    label: 'Build Indicator',
    icon: 'BarChart2',
    category: 'Create',
    prompt: `Build a complete MQL5 custom indicator with the following specifications:

Indicator type: 
Description: 

Requirements:
- Draw on the main chart or separate window (specify which)
- Include all required buffers
- Add configurable input parameters
- Handle all timeframes correctly`,
  },
  {
    id: 'pine-to-mql5',
    label: 'Pine Script → MQL5',
    icon: 'ArrowRightLeft',
    category: 'Convert',
    prompt: `Convert the following Pine Script into a complete MQL5 indicator or EA.

Pine Script code:
\`\`\`
// Paste your Pine Script here
\`\`\`

Instructions:
- Preserve all logic exactly
- Convert all Pine Script functions to MQL5 equivalents
- Maintain all input parameters
- Ensure the output is fully compilable`,
  },
  {
    id: 'debug',
    label: 'Debug Compiler Errors',
    icon: 'Bug',
    category: 'Debug',
    prompt: `Analyze and fix the following MQL5 compilation errors:

Errors:
\`\`\`
// Paste compiler errors here
\`\`\`

Please:
- Identify the root cause of each error
- Fix all errors in the code
- Explain what was wrong and what you changed`,
  },
  {
    id: 'optimize',
    label: 'Optimize EA',
    icon: 'Zap',
    category: 'Improve',
    prompt: `Review and optimize this Expert Advisor for better performance and reliability:

Focus areas:
- Code efficiency and execution speed
- Memory management
- Risk management improvements
- Reduce redundant calculations
- Improve entry/exit logic if possible

Explain all optimizations made.`,
  },
  {
    id: 'explain',
    label: 'Explain Code',
    icon: 'BookOpen',
    category: 'Learn',
    prompt: `Explain the following MQL5 code in detail:

Please cover:
- What the overall strategy or indicator does
- How each major function works
- What each input parameter controls
- Any potential issues or improvements`,
  },
  {
    id: 'add-feature',
    label: 'Add Feature to EA',
    icon: 'PlusCircle',
    category: 'Improve',
    prompt: `Add the following feature to my existing Expert Advisor:

Feature to add:


Requirements:
- Integrate cleanly with existing code
- Add new input parameters if needed
- Don't break existing functionality
- Add comments explaining the new code`,
  },
  {
    id: 'add-trailing-stop',
    label: 'Add Trailing Stop',
    icon: 'TrendingUp',
    category: 'Improve',
    prompt: `Add a trailing stop mechanism to my Expert Advisor.

Trailing stop type: ATR-based / Fixed pips / Percentage (choose one)
Activation distance: 
Trail distance: 

Make it configurable via input parameters.`,
  },
  {
    id: 'risk-management',
    label: 'Improve Risk Management',
    icon: 'Shield',
    category: 'Improve',
    prompt: `Improve the risk management in my Expert Advisor. Add:

- Dynamic lot sizing based on account balance percentage
- Maximum daily loss limit
- Maximum number of concurrent trades
- Time-based filters (trading hours)
- News filter placeholder

All should be configurable via input parameters.`,
  },
  {
    id: 'backtest-report',
    label: 'Add Trade Statistics',
    icon: 'ClipboardList',
    category: 'Improve',
    prompt: `Add an OnTester() function and trade statistics panel to my EA that shows:

- Total trades, wins, losses, win rate
- Profit factor, expected payoff
- Max drawdown, recovery factor
- Average win/loss ratio

Display as a comment panel on the chart and print to journal.`,
  },
]

export const CATEGORIES = [...new Set(PROMPT_TEMPLATES.map(t => t.category))]
