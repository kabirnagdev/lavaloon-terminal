import os

def generate_svg(filename, title, hotkey, content_markup):
    svg_template = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" width="1440" height="900" style="background:#080b11; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;">
  <defs>
    <style>
      .text-title {{ font-size: 14px; font-weight: 600; fill: #f8fafc; }}
      .text-subtitle {{ font-size: 12px; fill: #94a3b8; }}
      .text-body {{ font-size: 12px; fill: #cbd5e1; }}
      .text-muted {{ font-size: 11px; fill: #64748b; }}
      .text-accent {{ font-size: 11px; fill: #38bdf8; font-weight: 600; }}
      .text-green {{ font-size: 11px; fill: #2dd4bf; font-weight: 600; }}
      .text-amber {{ font-size: 11px; fill: #fbbf24; font-weight: 600; }}
      .panel-bg {{ fill: #0c1017; stroke: #1a2234; stroke-width: 1; }}
      .card-bg {{ fill: #111622; stroke: #1a2234; stroke-width: 1; }}
      .border-line {{ stroke: #1a2234; stroke-width: 1; }}
    </style>
  </defs>

  <!-- TOP GLOBAL BAR -->
  <rect x="0" y="0" width="1440" height="44" fill="#0c1017"/>
  <line x1="0" y1="44" x2="1440" y2="44" stroke="#1a2234" stroke-width="1"/>
  
  <!-- Logo / Identity -->
  <rect x="16" y="10" width="24" height="24" rx="4" fill="#38bdf8" fill-opacity="0.1" stroke="#38bdf8" stroke-opacity="0.3"/>
  <text x="28" y="26" text-anchor="middle" font-size="12" fill="#38bdf8" font-family="monospace">&gt;</text>
  <text x="48" y="26" class="text-title" font-size="13">LAVALOON</text>
  <rect x="122" y="12" width="72" height="20" rx="3" fill="#111622" stroke="#1a2234"/>
  <text x="158" y="26" text-anchor="middle" font-size="10" fill="#38bdf8" font-family="monospace">TERMINAL</text>
  <line x1="206" y1="14" x2="206" y2="30" stroke="#1a2234"/>
  <text x="218" y="26" class="text-subtitle">Workspace: <tspan fill="#f8fafc" font-weight="500">{title}</tspan></text>

  <!-- Center Search Field -->
  <rect x="520" y="8" width="400" height="28" rx="4" fill="#080b11" stroke="#1a2234"/>
  <text x="548" y="26" class="text-muted">Search companies, tickers, filings, ontology entities...</text>
  <rect x="896" y="12" width="16" height="18" rx="3" fill="#111622" stroke="#1a2234"/>
  <text x="904" y="25" text-anchor="middle" font-size="10" fill="#64748b" font-family="monospace">/</text>

  <!-- Top Right Stats -->
  <text x="1160" y="26" class="text-muted">COVERAGE: <tspan fill="#cbd5e1" font-weight="500">10 FILERS / 4 SURVEY</tspan></text>
  <text x="1350" y="26" class="text-muted">23:45:00 UTC</text>

  <!-- LEFT NAVIGATION BAR -->
  <rect x="0" y="44" width="200" height="832" fill="#0c1017"/>
  <line x1="200" y1="44" x2="200" y2="876" stroke="#1a2234"/>
  <text x="16" y="68" font-size="10" font-weight="600" fill="#64748b" letter-spacing="1">WORKSTATION</text>

  <!-- Nav Items -->
  <g transform="translate(8, 80)">
    <!-- F1 -->
    <rect x="0" y="0" width="184" height="32" rx="4" fill="{'#111622' if hotkey=='F1' else 'transparent'}" stroke="{'#1a2234' if hotkey=='F1' else 'transparent'}"/>
    <text x="12" y="20" font-size="12" fill="{'#38bdf8' if hotkey=='F1' else '#94a3b8'}" font-weight="{'600' if hotkey=='F1' else '400'}">Overview</text>
    <rect x="156" y="8" width="20" height="16" rx="3" fill="#080b11" stroke="#1a2234"/>
    <text x="166" y="20" text-anchor="middle" font-size="9" fill="#64748b" font-family="monospace">F1</text>
    
    <!-- F2 -->
    <rect x="0" y="36" width="184" height="32" rx="4" fill="{'#111622' if hotkey=='F2' else 'transparent'}" stroke="{'#1a2234' if hotkey=='F2' else 'transparent'}"/>
    <text x="12" y="56" font-size="12" fill="{'#38bdf8' if hotkey=='F2' else '#94a3b8'}" font-weight="{'600' if hotkey=='F2' else '400'}">Entity Explorer</text>
    <rect x="156" y="44" width="20" height="16" rx="3" fill="#080b11" stroke="#1a2234"/>
    <text x="166" y="56" text-anchor="middle" font-size="9" fill="#64748b" font-family="monospace">F2</text>

    <!-- F3 -->
    <rect x="0" y="72" width="184" height="32" rx="4" fill="{'#111622' if hotkey=='F3' else 'transparent'}" stroke="{'#1a2234' if hotkey=='F3' else 'transparent'}"/>
    <text x="12" y="92" font-size="12" fill="{'#38bdf8' if hotkey=='F3' else '#94a3b8'}" font-weight="{'600' if hotkey=='F3' else '400'}">Financial Intel</text>
    <rect x="156" y="80" width="20" height="16" rx="3" fill="#080b11" stroke="#1a2234"/>
    <text x="166" y="92" text-anchor="middle" font-size="9" fill="#64748b" font-family="monospace">F3</text>

    <!-- F4 -->
    <rect x="0" y="108" width="184" height="32" rx="4" fill="{'#111622' if hotkey=='F4' else 'transparent'}" stroke="{'#1a2234' if hotkey=='F4' else 'transparent'}"/>
    <text x="12" y="128" font-size="12" fill="{'#38bdf8' if hotkey=='F4' else '#94a3b8'}" font-weight="{'600' if hotkey=='F4' else '400'}">Knowledge Graph</text>
    <rect x="156" y="116" width="20" height="16" rx="3" fill="#080b11" stroke="#1a2234"/>
    <text x="166" y="128" text-anchor="middle" font-size="9" fill="#64748b" font-family="monospace">F4</text>

    <!-- F5 -->
    <rect x="0" y="144" width="184" height="32" rx="4" fill="{'#111622' if hotkey=='F5' else 'transparent'}" stroke="{'#1a2234' if hotkey=='F5' else 'transparent'}"/>
    <text x="12" y="164" font-size="12" fill="{'#38bdf8' if hotkey=='F5' else '#94a3b8'}" font-weight="{'600' if hotkey=='F5' else '400'}">GraphRAG Copilot</text>
    <rect x="156" y="152" width="20" height="16" rx="3" fill="#080b11" stroke="#1a2234"/>
    <text x="166" y="164" text-anchor="middle" font-size="9" fill="#64748b" font-family="monospace">F5</text>

    <!-- F6 -->
    <rect x="0" y="180" width="184" height="32" rx="4" fill="{'#111622' if hotkey=='F6' else 'transparent'}" stroke="{'#1a2234' if hotkey=='F6' else 'transparent'}"/>
    <text x="12" y="200" font-size="12" fill="{'#38bdf8' if hotkey=='F6' else '#94a3b8'}" font-weight="{'600' if hotkey=='F6' else '400'}">Due Diligence</text>
    <rect x="156" y="188" width="20" height="16" rx="3" fill="#080b11" stroke="#1a2234"/>
    <text x="166" y="200" text-anchor="middle" font-size="9" fill="#64748b" font-family="monospace">F6</text>

    <!-- F7 -->
    <rect x="0" y="216" width="184" height="32" rx="4" fill="{'#111622' if hotkey=='F7' else 'transparent'}" stroke="{'#1a2234' if hotkey=='F7' else 'transparent'}"/>
    <text x="12" y="236" font-size="12" fill="{'#38bdf8' if hotkey=='F7' else '#94a3b8'}" font-weight="{'600' if hotkey=='F7' else '400'}">Options Desk</text>
    <rect x="156" y="224" width="20" height="16" rx="3" fill="#080b11" stroke="#1a2234"/>
    <text x="166" y="236" text-anchor="middle" font-size="9" fill="#64748b" font-family="monospace">F7</text>

    <!-- F8 -->
    <rect x="0" y="252" width="184" height="32" rx="4" fill="{'#111622' if hotkey=='F8' else 'transparent'}" stroke="{'#1a2234' if hotkey=='F8' else 'transparent'}"/>
    <text x="12" y="272" font-size="12" fill="{'#38bdf8' if hotkey=='F8' else '#94a3b8'}" font-weight="{'600' if hotkey=='F8' else '400'}">System Config</text>
    <rect x="156" y="260" width="20" height="16" rx="3" fill="#080b11" stroke="#1a2234"/>
    <text x="166" y="272" text-anchor="middle" font-size="9" fill="#64748b" font-family="monospace">F8</text>
  </g>

  <!-- MAIN WORKSPACE CONTENT -->
  <g transform="translate(200, 44)">
    {content_markup}
  </g>

  <!-- BOTTOM STATUS BAR -->
  <rect x="0" y="876" width="1440" height="24" fill="#0c1017"/>
  <line x1="0" y1="876" x2="1440" y2="876" stroke="#1a2234"/>
  <circle cx="16" cy="888" r="3" fill="#94a3b8"/>
  <text x="26" y="891" font-size="10" fill="#cbd5e1" font-family="monospace">CORE:ONLINE</text>
  <text x="120" y="891" font-size="10" fill="#64748b" font-family="monospace">|</text>
  <text x="136" y="891" font-size="10" fill="#64748b" font-family="monospace">GRAPH: <tspan fill="#cbd5e1">NETWORKX/RDF (444N/1448E)</tspan></text>
  <text x="360" y="891" font-size="10" fill="#64748b" font-family="monospace">|</text>
  <text x="376" y="891" font-size="10" fill="#64748b" font-family="monospace">EMBED: <tspan fill="#cbd5e1">all-MiniLM-L6-v2</tspan></text>
  <text x="560" y="891" font-size="10" fill="#64748b" font-family="monospace">|</text>
  <text x="576" y="891" font-size="10" fill="#64748b" font-family="monospace">SEC EDGAR: <tspan fill="#2dd4bf">134 FACTS AUDITED</tspan></text>
  <text x="780" y="891" font-size="10" fill="#64748b" font-family="monospace">|</text>
  <text x="796" y="891" font-size="10" fill="#64748b" font-family="monospace">LLM: <tspan fill="#2dd4bf">GROQ (CONNECTED)</tspan></text>
  <text x="1350" y="891" font-size="10" fill="#64748b" font-family="monospace">23:45:00 UTC</text>
</svg>'''
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(svg_template)

# Define each screen's content markup
overview_content = '''
  <!-- Overview Dashboard Content -->
  <!-- Top Status Strip -->
  <rect x="24" y="20" width="1192" height="40" rx="4" class="panel-bg"/>
  <text x="40" y="44" class="text-subtitle"><tspan fill="#38bdf8" font-weight="600">DATASET COVERAGE:</tspan> 10 Corporate Filers | 4 Empirical Survey Avenues | 134 XBRL Facts | 184 Graph Lift Ties</text>
  <text x="1080" y="44" class="text-green">ENGINE HEALTHY</text>

  <!-- 4 KPI Metrics -->
  <g transform="translate(24, 76)">
    <!-- KPI 1 -->
    <rect x="0" y="0" width="286" height="88" rx="4" class="card-bg"/>
    <text x="16" y="24" class="text-muted">CORPORATE FILERS</text>
    <text x="16" y="58" font-size="28" font-weight="700" fill="#f8fafc">10</text>
    <text x="16" y="76" class="text-muted">SEC 10-K &amp; MCA Audited Entities</text>

    <!-- KPI 2 -->
    <rect x="302" y="0" width="286" height="88" rx="4" class="card-bg"/>
    <text x="318" y="24" class="text-muted">AUDITED XBRL FACTS</text>
    <text x="318" y="58" font-size="28" font-weight="700" fill="#f8fafc">134</text>
    <text x="318" y="76" class="text-muted">Balance Sheets &amp; Segment Disclosures</text>

    <!-- KPI 3 -->
    <rect x="604" y="0" width="286" height="88" rx="4" class="card-bg"/>
    <text x="620" y="24" class="text-muted">KNOWLEDGE GRAPH TIES</text>
    <text x="620" y="58" font-size="28" font-weight="700" fill="#f8fafc">184</text>
    <text x="620" y="76" class="text-muted">Lift &#8805; 1.5x Significant Association</text>

    <!-- KPI 4 -->
    <rect x="906" y="0" width="286" height="88" rx="4" class="card-bg"/>
    <text x="922" y="24" class="text-muted">REASONING ENGINE</text>
    <text x="922" y="54" font-size="18" font-weight="700" fill="#38bdf8">GROQ LLM</text>
    <text x="922" y="76" class="text-muted">qwen3.8-27b &amp; gpt-oss-120b</text>
  </g>

  <!-- Verified Filings Table -->
  <g transform="translate(24, 180)">
    <rect x="0" y="0" width="780" height="620" rx="4" class="panel-bg"/>
    <text x="20" y="28" class="text-title">Verified Regulatory Filings Directory</text>
    <line x1="0" y1="44" x2="780" y2="44" class="border-line"/>

    <!-- Table Header -->
    <text x="20" y="66" class="text-muted">TICKER</text>
    <text x="90" y="66" class="text-muted">REPORTING ENTITY</text>
    <text x="280" y="66" class="text-muted">PERIOD</text>
    <text x="380" y="66" class="text-muted">STANDARDS</text>
    <text x="520" y="66" class="text-muted">FILING SOURCE</text>
    <text x="700" y="66" class="text-muted">STATUS</text>
    <line x1="20" y1="76" x2="760" y2="76" class="border-line"/>

    <!-- Rows -->
    <g transform="translate(20, 100)">
      <text x="0" y="0" font-weight="600" fill="#38bdf8">AAPL</text>
      <text x="70" y="0" class="text-body">Apple Inc.</text>
      <text x="260" y="0" class="text-muted">FY2025</text>
      <text x="360" y="0" class="text-muted">US-GAAP</text>
      <text x="500" y="0" class="text-body">SEC Form 10-K Annual Report</text>
      <text x="680" y="0" class="text-green">AUDITED</text>
    </g>
    <g transform="translate(20, 140)">
      <text x="0" y="0" font-weight="600" fill="#38bdf8">MSFT</text>
      <text x="70" y="0" class="text-body">Microsoft Corporation</text>
      <text x="260" y="0" class="text-muted">FY2024</text>
      <text x="360" y="0" class="text-muted">US-GAAP</text>
      <text x="500" y="0" class="text-body">SEC Form 10-K Annual Report</text>
      <text x="680" y="0" class="text-green">AUDITED</text>
    </g>
    <g transform="translate(20, 180)">
      <text x="0" y="0" font-weight="600" fill="#38bdf8">NVDA</text>
      <text x="70" y="0" class="text-body">NVIDIA Corporation</text>
      <text x="260" y="0" class="text-muted">FY2025</text>
      <text x="360" y="0" class="text-muted">US-GAAP</text>
      <text x="500" y="0" class="text-body">SEC Form 10-K Annual Report</text>
      <text x="680" y="0" class="text-green">AUDITED</text>
    </g>
    <g transform="translate(20, 220)">
      <text x="0" y="0" font-weight="600" fill="#38bdf8">AMZN</text>
      <text x="70" y="0" class="text-body">Amazon.com Inc.</text>
      <text x="260" y="0" class="text-muted">FY2024</text>
      <text x="360" y="0" class="text-muted">US-GAAP</text>
      <text x="500" y="0" class="text-body">SEC Form 10-K Annual Report</text>
      <text x="680" y="0" class="text-green">AUDITED</text>
    </g>
    <g transform="translate(20, 260)">
      <text x="0" y="0" font-weight="600" fill="#38bdf8">RELIANCE</text>
      <text x="70" y="0" class="text-body">Reliance Industries Ltd</text>
      <text x="260" y="0" class="text-muted">FY2024</text>
      <text x="360" y="0" class="text-muted">Ind-AS</text>
      <text x="500" y="0" class="text-body">Audited Consolidated Financials</text>
      <text x="680" y="0" class="text-green">AUDITED</text>
    </g>
    <g transform="translate(20, 300)">
      <text x="0" y="0" font-weight="600" fill="#38bdf8">TCS</text>
      <text x="70" y="0" class="text-body">Tata Consultancy Services</text>
      <text x="260" y="0" class="text-muted">FY2024</text>
      <text x="360" y="0" class="text-muted">Ind-AS</text>
      <text x="500" y="0" class="text-body">MCA Annual Filing 2024</text>
      <text x="680" y="0" class="text-green">AUDITED</text>
    </g>
  </g>

  <!-- Right Jump Cards -->
  <g transform="translate(820, 180)">
    <rect x="0" y="0" width="396" height="295" rx="4" class="panel-bg"/>
    <text x="20" y="28" class="text-title">Active Target Profile: Apple Inc.</text>
    <line x1="0" y1="44" x2="396" y2="44" class="border-line"/>
    <text x="20" y="70" class="text-subtitle">REVENUE (FY2025): <tspan fill="#f8fafc" font-weight="600">$383.29B</tspan></text>
    <text x="20" y="96" class="text-subtitle">NET INCOME: <tspan fill="#f8fafc" font-weight="600">$97.00B</tspan> (Margin: 29.82%)</text>
    <text x="20" y="122" class="text-subtitle">FREE CASH FLOW: <tspan fill="#2dd4bf" font-weight="600">$99.58B</tspan></text>
    <text x="20" y="148" class="text-subtitle">LIQUIDITY: <tspan fill="#f8fafc">$29.94B Cash</tspan> vs <tspan fill="#f8fafc">$85.75B Debt</tspan></text>
    <rect x="20" y="175" width="160" height="32" rx="4" fill="#111622" stroke="#38bdf8"/>
    <text x="100" y="196" text-anchor="middle" class="text-accent">Open Company Dossier</text>
  </g>

  <g transform="translate(820, 495)">
    <rect x="0" y="0" width="396" height="305" rx="4" class="panel-bg"/>
    <text x="20" y="28" class="text-title">Empirical Survey Intelligence</text>
    <line x1="0" y1="44" x2="396" y2="44" class="border-line"/>
    <text x="20" y="70" class="text-body">&#8226; Mutual Funds: 184 Ties with Wealth Creation</text>
    <text x="20" y="100" class="text-body">&#8226; Equity Market: 20-30% Expected Returns Cohort</text>
    <text x="20" y="130" class="text-body">&#8226; Government Bonds: Risk-Free &amp; Assured Returns</text>
    <text x="20" y="160" class="text-body">&#8226; Fixed Deposits: Senior &amp; Conservative Profiles</text>
    <rect x="20" y="190" width="160" height="32" rx="4" fill="#111622" stroke="#1a2234"/>
    <text x="100" y="211" text-anchor="middle" class="text-body">Explore Graph (F4)</text>
  </g>
'''

entity_explorer_content = '''
  <!-- 3-Region Layout -->
  <!-- Left Column: Directory -->
  <rect x="0" y="0" width="280" height="832" fill="#0c1017"/>
  <line x1="280" y1="0" x2="280" y2="832" class="border-line"/>
  <text x="20" y="32" class="text-title">Entity Directory</text>
  <rect x="20" y="48" width="240" height="28" rx="4" fill="#080b11" stroke="#1a2234"/>
  <text x="32" y="66" class="text-muted">Filter entity...</text>

  <!-- Items in Left Directory -->
  <g transform="translate(20, 95)">
    <rect x="0" y="0" width="240" height="48" rx="4" fill="#111622" stroke="#38bdf8"/>
    <text x="12" y="22" font-weight="600" fill="#38bdf8">AAPL</text>
    <text x="60" y="22" class="text-body">Apple Inc.</text>
    <text x="12" y="38" class="text-muted">Technology &#8226; United States</text>
  </g>
  <g transform="translate(20, 150)">
    <rect x="0" y="0" width="240" height="48" rx="4" fill="#0c1017" stroke="#1a2234"/>
    <text x="12" y="22" font-weight="600" fill="#cbd5e1">MSFT</text>
    <text x="60" y="22" class="text-body">Microsoft Corp.</text>
    <text x="12" y="38" class="text-muted">Technology &#8226; United States</text>
  </g>
  <g transform="translate(20, 205)">
    <rect x="0" y="0" width="240" height="48" rx="4" fill="#0c1017" stroke="#1a2234"/>
    <text x="12" y="22" font-weight="600" fill="#cbd5e1">NVDA</text>
    <text x="60" y="22" class="text-body">NVIDIA Corp.</text>
    <text x="12" y="38" class="text-muted">Semiconductors &#8226; US</text>
  </g>
  <g transform="translate(20, 260)">
    <rect x="0" y="0" width="240" height="48" rx="4" fill="#0c1017" stroke="#1a2234"/>
    <text x="12" y="22" font-weight="600" fill="#cbd5e1">RELIANCE</text>
    <text x="80" y="22" class="text-body">Reliance Ind.</text>
    <text x="12" y="38" class="text-muted">Energy &amp; Retail &#8226; India</text>
  </g>

  <!-- Center Column: Company Dossier -->
  <g transform="translate(280, 0)">
    <!-- Header -->
    <rect x="0" y="0" width="660" height="90" fill="#0c1017"/>
    <line x1="0" y1="90" x2="660" y2="90" class="border-line"/>
    <text x="30" y="38" font-size="20" font-weight="700" fill="#f8fafc">Apple Inc. (AAPL)</text>
    <text x="30" y="64" class="text-subtitle">Sector: Consumer Electronics &amp; Cloud Services | Filing: SEC Form 10-K (FY2025)</text>
    <rect x="520" y="24" width="110" height="28" rx="4" fill="#111622" stroke="#38bdf8"/>
    <text x="575" y="42" text-anchor="middle" class="text-accent">Due Diligence</text>

    <!-- 12-Metrics Audited Grid -->
    <text x="30" y="125" class="text-title">Audited Financial Metrics (US-GAAP)</text>
    <g transform="translate(30, 140)">
      <rect x="0" y="0" width="190" height="70" rx="4" class="card-bg"/>
      <text x="12" y="22" class="text-muted">TOTAL REVENUE</text>
      <text x="12" y="50" font-size="18" font-weight="700" fill="#f8fafc">$383.29B</text>

      <rect x="205" y="0" width="190" height="70" rx="4" class="card-bg"/>
      <text x="217" y="22" class="text-muted">NET INCOME</text>
      <text x="217" y="50" font-size="18" font-weight="700" fill="#f8fafc">$97.00B</text>

      <rect x="410" y="0" width="190" height="70" rx="4" class="card-bg"/>
      <text x="422" y="22" class="text-muted">OPERATING MARGIN</text>
      <text x="422" y="50" font-size="18" font-weight="700" fill="#2dd4bf">29.82%</text>

      <rect x="0" y="80" width="190" height="70" rx="4" class="card-bg"/>
      <text x="12" y="102" class="text-muted">FREE CASH FLOW</text>
      <text x="12" y="130" font-size="18" font-weight="700" fill="#2dd4bf">$99.58B</text>

      <rect x="205" y="80" width="190" height="70" rx="4" class="card-bg"/>
      <text x="217" y="102" class="text-muted">CASH &amp; LIQUIDITY</text>
      <text x="217" y="130" font-size="18" font-weight="700" fill="#f8fafc">$29.94B</text>

      <rect x="410" y="80" width="190" height="70" rx="4" class="card-bg"/>
      <text x="422" y="102" class="text-muted">TOTAL DEBT</text>
      <text x="422" y="130" font-size="18" font-weight="700" fill="#f8fafc">$85.75B</text>
    </g>

    <!-- Segments Breakdown -->
    <text x="30" y="330" class="text-title">Business Segment Revenue Breakdown</text>
    <g transform="translate(30, 345)">
      <rect x="0" y="0" width="600" height="150" rx="4" class="panel-bg"/>
      <text x="20" y="30" class="text-body">iPhone Hardware ($201.2B - 52.5%)</text>
      <rect x="20" y="38" width="560" height="8" rx="2" fill="#1a2234"/>
      <rect x="20" y="38" width="294" height="8" rx="2" fill="#38bdf8"/>

      <text x="20" y="70" class="text-body">Services &amp; App Store ($85.2B - 22.2%)</text>
      <rect x="20" y="78" width="560" height="8" rx="2" fill="#1a2234"/>
      <rect x="20" y="78" width="124" height="8" rx="2" fill="#2dd4bf"/>

      <text x="20" y="110" class="text-body">Wearables &amp; Mac/iPad ($96.9B - 25.3%)</text>
      <rect x="20" y="118" width="560" height="8" rx="2" fill="#1a2234"/>
      <rect x="20" y="118" width="142" height="8" rx="2" fill="#fbbf24"/>
    </g>

    <!-- Item 1A Risks -->
    <text x="30" y="535" class="text-title">Item 1A Regulatory Risk Factors (SEC 10-K)</text>
    <g transform="translate(30, 550)">
      <rect x="0" y="0" width="600" height="180" rx="4" class="panel-bg"/>
      <text x="20" y="30" class="text-body">&#8226; Supply chain concentration in single-source semiconductor fabs.</text>
      <text x="20" y="60" class="text-body">&#8226; Antitrust and regulatory scrutiny over App Store commission rates.</text>
      <text x="20" y="90" class="text-body">&#8226; Global consumer spending volatility and currency exchange headwinds.</text>
      <text x="20" y="120" class="text-body">&#8226; Rapid AI hardware competitive cycles and R&amp;D investments.</text>
    </g>
  </g>

  <!-- Right Column: Contextual Intelligence -->
  <g transform="translate(940, 0)">
    <line x1="0" y1="0" x2="0" y2="832" class="border-line"/>
    <rect x="0" y="0" width="300" height="832" fill="#0c1017"/>
    <text x="20" y="32" class="text-title">Contextual Intelligence</text>

    <!-- Peer Competitors -->
    <text x="20" y="70" class="text-subtitle">PEER COMPETITORS</text>
    <rect x="20" y="85" width="260" height="32" rx="4" class="card-bg"/>
    <text x="32" y="105" class="text-body">Microsoft Corporation (MSFT)</text>
    <rect x="20" y="125" width="260" height="32" rx="4" class="card-bg"/>
    <text x="32" y="145" class="text-body">Alphabet Inc. (GOOGL)</text>
    <rect x="20" y="165" width="260" height="32" rx="4" class="card-bg"/>
    <text x="32" y="185" class="text-body">Samsung Electronics</text>

    <!-- Supply Chain -->
    <text x="20" y="235" class="text-subtitle">SUPPLY CHAIN PARTNERS</text>
    <rect x="20" y="250" width="260" height="32" rx="4" class="card-bg"/>
    <text x="32" y="270" class="text-body">Taiwan Semiconductor (TSMC)</text>
    <rect x="20" y="290" width="260" height="32" rx="4" class="card-bg"/>
    <text x="32" y="310" class="text-body">Foxconn (Hon Hai Precision)</text>
    <rect x="20" y="330" width="260" height="32" rx="4" class="card-bg"/>
    <text x="32" y="350" class="text-body">Sony Group (Camera Sensors)</text>
  </g>
'''

financials_content = '''
  <!-- Financial Intel Workspace -->
  <rect x="24" y="20" width="1192" height="50" rx="4" class="panel-bg"/>
  <text x="44" y="50" class="text-title">Comparative Financial Statement Matrix</text>
  <text x="800" y="50" class="text-muted">CURRENCY: <tspan fill="#38bdf8">USD Billions (US Filers)</tspan> | <tspan fill="#fbbf24">INR Crores (Indian Filers)</tspan></text>

  <!-- Table -->
  <g transform="translate(24, 90)">
    <rect x="0" y="0" width="1192" height="710" rx="4" class="panel-bg"/>
    <!-- Header -->
    <rect x="0" y="0" width="1192" height="36" fill="#111622"/>
    <text x="20" y="22" class="text-muted">COMPANY / TICKER</text>
    <text x="220" y="22" class="text-muted">PERIOD</text>
    <text x="320" y="22" class="text-muted">REVENUE</text>
    <text x="440" y="22" class="text-muted">NET INCOME</text>
    <text x="560" y="22" class="text-muted">OP MARGIN</text>
    <text x="680" y="22" class="text-muted">FREE CASH FLOW</text>
    <text x="820" y="22" class="text-muted">CASH</text>
    <text x="940" y="22" class="text-muted">TOTAL DEBT</text>
    <text x="1080" y="22" class="text-muted">AUDITED</text>
    <line x1="0" y1="36" x2="1192" y2="36" class="border-line"/>

    <!-- Row 1 -->
    <g transform="translate(20, 70)">
      <text x="0" y="0" font-weight="600" fill="#38bdf8">Apple Inc. (AAPL)</text>
      <text x="200" y="0" class="text-body">FY2025</text>
      <text x="300" y="0" class="text-body">$383.29B</text>
      <text x="420" y="0" class="text-body">$97.00B</text>
      <text x="540" y="0" class="text-green">29.82%</text>
      <text x="660" y="0" class="text-green">$99.58B</text>
      <text x="800" y="0" class="text-body">$29.94B</text>
      <text x="920" y="0" class="text-body">$85.75B</text>
      <text x="1060" y="0" class="text-green">SEC 10-K</text>
    </g>
    <line x1="0" y1="85" x2="1192" y2="85" class="border-line"/>

    <!-- Row 2 -->
    <g transform="translate(20, 115)">
      <text x="0" y="0" font-weight="600" fill="#38bdf8">Microsoft (MSFT)</text>
      <text x="200" y="0" class="text-body">FY2024</text>
      <text x="300" y="0" class="text-body">$245.12B</text>
      <text x="420" y="0" class="text-body">$88.14B</text>
      <text x="540" y="0" class="text-green">44.64%</text>
      <text x="660" y="0" class="text-green">$74.07B</text>
      <text x="800" y="0" class="text-body">$75.54B</text>
      <text x="920" y="0" class="text-body">$44.90B</text>
      <text x="1060" y="0" class="text-green">SEC 10-K</text>
    </g>
    <line x1="0" y1="130" x2="1192" y2="130" class="border-line"/>

    <!-- Row 3 -->
    <g transform="translate(20, 160)">
      <text x="0" y="0" font-weight="600" fill="#38bdf8">NVIDIA (NVDA)</text>
      <text x="200" y="0" class="text-body">FY2025</text>
      <text x="300" y="0" class="text-body">$96.31B</text>
      <text x="420" y="0" class="text-body">$53.05B</text>
      <text x="540" y="0" class="text-green">61.50%</text>
      <text x="660" y="0" class="text-green">$48.20B</text>
      <text x="800" y="0" class="text-body">$31.44B</text>
      <text x="920" y="0" class="text-body">$8.46B</text>
      <text x="1060" y="0" class="text-green">SEC 10-K</text>
    </g>
    <line x1="0" y1="175" x2="1192" y2="175" class="border-line"/>

    <!-- Row 4 -->
    <g transform="translate(20, 205)">
      <text x="0" y="0" font-weight="600" fill="#38bdf8">Amazon.com (AMZN)</text>
      <text x="200" y="0" class="text-body">FY2024</text>
      <text x="300" y="0" class="text-body">$574.78B</text>
      <text x="420" y="0" class="text-body">$30.43B</text>
      <text x="540" y="0" class="text-green">6.40%</text>
      <text x="660" y="0" class="text-green">$35.50B</text>
      <text x="800" y="0" class="text-body">$86.78B</text>
      <text x="920" y="0" class="text-body">$134.20B</text>
      <text x="1060" y="0" class="text-green">SEC 10-K</text>
    </g>
    <line x1="0" y1="220" x2="1192" y2="220" class="border-line"/>

    <!-- Row 5 (India) -->
    <g transform="translate(20, 250)">
      <text x="0" y="0" font-weight="600" fill="#fbbf24">Reliance Ind. (RELIANCE)</text>
      <text x="200" y="0" class="text-body">FY2024</text>
      <text x="300" y="0" class="text-body">&#8377;10,00,122 Cr</text>
      <text x="420" y="0" class="text-body">&#8377;79,020 Cr</text>
      <text x="540" y="0" class="text-green">14.20%</text>
      <text x="660" y="0" class="text-amber">-&#8377;7,769 Cr</text>
      <text x="800" y="0" class="text-body">&#8377;88,000 Cr</text>
      <text x="920" y="0" class="text-body">&#8377;3,24,622 Cr</text>
      <text x="1060" y="0" class="text-green">Ind-AS</text>
    </g>
    <line x1="0" y1="265" x2="1192" y2="265" class="border-line"/>

    <!-- Row 6 (India) -->
    <g transform="translate(20, 295)">
      <text x="0" y="0" font-weight="600" fill="#fbbf24">TCS Ltd (TCS)</text>
      <text x="200" y="0" class="text-body">FY2024</text>
      <text x="300" y="0" class="text-body">&#8377;2,40,893 Cr</text>
      <text x="420" y="0" class="text-body">&#8377;45,908 Cr</text>
      <text x="540" y="0" class="text-green">24.60%</text>
      <text x="660" y="0" class="text-green">&#8377;41,200 Cr</text>
      <text x="800" y="0" class="text-body">&#8377;11,800 Cr</text>
      <text x="920" y="0" class="text-body">&#8377;7,800 Cr</text>
      <text x="1060" y="0" class="text-green">Ind-AS</text>
    </g>
  </g>
'''

graph_content = '''
  <!-- Knowledge Graph Workspace -->
  <g transform="translate(0, 0)">
    <!-- Central Graph Canvas -->
    <rect x="0" y="0" width="940" height="832" fill="#070a10"/>
    
    <!-- Graph Toolbar -->
    <rect x="0" y="0" width="940" height="40" fill="#0c1017"/>
    <line x1="0" y1="40" x2="940" y2="40" class="border-line"/>
    <text x="20" y="25" class="text-title">Ontology Relationship Explorer</text>
    <text x="300" y="25" class="text-muted">Layout: <tspan fill="#38bdf8">Force-Directed (CoSE)</tspan> | Min Lift: <tspan fill="#cbd5e1">1.5x</tspan></text>

    <!-- Graph Visual Nodes & Edges (Palantir style) -->
    <!-- Center Node -->
    <circle cx="470" cy="400" r="32" fill="#38bdf8" fill-opacity="0.2" stroke="#38bdf8" stroke-width="2"/>
    <text x="470" y="405" text-anchor="middle" font-size="11" font-weight="600" fill="#f8fafc">Mutual Funds</text>

    <!-- Edge 1 -->
    <line x1="470" y1="368" x2="350" y2="240" stroke="#334155" stroke-width="2"/>
    <circle cx="350" cy="240" r="24" fill="#2dd4bf" fill-opacity="0.2" stroke="#2dd4bf" stroke-width="2"/>
    <text x="350" y="244" text-anchor="middle" font-size="10" fill="#f8fafc">Wealth Creation</text>

    <!-- Edge 2 -->
    <line x1="470" y1="432" x2="320" y2="540" stroke="#334155" stroke-width="1.5"/>
    <circle cx="320" cy="540" r="22" fill="#fbbf24" fill-opacity="0.2" stroke="#fbbf24" stroke-width="1.5"/>
    <text x="320" y="544" text-anchor="middle" font-size="10" fill="#f8fafc">Age 20-30</text>

    <!-- Edge 3 -->
    <line x1="502" y1="400" x2="680" y2="340" stroke="#334155" stroke-width="2"/>
    <circle cx="680" cy="340" r="26" fill="#818cf8" fill-opacity="0.2" stroke="#818cf8" stroke-width="2"/>
    <text x="680" y="344" text-anchor="middle" font-size="10" fill="#f8fafc">Better Returns</text>

    <!-- Edge 4 -->
    <line x1="490" y1="425" x2="650" y2="520" stroke="#334155" stroke-width="1.5"/>
    <circle cx="650" cy="520" r="22" fill="#f43f5e" fill-opacity="0.2" stroke="#f43f5e" stroke-width="1.5"/>
    <text x="650" y="524" text-anchor="middle" font-size="10" fill="#f8fafc">Duration 1-3Y</text>

    <!-- Graph Legend Overlay -->
    <rect x="20" y="720" width="220" height="90" rx="4" fill="#0c1017" fill-opacity="0.95" stroke="#1a2234"/>
    <text x="32" y="740" font-size="10" font-weight="600" fill="#64748b">ONTOLOGY LEGEND</text>
    <circle cx="40" cy="760" r="4" fill="#38bdf8"/>
    <text x="52" y="763" font-size="10" fill="#cbd5e1">Investment Avenue</text>
    <circle cx="40" cy="780" r="4" fill="#2dd4bf"/>
    <text x="52" y="783" font-size="10" fill="#cbd5e1">Investor Objective</text>
    <circle cx="140" cy="760" r="4" fill="#fbbf24"/>
    <text x="152" y="763" font-size="10" fill="#cbd5e1">Demographics</text>
    <circle cx="140" cy="780" r="4" fill="#818cf8"/>
    <text x="152" y="783" font-size="10" fill="#cbd5e1">Reasoning Factor</text>
  </g>

  <!-- Right Inspector Panel -->
  <g transform="translate(940, 0)">
    <line x1="0" y1="0" x2="0" y2="832" class="border-line"/>
    <rect x="0" y="0" width="300" height="832" fill="#0c1017"/>
    <text x="20" y="32" class="text-title">Entity &amp; Tie Inspector</text>
    <line x1="0" y1="44" x2="300" y2="44" class="border-line"/>

    <text x="20" y="72" class="text-muted">SELECTED NODE</text>
    <text x="20" y="96" font-size="16" font-weight="600" fill="#38bdf8">Mutual Funds</text>
    <rect x="20" y="110" width="100" height="20" rx="3" fill="#111622" stroke="#1a2234"/>
    <text x="70" y="124" text-anchor="middle" font-size="10" fill="#38bdf8">Avenue Node</text>

    <g transform="translate(20, 145)">
      <rect x="0" y="0" width="260" height="110" rx="4" class="card-bg"/>
      <text x="16" y="24" class="text-muted">Association Degree: <tspan fill="#f8fafc" font-weight="600">184 Edges</tspan></text>
      <text x="16" y="50" class="text-muted">Empirical Observations: <tspan fill="#f8fafc" font-weight="600">40 Records</tspan></text>
      <text x="16" y="76" class="text-muted">Max Cohort Lift: <tspan fill="#2dd4bf" font-weight="600">3.8x Lift</tspan></text>
      <text x="16" y="98" class="text-muted">Primary Objective: <tspan fill="#38bdf8">Wealth Creation</tspan></text>
    </g>

    <!-- Pathfinder -->
    <g transform="translate(20, 580)">
      <rect x="0" y="0" width="260" height="230" rx="4" class="card-bg"/>
      <text x="16" y="24" class="text-title">Dijkstra Pathfinder</text>
      <rect x="16" y="38" width="228" height="28" rx="3" fill="#080b11" stroke="#1a2234"/>
      <text x="26" y="56" class="text-body">Source: Mutual Funds</text>
      <rect x="16" y="74" width="228" height="28" rx="3" fill="#080b11" stroke="#1a2234"/>
      <text x="26" y="92" class="text-body">Target: Safe Investment</text>
      <rect x="16" y="112" width="228" height="30" rx="3" fill="#38bdf8" fill-opacity="0.15" stroke="#38bdf8"/>
      <text x="130" y="131" text-anchor="middle" class="text-accent">Calculate Path (1/Lift)</text>
      <text x="16" y="165" class="text-green">Path Found (2 hops):</text>
      <text x="16" y="185" class="text-muted">Mutual Funds &#8594; Gold &#8594; Safe Investment</text>
    </g>
  </g>
'''

copilot_content = '''
  <!-- GraphRAG Research Console -->
  <g transform="translate(0, 0)">
    <rect x="0" y="0" width="940" height="832" fill="#080b11"/>
    
    <!-- Header -->
    <rect x="0" y="0" width="940" height="44" fill="#0c1017"/>
    <line x1="0" y1="44" x2="940" y2="44" class="border-line"/>
    <text x="24" y="28" class="text-title">GraphRAG Research Console</text>
    <rect x="740" y="8" width="180" height="28" rx="4" fill="#111622" stroke="#38bdf8"/>
    <text x="830" y="26" text-anchor="middle" class="text-accent">Mode: Multi-Hop BFS</text>

    <!-- Query Composer -->
    <g transform="translate(24, 60)">
      <rect x="0" y="0" width="892" height="110" rx="4" class="panel-bg"/>
      <text x="20" y="28" class="text-muted">FINANCIAL RESEARCH INQUIRY</text>
      <rect x="20" y="38" width="720" height="52" rx="4" fill="#080b11" stroke="#1a2234"/>
      <text x="32" y="68" class="text-body">What kind of investors prefer Mutual Funds, and what else do they choose?</text>
      <rect x="755" y="38" width="115" height="52" rx="4" fill="#111622" stroke="#38bdf8"/>
      <text x="812" y="68" text-anchor="middle" class="text-accent">&#9658; EXECUTE</text>
    </g>

    <!-- Synthesis Output -->
    <g transform="translate(24, 185)">
      <rect x="0" y="0" width="892" height="625" rx="4" class="panel-bg"/>
      <rect x="0" y="0" width="892" height="40" fill="#111622"/>
      <text x="20" y="25" class="text-accent">SYNTHESIZED RESEARCH DOSSIER</text>
      <text x="240" y="25" class="text-muted">GRAPH TIES (18)</text>
      <text x="380" y="25" class="text-muted">STATISTICAL DISTRIBUTIONS</text>
      <text x="600" y="25" class="text-muted">CITED RECORDS (6)</text>
      <text x="780" y="25" class="text-green">CONFIDENCE: HIGH</text>
      <line x1="0" y1="40" x2="892" y2="40" class="border-line"/>

      <!-- Text Response -->
      <g transform="translate(24, 65)">
        <text x="0" y="0" font-size="14" font-weight="600" fill="#f8fafc">1. Executive Investor Profile &amp; Demographics</text>
        <text x="0" y="25" class="text-body">Survey evidence demonstrates that retail investors preferring Mutual Funds are primarily in the 20-30</text>
        <text x="0" y="45" class="text-body">age cohort (65% concentration), motivated primarily by Capital Appreciation and Wealth Creation.</text>
        
        <text x="0" y="85" font-size="14" font-weight="600" fill="#f8fafc">2. Cross-Asset Portfolio Allocation Preferences</text>
        <text x="0" y="110" class="text-body">&#8226; Equity Market: Strong statistical co-occurrence with Mutual Funds (Lift = 2.45x, 24 paired observations).</text>
        <text x="0" y="130" class="text-body">&#8226; Gold / Bullion: Secondary hedge allocation chosen for capital preservation (Lift = 1.82x).</text>
        <text x="0" y="150" class="text-body">&#8226; Fixed Deposits: Negatively correlated among aggressive growth cohorts; preferred by conservative peers.</text>

        <text x="0" y="190" font-size="14" font-weight="600" fill="#f8fafc">3. Primary Decision Drivers &amp; Horizon</text>
        <text x="0" y="215" class="text-body">Investors cited "Better Returns" (72%) and "Fund Diversification" (58%) as the decisive selection factors,</text>
        <text x="0" y="235" class="text-body">with target investment horizons between 1 to 3 years and 20%-30% expected annualized yields.</text>
      </g>
    </g>
  </g>

  <!-- Right Sidebar -->
  <g transform="translate(940, 0)">
    <line x1="0" y1="0" x2="0" y2="832" class="border-line"/>
    <rect x="0" y="0" width="300" height="832" fill="#0c1017"/>
    <text x="20" y="32" class="text-title">Evidence &amp; Seeds</text>
    
    <text x="20" y="70" class="text-muted">EXTRACTED KEYWORDS</text>
    <rect x="20" y="85" width="80" height="22" rx="3" class="card-bg"/>
    <text x="60" y="100" text-anchor="middle" class="text-accent">Mutual Funds</text>
    <rect x="105" y="85" width="80" height="22" rx="3" class="card-bg"/>
    <text x="145" y="100" text-anchor="middle" class="text-accent">Investors</text>
    <rect x="190" y="85" width="70" height="22" rx="3" class="card-bg"/>
    <text x="225" y="100" text-anchor="middle" class="text-accent">Returns</text>

    <text x="20" y="140" class="text-muted">LINKED GRAPH SEEDS</text>
    <rect x="20" y="155" width="260" height="30" rx="3" class="card-bg"/>
    <text x="32" y="175" class="text-body">Avenue_Mutual_Funds (ID: 104)</text>
    <rect x="20" y="195" width="260" height="30" rx="3" class="card-bg"/>
    <text x="32" y="215" class="text-body">Objective_Wealth_Creation (ID: 42)</text>
  </g>
'''

diligence_content = '''
  <!-- Due Diligence Room -->
  <rect x="24" y="20" width="1192" height="50" rx="4" class="panel-bg"/>
  <text x="44" y="50" class="text-title">Due Diligence Dossier Generator</text>
  <text x="340" y="50" class="text-subtitle">Target: <tspan fill="#38bdf8" font-weight="600">Apple Inc. (AAPL)</tspan> | Scope: <tspan fill="#cbd5e1">Equity Due Diligence &amp; Risk Radar</tspan></text>
  <rect x="1080" y="30" width="115" height="30" rx="4" fill="#111622" stroke="#38bdf8"/>
  <text x="1137" y="50" text-anchor="middle" class="text-accent">&#128424; Export PDF</text>

  <!-- Dossier Sheet -->
  <g transform="translate(24, 90)">
    <rect x="0" y="0" width="1192" height="710" rx="4" class="panel-bg"/>
    
    <!-- Top Verified Facts Grid -->
    <g transform="translate(24, 24)">
      <rect x="0" y="0" width="560" height="110" rx="4" class="card-bg"/>
      <text x="20" y="28" class="text-green">&#10003; AUDITED BASELINE DISCLOSURES</text>
      <text x="20" y="52" class="text-body">&#8226; Audited FY2025 Revenue: $383.29B (Source: SEC Form 10-K)</text>
      <text x="20" y="74" class="text-body">&#8226; Audited Net Income: $97.00B (Operating Margin: 29.82%)</text>
      <text x="20" y="96" class="text-body">&#8226; Liquidity &amp; Solvency: $29.94B Cash vs $85.75B Debt (FCF: $99.58B)</text>

      <rect x="584" y="0" width="560" height="110" rx="4" class="card-bg"/>
      <text x="604" y="28" class="text-amber">&#9888; ANALYTICAL BOUNDARIES</text>
      <text x="604" y="52" class="text-body">&#8226; Sourced directly from audited regulatory disclosures.</text>
      <text x="604" y="74" class="text-body">&#8226; Forward-looking models do not guarantee securities performance.</text>
      <text x="604" y="96" class="text-body">&#8226; For institutional research purposes only.</text>
    </g>

    <!-- Synthesis Document -->
    <g transform="translate(24, 160)">
      <rect x="0" y="0" width="1144" height="520" rx="4" class="card-bg"/>
      <text x="24" y="36" font-size="16" font-weight="700" fill="#38bdf8">1. Executive Summary &amp; Classification</text>
      <text x="24" y="64" class="text-body">Apple Inc. (NASDAQ: AAPL) is classified as a Tier-1 Global Megacap Consumer Technology and Cloud Services</text>
      <text x="24" y="86" class="text-body">enterprise. Headquartered in Cupertino, California, the company demonstrates industry-leading operating margins (29.82%)</text>
      <text x="24" y="108" class="text-body">supported by high ecosystem switching costs and an active installed device base exceeding 2.2 billion units.</text>

      <text x="24" y="150" font-size="16" font-weight="700" fill="#38bdf8">2. Business Model &amp; Core Segments</text>
      <text x="24" y="178" class="text-body">&#8226; iPhone Ecosystem: Core cash engine generating $201.2B (52.5% of total revenue) with stable hardware replacement cycles.</text>
      <text x="24" y="200" class="text-body">&#8226; Services Division: High-margin recurring revenue stream ($85.2B, 74% gross margin) encompassing iCloud, App Store, and Apple Pay.</text>
      <text x="24" y="222" class="text-body">&#8226; Wearables &amp; Mac: Peripheral hardware portfolio generating $96.9B, creating multi-product ecosystem lock-in.</text>

      <text x="24" y="264" font-size="16" font-weight="700" fill="#38bdf8">3. Solvency &amp; Capital Allocation Quality</text>
      <text x="24" y="292" class="text-body">Free cash flow conversion remains exceptional at $99.58B (102.6% of net income). Net debt is comfortably managed at $55.8B</text>
      <text x="24" y="314" class="text-body">supported by $110.5B operating cash flow. Annual share repurchases and dividends exceed $100B, maintaining high ROIC.</text>

      <text x="24" y="356" font-size="16" font-weight="700" fill="#38bdf8">4. Risk &amp; Red-Flag Disclosures (Item 1A)</text>
      <text x="24" y="384" class="text-body">&#8226; Semiconductor fab concentration: High dependency on TSMC 3nm foundry nodes represents geopolitical supply risk.</text>
      <text x="24" y="406" class="text-body">&#8226; Regulatory scrutiny: EU Digital Markets Act and US DOJ antitrust filings challenge default search agreements and App Store margins.</text>
    </g>
  </g>
'''

options_content = '''
  <!-- Quant Derivatives Desk -->
  <rect x="24" y="20" width="1192" height="100" rx="4" class="panel-bg"/>
  <text x="44" y="44" class="text-title">Black-Scholes-Merton Option Pricing Inputs</text>

  <!-- Input fields -->
  <g transform="translate(44, 56)">
    <rect x="0" y="0" width="160" height="48" rx="4" class="card-bg"/>
    <text x="12" y="18" class="text-muted">SPOT PRICE (S)</text>
    <text x="12" y="38" class="text-title">$100.00</text>

    <rect x="180" y="0" width="160" height="48" rx="4" class="card-bg"/>
    <text x="192" y="18" class="text-muted">STRIKE (K)</text>
    <text x="192" y="38" class="text-title">$100.00</text>

    <rect x="360" y="0" width="160" height="48" rx="4" class="card-bg"/>
    <text x="372" y="18" class="text-muted">EXPIRY (DAYS)</text>
    <text x="372" y="38" class="text-title">30 Days</text>

    <rect x="540" y="0" width="160" height="48" rx="4" class="card-bg"/>
    <text x="552" y="18" class="text-muted">RISK-FREE (r)</text>
    <text x="552" y="38" class="text-title">5.00%</text>

    <rect x="720" y="0" width="160" height="48" rx="4" class="card-bg"/>
    <text x="732" y="18" class="text-muted">VOLATILITY (&#963;)</text>
    <text x="732" y="38" class="text-title">25.00%</text>

    <rect x="900" y="0" width="160" height="48" rx="4" class="card-bg"/>
    <text x="912" y="18" class="text-muted">CONTRACT</text>
    <text x="912" y="38" class="text-accent">CALL OPTION</text>
  </g>

  <!-- Valuation & Greeks -->
  <g transform="translate(24, 140)">
    <!-- Valuation Card -->
    <rect x="0" y="0" width="360" height="150" rx="4" class="panel-bg"/>
    <text x="24" y="32" class="text-muted">THEORETICAL OPTION VALUE</text>
    <text x="24" y="80" font-size="36" font-weight="700" fill="#38bdf8">$3.2144</text>
    <text x="24" y="115" class="text-subtitle">Intrinsic: $0.0000 | Time Value: $3.2144</text>
    <text x="24" y="135" class="text-amber">MONEYNESS: ATM (At the Money)</text>

    <!-- Greeks Matrix -->
    <rect x="384" y="0" width="808" height="150" rx="4" class="panel-bg"/>
    <text x="408" y="32" class="text-title">Analytical Greeks Matrix</text>
    <g transform="translate(408, 50)">
      <rect x="0" y="0" width="170" height="75" rx="4" class="card-bg"/>
      <text x="16" y="24" class="text-muted">&Delta; DELTA</text>
      <text x="16" y="55" font-size="20" font-weight="700" fill="#f8fafc">0.5364</text>

      <rect x="190" y="0" width="170" height="75" rx="4" class="card-bg"/>
      <text x="206" y="24" class="text-muted">&Gamma; GAMMA</text>
      <text x="206" y="55" font-size="20" font-weight="700" fill="#f8fafc">0.0543</text>

      <rect x="380" y="0" width="170" height="75" rx="4" class="card-bg"/>
      <text x="396" y="24" class="text-muted">&nu; VEGA</text>
      <text x="396" y="55" font-size="20" font-weight="700" fill="#2dd4bf">0.1142</text>

      <rect x="570" y="0" width="170" height="75" rx="4" class="card-bg"/>
      <text x="586" y="24" class="text-muted">&Theta; THETA</text>
      <text x="586" y="55" font-size="20" font-weight="700" fill="#f43f5e">-0.0542</text>
    </g>
  </g>

  <!-- Options Chain Matrix -->
  <g transform="translate(24, 310)">
    <rect x="0" y="0" width="1192" height="490" rx="4" class="panel-bg"/>
    <text x="24" y="30" class="text-title">Volatility Chain Ladder (S=$100, T=30d, &#963;=25%)</text>
    
    <!-- Table Header -->
    <rect x="0" y="44" width="1192" height="32" fill="#111622"/>
    <text x="30" y="65" class="text-muted">CALL VALUE</text>
    <text x="180" y="65" class="text-muted">DELTA (C)</text>
    <text x="360" y="65" class="text-accent">STRIKE (K)</text>
    <text x="540" y="65" class="text-muted">DELTA (P)</text>
    <text x="720" y="65" class="text-muted">PUT VALUE</text>
    <text x="900" y="65" class="text-muted">GAMMA</text>
    <text x="1060" y="65" class="text-muted">VEGA</text>
    <line x1="0" y1="76" x2="1192" y2="76" class="border-line"/>

    <!-- Rows -->
    <g transform="translate(30, 110)">
      <text x="0" y="0" class="text-green">$15.41</text>
      <text x="150" y="0" class="text-body">0.96</text>
      <text x="330" y="0" font-weight="600" fill="#f8fafc">$85.00</text>
      <text x="510" y="0" class="text-body">-0.04</text>
      <text x="690" y="0" class="text-body">$0.06</text>
      <text x="870" y="0" class="text-muted">0.0120</text>
      <text x="1030" y="0" class="text-muted">0.02</text>
    </g>
    <g transform="translate(30, 155)">
      <text x="0" y="0" class="text-green">$7.34</text>
      <text x="150" y="0" class="text-body">0.78</text>
      <text x="330" y="0" font-weight="600" fill="#f8fafc">$95.00</text>
      <text x="510" y="0" class="text-body">-0.22</text>
      <text x="690" y="0" class="text-body">$1.95</text>
      <text x="870" y="0" class="text-muted">0.0410</text>
      <text x="1030" y="0" class="text-muted">0.09</text>
    </g>
    <!-- ATM Row -->
    <rect x="0" y="180" width="1192" height="40" fill="#111622" fill-opacity="0.8"/>
    <g transform="translate(30, 205)">
      <text x="0" y="0" class="text-green">$3.21</text>
      <text x="150" y="0" class="text-body">0.54</text>
      <text x="330" y="0" font-weight="700" fill="#38bdf8">$100.00 (ATM)</text>
      <text x="510" y="0" class="text-body">-0.46</text>
      <text x="690" y="0" class="text-body">$2.80</text>
      <text x="870" y="0" class="text-muted">0.0543</text>
      <text x="1030" y="0" class="text-muted">0.11</text>
    </g>
    <g transform="translate(30, 255)">
      <text x="0" y="0" class="text-green">$1.12</text>
      <text x="150" y="0" class="text-body">0.26</text>
      <text x="330" y="0" font-weight="600" fill="#f8fafc">$105.00</text>
      <text x="510" y="0" class="text-body">-0.74</text>
      <text x="690" y="0" class="text-body">$5.72</text>
      <text x="870" y="0" class="text-muted">0.0380</text>
      <text x="1030" y="0" class="text-muted">0.08</text>
    </g>
  </g>
'''

settings_content = '''
  <!-- System Architecture & Telemetry -->
  <rect x="24" y="20" width="1192" height="50" rx="4" class="panel-bg"/>
  <text x="44" y="50" class="text-title">System Architecture &amp; Connectivity Diagnostics</text>

  <!-- 4 Architecture Cards -->
  <g transform="translate(24, 90)">
    <!-- Gateway -->
    <rect x="0" y="0" width="580" height="150" rx="4" class="panel-bg"/>
    <text x="24" y="36" class="text-title">FastAPI REST Gateway</text>
    <text x="500" y="36" class="text-green">PORT 8000</text>
    <text x="24" y="65" class="text-body">Status: Healthy (API v2.0.0)</text>
    <text x="24" y="90" class="text-muted">Endpoint: http://localhost:8000/api/v1</text>
    <text x="24" y="115" class="text-muted">Uvicorn ASGI Multi-Thread Worker Daemon</text>

    <!-- Embedding -->
    <rect x="612" y="0" width="580" height="150" rx="4" class="panel-bg"/>
    <text x="636" y="36" class="text-title">Semantic Vector Embedding Indexer</text>
    <text x="1100" y="36" class="text-green">ACTIVE</text>
    <text x="636" y="65" class="text-body">Model: all-MiniLM-L6-v2 (384-dim Dense Vectors)</text>
    <text x="636" y="90" class="text-muted">Device: Apple Silicon MPS / CPU Acceleration</text>
    <text x="636" y="115" class="text-muted">Fallback: 4096-dim Character n-gram Hashing</text>

    <!-- LLM -->
    <rect x="0" y="170" width="580" height="150" rx="4" class="panel-bg"/>
    <text x="24" y="206" class="text-title">Groq Cloud LLM Inference Engine</text>
    <text x="480" y="206" class="text-green">KEY CONNECTED</text>
    <text x="24" y="235" class="text-body">Active Models: qwen/qwen3.8-27b &amp; openai/gpt-oss-120b</text>
    <text x="24" y="260" class="text-muted">Rate Governor: 6,500 Tokens/Min Sliding Window</text>
    <text x="24" y="285" class="text-muted">Deterministic Temperature: 0.1 for Grounded Synthesis</text>

    <!-- Graph Storage -->
    <rect x="612" y="170" width="580" height="150" rx="4" class="panel-bg"/>
    <text x="636" y="206" class="text-title">Ontology Knowledge Graph Store</text>
    <text x="1080" y="206" class="text-green">NETWORKX ACTIVE</text>
    <text x="636" y="235" class="text-body">In-Memory NetworkX DiGraph + Co-occurrence Lift</text>
    <text x="636" y="260" class="text-muted">Node/Edge Stats: 147 Nodes, 1,144 RDF Triples, 184 Lift Ties</text>
    <text x="636" y="285" class="text-muted">Neo4j Integration: Optional sync via NEO4J_URI</text>
  </g>

  <!-- Dataset & Attribution -->
  <g transform="translate(24, 430)">
    <rect x="0" y="0" width="1192" height="370" rx="4" class="panel-bg"/>
    <text x="24" y="36" class="text-title">Audited SEC EDGAR Corporate Registry (134 XBRL Facts)</text>
    <text x="24" y="68" class="text-body">&#8226; US-GAAP Corporate Coverage: AAPL, MSFT, NVDA, AMZN, TSLA, GOOGL</text>
    <text x="24" y="92" class="text-body">&#8226; Ind-AS Corporate Coverage: RELIANCE, TCS, INFY, HDFCBANK</text>
    <text x="24" y="116" class="text-body">&#8226; Source Provenance: verified_corporate_financials.json</text>
    
    <line x1="24" y1="140" x2="1168" y2="140" class="border-line"/>
    <text x="24" y="170" class="text-title">Original Dataset Attribution &amp; MIT License</text>
    <text x="24" y="200" class="text-muted">Original codebase &amp; research created by Kabir Nagdev under the MIT License.</text>
    <text x="24" y="224" class="text-muted">Empirical investor survey data derived from Finance_data.csv (Kaggle: nitindatta/finance-data).</text>
    <text x="24" y="248" class="text-muted">Production Institutional Financial Research Workstation Redesign (2026).</text>
  </g>
'''

pages = [
    ("figma_export/svgs/01_overview_dashboard.svg", "Overview", "F1", overview_content),
    ("figma_export/svgs/02_entity_explorer.svg", "Entity Explorer", "F2", entity_explorer_content),
    ("figma_export/svgs/03_financial_intelligence.svg", "Financial Intelligence", "F3", financials_content),
    ("figma_export/svgs/04_knowledge_graph.svg", "Knowledge Graph", "F4", graph_content),
    ("figma_export/svgs/05_graphrag_copilot.svg", "GraphRAG Copilot", "F5", copilot_content),
    ("figma_export/svgs/06_due_diligence.svg", "Due Diligence Dossier", "F6", diligence_content),
    ("figma_export/svgs/07_options_desk.svg", "Options Desk", "F7", options_content),
    ("figma_export/svgs/08_system_config.svg", "System Configuration", "F8", settings_content),
]

for filename, title, hotkey, content in pages:
    generate_svg(filename, title, hotkey, content)
    print(f"Generated {filename}")

# Generate Figma Plugin files
manifest_json = '''{
  "name": "Lavaloon Terminal Workstation UI",
  "id": "lavaloon-terminal-figma-plugin",
  "api": "1.0.0",
  "main": "code.js",
  "capabilities": [],
  "enableProposedApi": false,
  "editorType": ["figma"]
}'''

with open("figma_export/figma_plugin/manifest.json", "w", encoding="utf-8") as f:
    f.write(manifest_json)
print("Generated figma_plugin/manifest.json")

code_js = '''// Figma Plugin Script: Generates all 8 Institutional Workstation Pages
figma.showUI(__html__, { visible: false });

async function createWorkstation() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  const pages = [
    { title: "01 - Overview Dashboard (F1)", subtitle: "Executive Financial Intelligence Strip & Verified Filings" },
    { title: "02 - Entity Explorer (F2)", subtitle: "3-Region Palantir Dossier (Corporates & Survey Avenues)" },
    { title: "03 - Financial Intelligence (F3)", subtitle: "Comparative Balance Sheet, Income & Cash Flow Matrix" },
    { title: "04 - Knowledge Graph (F4)", subtitle: "Palantir-style Dark Canvas with Dijkstra Pathfinder" },
    { title: "05 - GraphRAG Copilot (F5)", subtitle: "Multi-Hop BFS Synthesis with Evidentiary Triples" },
    { title: "06 - Due Diligence Dossier (F6)", subtitle: "Verified SEC 10-K & Ind-AS Disclosures & Risk Radar" },
    { title: "07 - Options Desk (F7)", subtitle: "Black-Scholes-Merton Quant Derivatives & Greeks Chain" },
    { title: "08 - System Configuration (F8)", subtitle: "Architecture Diagnostics, Model Telemetry & Registry" }
  ];

  let startX = 0;
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const frame = figma.createFrame();
    frame.name = p.title;
    frame.resize(1440, 900);
    frame.x = startX;
    frame.y = 0;
    frame.fills = [{ type: 'SOLID', color: { r: 8/255, g: 11/255, b: 17/255 } }];

    // Top Bar
    const topBar = figma.createFrame();
    topBar.name = "Top Navigation Bar";
    topBar.resize(1440, 44);
    topBar.fills = [{ type: 'SOLID', color: { r: 12/255, g: 16/255, b: 23/255 } }];
    frame.appendChild(topBar);

    // Left Sidebar
    const sidebar = figma.createFrame();
    sidebar.name = "Workstation Sidebar";
    sidebar.resize(200, 832);
    sidebar.x = 0;
    sidebar.y = 44;
    sidebar.fills = [{ type: 'SOLID', color: { r: 12/255, g: 16/255, b: 23/255 } }];
    frame.appendChild(sidebar);

    // Bottom Status Bar
    const statusBar = figma.createFrame();
    statusBar.name = "Bottom Status Bar";
    statusBar.resize(1440, 24);
    statusBar.x = 0;
    statusBar.y = 876;
    statusBar.fills = [{ type: 'SOLID', color: { r: 12/255, g: 16/255, b: 23/255 } }];
    frame.appendChild(statusBar);

    // Main Content Placeholder
    const content = figma.createFrame();
    content.name = "Main Content Canvas";
    content.resize(1240, 832);
    content.x = 200;
    content.y = 44;
    content.fills = [{ type: 'SOLID', color: { r: 8/255, g: 11/255, b: 17/255 } }];

    const heading = figma.createText();
    heading.characters = p.title;
    heading.fontSize = 20;
    heading.fontName = { family: "Inter", style: "Bold" };
    heading.fills = [{ type: 'SOLID', color: { r: 56/255, g: 189/255, b: 248/255 } }];
    heading.x = 32;
    heading.y = 32;
    content.appendChild(heading);

    const sub = figma.createText();
    sub.characters = p.subtitle;
    sub.fontSize = 13;
    sub.fontName = { family: "Inter", style: "Regular" };
    sub.fills = [{ type: 'SOLID', color: { r: 148/255, g: 163/255, b: 184/255 } }];
    sub.x = 32;
    sub.y = 64;
    content.appendChild(sub);

    frame.appendChild(content);

    startX += 1520;
  }

  figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
  figma.closePlugin("Lavaloon Terminal UI frames created successfully!");
}

createWorkstation();
'''

with open("figma_export/figma_plugin/code.js", "w", encoding="utf-8") as f:
    f.write(code_js)
print("Generated figma_plugin/code.js")
